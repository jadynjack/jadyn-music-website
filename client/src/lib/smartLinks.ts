import { ttqClickButton } from "./tiktokPixel";

export function isInAppBrowser(): boolean {
  try {
    const ua = navigator.userAgent || "";
    return /TikTok|BytedanceWebview|Instagram|FBAN|FBAV|Line\//i.test(ua);
  } catch {
    return false;
  }
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

type Platform = "spotify" | "apple-music" | "youtube-music";

function detectPlatform(url: string): Platform | null {
  if (url.includes("spotify.com") || url.includes("spotify.link")) return "spotify";
  if (url.includes("music.apple.com") || url.includes("itunes.apple.com")) return "apple-music";
  if (url.includes("music.youtube.com") || url.includes("youtu.be")) return "youtube-music";
  return null;
}

function getSpotifyDeepLink(url: string): string | null {
  const match = url.match(
    /(?:open\.)?spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/
  );
  if (match) {
    return `spotify://${match[1]}/${match[2]}`;
  }
  return `spotify://`;
}

function getAppleMusicDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace("itunes.apple.com", "music.apple.com");
    return `music://${host}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function getYouTubeMusicDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (isAndroid()) {
      return `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=https;package=com.google.android.apps.youtube.music;end`;
    }
    return `vnd.youtube.music://${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function getDeepLink(url: string, platform: Platform): string | null {
  switch (platform) {
    case "spotify":
      return getSpotifyDeepLink(url);
    case "apple-music":
      return getAppleMusicDeepLink(url);
    case "youtube-music":
      return getYouTubeMusicDeepLink(url);
  }
}

function sendTrackingBeacon(trackingId: string, trackingLabel: string) {
  try {
    const payload = JSON.stringify({
      event: "ClickButton",
      eventId: crypto.randomUUID(),
      contentId: trackingId,
      contentType: "product",
      contentName: trackingLabel,
      url: window.location.href,
      ttclid: (() => {
        try {
          return new URLSearchParams(window.location.search).get("ttclid") || undefined;
        } catch {
          return undefined;
        }
      })(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

export function openSmartLink(
  url: string,
  trackingLabel: string,
  trackingId: string
) {
  try {
    const ttq = (window as any).ttq;
    if (ttq) {
      ttq.track("ClickButton", {
        contents: [{ content_id: trackingId, content_type: "product", content_name: trackingLabel }],
        event_id: crypto.randomUUID(),
      });
    }
  } catch {}

  sendTrackingBeacon(trackingId, trackingLabel);

  if (typeof window.gtag === "function") {
    window.gtag("event", "click", {
      event_category: "streaming_link",
      event_label: trackingLabel,
      transport_type: "beacon",
    });
  }

  setTimeout(() => {
    if (!url) return;

    const platform = detectPlatform(url);

    if (!isInAppBrowser() || !platform) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const deepLink = getDeepLink(url, platform);

    if (deepLink) {
      window.location.href = deepLink;

      setTimeout(() => {
        if (isAndroid()) {
          window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        } else {
          window.location.href = url;
        }
      }, 1500);
    } else {
      if (isAndroid()) {
        window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
      } else {
        window.location.href = url;
      }
    }
  }, 100);
}
