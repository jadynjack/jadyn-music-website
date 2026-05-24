import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { subscribeToKlaviyo } from "./lib/klaviyo.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const insertSubscriberSchema = z.object({
  email: z.string().email().max(255).regex(emailRegex, "Invalid email format"),
  marketingOptIn: z.boolean().default(false),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = insertSubscriberSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid email" });
    }

    await subscribeToKlaviyo(result.data.email, result.data.marketingOptIn ?? false);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to subscribe" });
  }
}
