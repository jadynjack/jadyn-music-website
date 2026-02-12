import crypto from "crypto";

const TIKTOK_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
const PIXEL_ID = "D66PFEBC77U67PE0F0TG";

function sha256Hash(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

interface TikTokEventParams {
  event: string;
  eventId: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  pageUrl?: string;
  referrer?: string;
  contentId?: string;
  contentName?: string;
}

export async function sendTikTokEvent(params: TikTokEventParams): Promise<void> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[TikTok Events API] No access token configured, skipping server-side event");
    return;
  }

  const user: Record<string, string> = {};
  if (params.email) {
    user.email = sha256Hash(params.email);
  }
  if (params.ip) {
    user.ip = params.ip;
  }
  if (params.userAgent) {
    user.user_agent = params.userAgent;
  }

  const page: Record<string, string> = {};
  if (params.pageUrl) {
    page.url = params.pageUrl;
  }
  if (params.referrer) {
    page.referrer = params.referrer;
  }

  const eventData: Record<string, any> = {
    event: params.event,
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    user,
  };

  if (Object.keys(page).length > 0) {
    eventData.page = page;
  }

  if (params.contentId || params.contentName) {
    eventData.properties = {
      contents: [{
        content_id: params.contentId || "",
        content_type: "product",
        content_name: params.contentName || "",
      }],
    };
  }

  const body = {
    event_source: "web",
    event_source_id: PIXEL_ID,
    data: [eventData],
  };

  try {
    const response = await fetch(TIKTOK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (result.code !== 0) {
      console.error("[TikTok Events API] Error:", result.message, result);
    } else {
      console.log(`[TikTok Events API] Event '${params.event}' sent successfully (event_id: ${params.eventId})`);
    }
  } catch (error) {
    console.error("[TikTok Events API] Failed to send event:", error);
  }
}

export function getClientIp(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    ""
  );
}
