import { subscribers, type Subscriber, type InsertSubscriber } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber | null>;
}

export class DatabaseStorage implements IStorage {
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber | null> {
    const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, subscriber.email));
    if (existing) return existing;
    const [newSubscriber] = await db.insert(subscribers).values(subscriber).returning();
    return newSubscriber;
  }
}

export const storage = new DatabaseStorage();
