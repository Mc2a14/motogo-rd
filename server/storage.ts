import { db } from "./db";
import { users, orders, type User, type InsertUser, type Order, type InsertOrder } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users (Auth handled separately, but we might need these)
  getUser(id: string): Promise<User | undefined>;
  getDrivers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder & { customerId: string }): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
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
}

export const storage = new DatabaseStorage();
