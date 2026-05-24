import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const insertSubscriberSchema = z.object({
  email: z.string().email().max(255).regex(emailRegex, "Invalid email format"),
  marketingOptIn: z.boolean().default(false),
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
