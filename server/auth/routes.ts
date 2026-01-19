import type { Express } from "express";
import passport from "passport";
import { z } from "zod";
import { hashPassword, isAuthenticated } from "./auth";
import { authStorage } from "./storage";
import { storage } from "../storage";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  role: z.enum(["customer", "driver", "admin"]).default("customer"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function registerAuthRoutes(app: Express): void {
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const input = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await authStorage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check username if provided
      if (input.username) {
        const existingUsername = await authStorage.getUserByUsername(input.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const user = await authStorage.createUser({
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username || input.email.split("@")[0],
        role: input.role,
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      passport.authenticate("local", (err: any, user: Express.User, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid email or password" });
        }
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          // Remove password from response
          const { password: _, ...userWithoutPassword } = user as any;
          res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    // @ts-ignore
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Legacy logout endpoint for compatibility
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.redirect("/?error=logout_failed");
      }
      res.redirect("/");
    });
  });
}

