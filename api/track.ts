import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendTikTokEvent, getClientIp } from "./lib/tiktokEvents.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    const { event, eventId, email, contentId, contentType, contentName, url, ttclid, value, currency } = body || {};
    if (!event || !eventId) {
      return res.status(400).json({ error: "Missing event or eventId" });
    }

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (typeof val === "string") headers.set(key, val);
    }

    sendTikTokEvent({
      event,
      eventId,
      email: email || undefined,
      ip: getClientIp(headers),
      userAgent: req.headers["user-agent"] || "",
      ttclid: ttclid || undefined,
      pageUrl: url || req.headers.referer || (req.headers.origin as string) || "",
      referrer: (req.headers.referer as string) || "",
      contentId: contentId || undefined,
      contentType: contentType || "product",
      contentName: contentName || undefined,
      value: value !== undefined ? value : undefined,
      currency: currency || undefined,
    }).catch(() => {});

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to track event" });
  }
}
