import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { sendTikTokEvent, getClientIp } from "./lib/tiktokEvents";
import { subscribeToKlaviyo } from "./lib/klaviyo";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.post("/api/subscribers", async (req, res) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email" });
      }
      const subscriber = await storage.createSubscriber(result.data);
      subscribeToKlaviyo(result.data.email, result.data.marketingOptIn ?? false).catch(() => {});
      res.json({ success: true, subscriber });
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.post("/api/track", async (req, res) => {
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

      sendTikTokEvent({
        event,
        eventId,
        email: email || undefined,
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
        ttclid: ttclid || undefined,
        pageUrl: url || req.headers.referer || req.headers.origin || "",
        referrer: req.headers.referer || "",
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
  });

  const ALLOWED_REDIRECT_HOSTS = [
    "open.spotify.com",
    "spotify.link",
    "music.apple.com",
    "itunes.apple.com",
    "music.youtube.com",
    "youtu.be",
    "www.youtube.com",
  ];

  function getDeepLinkScheme(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "open.spotify.com") {
        const match = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
        if (match) return `spotify://${match[1]}/${match[2]}`;
        return "spotify://";
      }
      if (parsed.hostname === "music.apple.com" || parsed.hostname === "itunes.apple.com") {
        return url.replace(/^https?:\/\/(music\.apple\.com|itunes\.apple\.com)/, "music://music.apple.com");
      }
      if (parsed.hostname === "music.youtube.com") {
        const videoMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (videoMatch) return `vnd.youtube.music://music.youtube.com/watch?v=${videoMatch[1]}`;
        return null;
      }
      return null;
    } catch {
      return null;
    }
  }

  app.get("/api/redirect", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) return res.redirect(302, "/");

      let parsedHostname: string;
      try {
        parsedHostname = new URL(url).hostname;
      } catch {
        return res.redirect(302, "/");
      }

      if (!ALLOWED_REDIRECT_HOSTS.includes(parsedHostname)) {
        return res.redirect(302, "/");
      }

      const ua = req.headers["user-agent"] || "";
      const isTikTok = /musical_ly|tiktok/i.test(ua);
      const isInstagram = /instagram/i.test(ua);
      const isLine = /line\//i.test(ua);
      const isInAppBrowser = isTikTok || isInstagram || isLine;
      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);

      if (isInAppBrowser) {
        const deepLink = getDeepLinkScheme(url);

        if (isAndroid) {
          const intentUrl = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
          const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Opening...</title></head>
<body>
<script>
  var deepLink = ${deepLink ? JSON.stringify(deepLink) : "null"};
  var intentUrl = ${JSON.stringify(intentUrl)};
  var fallback = ${JSON.stringify(url)};
  if (deepLink) {
    window.location.href = deepLink;
    setTimeout(function() { window.location.href = intentUrl; }, 500);
  } else {
    window.location.href = intentUrl;
  }
  setTimeout(function() { window.location.href = fallback; }, 1500);
</script>
<p>Opening your music app...</p>
</body>
</html>`;
          res.setHeader("Content-Type", "text/html");
          return res.send(html);
        }

        if (isIOS && deepLink) {
          const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Opening...</title></head>
<body>
<script>
  var deepLink = ${JSON.stringify(deepLink)};
  var fallback = ${JSON.stringify(url)};
  window.location.href = deepLink;
  setTimeout(function() { window.location.href = fallback; }, 1500);
</script>
<p>Opening your music app...</p>
</body>
</html>`;
          res.setHeader("Content-Type", "text/html");
          return res.send(html);
        }
      }

      res.redirect(302, url);
    } catch {
      const fallbackUrl = (req.query.url as string) || "/";
      res.redirect(302, fallbackUrl);
    }
  });

  return httpServer;
}
