export function isInAppBrowser(): boolean {
  try {
    const ua = navigator.userAgent || "";
    return /TikTok|BytedanceWebview|Instagram|FBAN|FBAV|Line\//i.test(ua);
  } catch {
    return false;
  }
}

export function isTikTok(): boolean {
  try {
    const ua = navigator.userAgent || "";
    return /TikTok|BytedanceWebview/i.test(ua);
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

const APP_PACKAGES: Record<Platform, string> = {
  "spotify": "com.spotify.music",
  "apple-music": "com.apple.android.music",
  "youtube-music": "com.google.android.apps.youtube.music",
};

function getSpotifyUriScheme(url: string): string {
  const match = url.match(/(?:open\.)?spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `spotify://${match[1]}/${match[2]}`;
  }
  return "spotify://";
}

function getAndroidIntent(url: string, platform: Platform): string {
  const cleaned = url.replace(/^https?:\/\//, "");
  const pkg = APP_PACKAGES[platform];
  return `intent://${cleaned}#Intent;scheme=https;package=${pkg};end`;
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

function firePixelAndGA(trackingId: string, trackingLabel: string) {
  try {
    const ttq = (window as any).ttq;
    if (ttq) {
      ttq.track("ClickButton", {
        contents: [{ content_id: trackingId, content_type: "product", content_name: trackingLabel }],
        event_id: crypto.randomUUID(),
      });
    }
  } catch {}

  if (typeof window.gtag === "function") {
    window.gtag("event", "click", {
      event_category: "streaming_link",
      event_label: trackingLabel,
      transport_type: "beacon",
    });
  }
}

export function openSmartLink(
  url: string,
  trackingLabel: string,
  trackingId: string
) {
  if (!url) return;

  firePixelAndGA(trackingId, trackingLabel);
  sendTrackingBeacon(trackingId, trackingLabel);

  const platform = detectPlatform(url);

  if (!isInAppBrowser() || !platform) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  if (isAndroid()) {
    const intentUrl = getAndroidIntent(url, platform);
    window.location.href = intentUrl;
    setTimeout(() => {
      window.location.href = url;
    }, 2000);
    return;
  }

  if (isIOS()) {
    if (isTikTok()) {
      const redirectUrl = `/api/redirect?url=${encodeURIComponent(url)}`;
      window.location.href = redirectUrl;
    } else {
      if (platform === "spotify") {
        const scheme = getSpotifyUriScheme(url);
        window.location.href = scheme;
        setTimeout(() => {
          window.location.href = url;
        }, 1500);
      } else if (platform === "apple-music") {
        try {
          const parsed = new URL(url);
          const host = parsed.host.replace("itunes.apple.com", "music.apple.com");
          window.location.href = `music://${host}${parsed.pathname}${parsed.search}`;
          setTimeout(() => {
            window.location.href = url;
          }, 1500);
        } catch {
          window.location.href = url;
        }
      } else if (platform === "youtube-music") {
        try {
          const parsed = new URL(url);
          window.location.href = `vnd.youtube.music://${parsed.host}${parsed.pathname}${parsed.search}`;
          setTimeout(() => {
            window.location.href = url;
          }, 1500);
        } catch {
          window.location.href = url;
        }
      }
    }
    return;
  }

  window.location.href = url;
}
