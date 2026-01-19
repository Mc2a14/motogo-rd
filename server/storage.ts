import { db } from "./db";
import { users, orders, ratings, type User, type InsertUser, type Order, type InsertOrder, type Rating, type InsertRating } from "@shared/schema";
import { eq, desc, and, avg } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled separately, but we might need these)
  getUser(id: string): Promise<User | undefined>;
  getDrivers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByDriver(driverId: string): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder & { customerId: string }): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingByOrder(orderId: number): Promise<Rating | undefined>;
  getRatingsByDriver(driverId: string): Promise<Rating[]>;
  getDriverAverageRating(driverId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getDrivers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "driver"));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db.select()
      .from(orders)
      // @ts-ignore - Drizzle doesn't properly type enum literals
      .where(eq(orders.status, "pending" as any))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder & { customerId: string }): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }

  // Ratings
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async getRatingByOrder(orderId: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.orderId, orderId));
    return rating;
  }

  async getRatingsByDriver(driverId: string): Promise<Rating[]> {
    return await db.select()
      .from(ratings)
      .where(eq(ratings.driverId, driverId))
      .orderBy(desc(ratings.createdAt));
  }

  async getDriverAverageRating(driverId: string): Promise<number> {
    const result = await db
      .select({ avgRating: avg(ratings.rating) })
      .from(ratings)
      .where(eq(ratings.driverId, driverId));
    
    return result[0]?.avgRating ? parseFloat(result[0].avgRating) : 0;
  }
}

export const storage = new DatabaseStorage();
