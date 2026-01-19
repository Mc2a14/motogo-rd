import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL and add SSL if needed (Railway requires SSL)
const connectionConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Railway PostgreSQL requires SSL in production
if (process.env.NODE_ENV === "production") {
  // Check if SSL is already configured in the connection string
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("sslmode=")) {
    // Add SSL configuration for Railway
    connectionConfig.ssl = {
      rejectUnauthorized: false, // Railway uses self-signed certificates
    };
  }
}

export const pool = new Pool(connectionConfig);

// Handle connection errors gracefully
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

// Test the connection
pool.connect()
  .then((client) => {
    console.log("Database connection established");
    client.release();
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message);
    // Don't throw - let the app start and handle errors at request time
  });

export const db = drizzle(pool, { schema });
