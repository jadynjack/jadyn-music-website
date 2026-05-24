import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export * from "./models/auth";

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  email: text("email").notNull().unique(),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const insertSubscriberSchema = z.object({
  email: z.string().email().max(255).regex(emailRegex, "Invalid email format"),
  marketingOptIn: z.boolean().default(false),
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
