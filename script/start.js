// Startup script that runs migrations and then starts the server
import { execSync } from "child_process";

console.log("🚀 Starting MotoGo RD...");

// Run database migrations
console.log("📦 Running database migrations...");
try {
  execSync("npx drizzle-kit push", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ Database migrations completed");
} catch (error) {
  console.error("⚠️  Migration failed (continuing anyway):", error.message);
  // Continue - app might still work if tables already exist
}

// Start the server
console.log("🌐 Starting server...");
execSync("node dist/index.cjs", {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

