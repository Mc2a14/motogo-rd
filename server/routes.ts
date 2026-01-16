import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // Users (Me)
  app.get(api.auth.me.path, isAuthenticated, async (req, res) => {
    // @ts-ignore
    const userId = req.user!.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // Orders
  app.get(api.orders.list.path, isAuthenticated, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get(api.orders.get.path, isAuthenticated, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      // @ts-ignore
      const userId = req.user!.claims.sub;
      const order = await storage.createOrder({ ...input, customerId: userId });
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.orders.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.orders.update.input.parse(req.body);
      const order = await storage.updateOrder(Number(req.params.id), input);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Drivers
  app.get(api.drivers.list.path, async (req, res) => {
    const drivers = await storage.getDrivers();
    res.json(drivers);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const { authStorage } = await import("./replit_integrations/auth/storage");
  const drivers = await storage.getDrivers();
  
  if (drivers.length === 0) {
    console.log("Seeding drivers...");
    const driversData = [
      {
        id: "driver-1",
        username: "motojuan",
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@motogo.com",
        role: "driver" as const,
        isOnline: true,
        currentLat: 18.4861,
        currentLng: -69.9312,
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan"
      },
      {
        id: "driver-2",
        username: "motomaria",
        firstName: "Maria",
        lastName: "Rodriguez",
        email: "maria@motogo.com",
        role: "driver" as const,
        isOnline: true,
        currentLat: 18.4900,
        currentLng: -69.9250,
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
      },
      {
        id: "driver-3",
        username: "motopedro",
        firstName: "Pedro",
        lastName: "Diaz",
        email: "pedro@motogo.com",
        role: "driver" as const,
        isOnline: true,
        currentLat: 18.4800,
        currentLng: -69.9400,
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
      }
    ];

    for (const driver of driversData) {
      await authStorage.upsertUser(driver);
    }
  }
}
