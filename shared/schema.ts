import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull(), // Matches users.id
  driverId: varchar("driver_id"), // Matches users.id
  type: text("type", { enum: ["ride", "food", "document", "errand"] }).notNull(),
  status: text("status", { enum: ["pending", "accepted", "in_progress", "completed", "cancelled"] }).default("pending").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  pickupLat: doublePrecision("pickup_lat").notNull(),
  pickupLng: doublePrecision("pickup_lng").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  dropoffLat: doublePrecision("dropoff_lat").notNull(),
  dropoffLng: doublePrecision("dropoff_lng").notNull(),
  price: integer("price").notNull(), // In DOP
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, driverId: true });

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
