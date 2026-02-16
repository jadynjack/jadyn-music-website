import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoteSchema, insertSubscriberSchema, updateStreamStatsSchema, updateSiteSettingsSchema, updateCharitiesSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { sendTikTokEvent, getClientIp } from "./lib/tiktokEvents";

const isAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.claims.email;
  
  // SECURITY: If ADMIN_EMAIL is not set, deny all admin access
  if (!adminEmail) {
    return res.status(403).json({ message: "Forbidden: Admin not configured" });
  }
  
  // Case-insensitive email comparison for security
  if (userEmail?.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  
  await storage.initializeCharities();
  await storage.initializeStreamStats();
  await storage.initializeSiteSettings();

  app.get("/api/charities", async (req, res) => {
    try {
      const charities = await storage.getCharities();
      const voteCounts = await storage.getVoteCounts();
      const totalVotes = voteCounts.reduce((sum, c) => sum + c.count, 0);
      
      const charitiesWithPercentage = charities.map(charity => {
        const voteData = voteCounts.find(v => v.charityId === charity.id);
        const count = voteData?.count || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          id: charity.id,
          name: charity.name,
          voteCount: count,
          percentage
        };
      });
      
      res.json(charitiesWithPercentage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charities" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const result = insertVoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid vote data" });
      }

      const hasVoted = await storage.hasVoted(result.data.email);
      if (hasVoted) {
        return res.status(400).json({ error: "Email has already voted" });
      }

      const vote = await storage.createVote(result.data);
      
      // Also add voter to subscribers to preserve email if votes are reset
      await storage.createSubscriber({
        email: result.data.email,
        marketingOptIn: result.data.marketingOptIn || false,
      });

      const charities = await storage.getCharities();
      const voteCounts = await storage.getVoteCounts();
      const totalVotes = voteCounts.reduce((sum, c) => sum + c.count, 0);
      
      const charitiesWithPercentage = charities.map(charity => {
        const voteData = voteCounts.find(v => v.charityId === charity.id);
        const count = voteData?.count || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          id: charity.id,
          name: charity.name,
          voteCount: count,
          percentage
        };
      });

      res.json({ success: true, charities: charitiesWithPercentage });
    } catch (error) {
      res.status(500).json({ error: "Failed to record vote" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email" });
      }

      const subscriber = await storage.createSubscriber(result.data);
      res.json({ success: true, subscriber });
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.get("/api/stream-stats", async (req, res) => {
    try {
      const stats = await storage.getStreamStats();
      const totalStreams = stats.spotifyStreams + stats.appleMusicStreams + stats.youtubeMusicStreams;
      const dollarsRaised = Math.floor(totalStreams / 100) * 5;
      res.json({ ...stats, totalStreams, dollarsRaised });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream stats" });
    }
  });

  app.post("/api/stream-stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateStreamStatsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid stream stats data" });
      }

      const stats = await storage.updateStreamStats(result.data);
      const totalStreams = stats.spotifyStreams + stats.appleMusicStreams + stats.youtubeMusicStreams;
      const dollarsRaised = Math.floor(totalStreams / 100) * 5;
      res.json({ success: true, stats: { ...stats, totalStreams, dollarsRaised } });
    } catch (error) {
      res.status(500).json({ error: "Failed to update stream stats" });
    }
  });

  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  app.post("/api/site-settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateSiteSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid site settings data" });
      }

      const settings = await storage.updateSiteSettings(result.data);
      res.json({ success: true, settings });
    } catch (error) {
      res.status(500).json({ error: "Failed to update site settings" });
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { event, eventId, email, contentId, contentType, contentName, url, ttclid, value, currency } = req.body;
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
        return `music://music.apple.com${parsed.pathname}${parsed.search}`;
      }
      if (parsed.hostname === "music.youtube.com") {
        return `vnd.youtube.music://${parsed.hostname}${parsed.pathname}${parsed.search}`;
      }
    } catch {}
    return null;
  }

  function getChromeIntentUrl(url: string): string {
    return `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  }

  app.get("/api/redirect", async (req, res) => {
    try {
      const { url } = req.query as { url?: string };
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      let parsed: URL;
      try {
        parsed = new URL(url);
        if (!ALLOWED_REDIRECT_HOSTS.includes(parsed.hostname)) {
          return res.status(400).json({ error: "Redirect target not allowed" });
        }
      } catch {
        return res.status(400).json({ error: "Invalid URL" });
      }

      const ua = req.headers["user-agent"] || "";
      const isAndroid = /Android/i.test(ua);
      const isIOS = /iPad|iPhone|iPod/i.test(ua);

      const deepLink = getDeepLinkScheme(url);
      const chromeIntent = isAndroid ? getChromeIntentUrl(url) : null;

      const escapedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedDeepLink = deepLink ? deepLink.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
      const escapedChromeIntent = chromeIntent ? chromeIntent.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

      const platformName = parsed.hostname.includes("spotify") ? "Spotify"
        : parsed.hostname.includes("apple") ? "Apple Music"
        : parsed.hostname.includes("youtube") ? "YouTube Music"
        : "the app";

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Opening ${platformName}...</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#050608;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
.container{max-width:320px}
.spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:#1DB954;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 24px}
@keyframes spin{to{transform:rotate(360deg)}}
h1{font-size:18px;font-weight:600;margin-bottom:8px;opacity:0.9}
p{font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:24px;line-height:1.5}
.btn{display:inline-block;padding:14px 32px;background:rgba(255,255,255,0.1);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;border:1px solid rgba(255,255,255,0.1);transition:background .2s}
.btn:active{background:rgba(255,255,255,0.2)}
</style>
</head>
<body>
<div class="container">
<div class="spinner"></div>
<h1>Opening ${platformName}...</h1>
<p>If the app doesn't open automatically, tap the button below.</p>
<a class="btn" id="fallback" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">Open in ${platformName}</a>
</div>
<script>
(function(){
  var webUrl = "${escapedUrl}";
  var deepLink = "${escapedDeepLink}";
  var chromeIntent = "${escapedChromeIntent}";
  var isAndroid = ${isAndroid};
  var isIOS = ${isIOS};
  var opened = false;

  function openExternal() {
    if (opened) return;
    opened = true;
    try {
      var w = window.open(webUrl, '_blank');
      if (!w) window.location.href = webUrl;
    } catch(e) {
      window.location.href = webUrl;
    }
  }

  if (isAndroid) {
    if (chromeIntent) {
      window.location.href = chromeIntent;
    } else {
      openExternal();
    }
  } else if (isIOS && deepLink) {
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    setTimeout(function() {
      window.location.href = deepLink;
    }, 100);

    setTimeout(openExternal, 2000);
  } else {
    openExternal();
  }
})();
</script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch {
      const fallbackUrl = (req.query.url as string) || "/";
      res.redirect(302, fallbackUrl);
    }
  });

  app.post("/api/charities/update", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateCharitiesSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid charities data" });
      }

      const charities = await storage.updateCharities(result.data.charities);
      res.json({ success: true, charities });
    } catch (error) {
      res.status(500).json({ error: "Failed to update charities" });
    }
  });

  return httpServer;
}
