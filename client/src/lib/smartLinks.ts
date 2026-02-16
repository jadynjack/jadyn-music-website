export function isInAppBrowser(): boolean {
  try {
    const ua = navigator.userAgent || "";
    return /TikTok|BytedanceWebview|Instagram|FBAN|FBAV|Line\//i.test(ua);
  } catch {
    return false;
  }
}

function detectPlatform(url: string): string | null {
  if (url.includes("spotify.com") || url.includes("spotify.link")) return "spotify";
  if (url.includes("music.apple.com") || url.includes("itunes.apple.com")) return "apple-music";
  if (url.includes("music.youtube.com") || url.includes("youtu.be")) return "youtube-music";
  return null;
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

  if (isInAppBrowser() && platform) {
    window.location.href = `/api/redirect?url=${encodeURIComponent(url)}`;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
