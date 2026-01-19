import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

// Dynamic import for ESM-only package
let client: typeof import("openid-client");
let Strategy: typeof import("openid-client/passport").Strategy;
type VerifyFunction = import("openid-client/passport").VerifyFunction;
type TokenEndpointResponse = import("openid-client").TokenEndpointResponse;
type TokenEndpointResponseHelpers = import("openid-client").TokenEndpointResponseHelpers;

async function getOpenIdClient() {
  if (!client) {
    client = await import("openid-client");
  }
  return client;
}

async function getOpenIdClientPassport() {
  if (!Strategy) {
    const passportModule = await import("openid-client/passport");
    Strategy = passportModule.Strategy;
  }
  return { Strategy };
}

// Only create memoized function if REPL_ID is set
let getOidcConfig: (() => Promise<any>) | null = null;

function initializeOidcConfig() {
  if (!process.env.REPL_ID) {
    return null;
  }
  
  if (!getOidcConfig) {
    getOidcConfig = memoize(
      async () => {
        const openIdClient = await getOpenIdClient();
        return await openIdClient.Issuer.discover(
          process.env.ISSUER_URL ?? "https://replit.com/oidc"
        );
      },
      { maxAge: 3600 * 1000 }
    );
  }
  return getOidcConfig;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: TokenEndpointResponse & TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  // Skip auth setup if REPL_ID is not set (e.g., when running on Railway without Replit Auth)
  if (!process.env.REPL_ID) {
    console.warn("REPL_ID not set - skipping Replit Auth setup. Auth endpoints will not work.");
    return;
  }

  const oidcConfigFn = initializeOidcConfig();
  if (!oidcConfigFn) {
    console.warn("REPL_ID not set - skipping Replit Auth setup. Auth endpoints will not work.");
    return;
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const openIdClient = await getOpenIdClient();
  const { Strategy: StrategyClass } = await getOpenIdClientPassport();
  const issuer = await oidcConfigFn();

  const verify: VerifyFunction = async (
    tokens: TokenEndpointResponse & TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new StrategyClass(
        {
          name: strategyName,
          client: new openIdClient.Client({
            client_id: process.env.REPL_ID!,
            client_secret: process.env.REPL_APP_SECRET,
            redirect_uris: [`https://${domain}/api/callback`],
            response_types: ["code"],
          }),
          issuer: issuer,
          params: {
            scope: "openid email profile offline_access",
          },
          passReqToCallback: false,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", async (req, res) => {
    req.logout(() => {
      const endSessionUrl = issuer.endSessionUrl({
        client_id: process.env.REPL_ID!,
        post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
      });
      res.redirect(endSessionUrl);
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If REPL_ID is not set, allow all requests with a mock user (auth is disabled)
  if (!process.env.REPL_ID) {
    // Create a mock user for development/testing
    // @ts-ignore
    req.user = {
      claims: {
        sub: "mock-user",
        email: "mock@example.com",
        first_name: "Mock",
        last_name: "User",
        profile_image_url: "",
      },
      id: "mock-user",
      role: "customer", // Default role for mock user
    };
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const openIdClient = await getOpenIdClient();
    const oidcConfigFn = initializeOidcConfig();
    if (!oidcConfigFn) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const issuer = await oidcConfigFn();
    const client = new openIdClient.Client({
      client_id: process.env.REPL_ID!,
      client_secret: process.env.REPL_APP_SECRET,
      redirect_uris: [],
      response_types: ["code"],
    });
    const tokenSet = await client.refresh(refreshToken);
    updateUserSession(user, tokenSet);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
