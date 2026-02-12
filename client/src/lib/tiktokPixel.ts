declare global {
  interface Window {
    ttq: any;
  }
}

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getTTQ() {
  try {
    return typeof window !== "undefined" ? window.ttq : null;
  } catch {
    return null;
  }
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

export function getTtclid(): string | undefined {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("ttclid") || undefined;
  } catch {
    return undefined;
  }
}

function sendServerEvent(payload: Record<string, any>) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

export function ttqIdentify(email: string) {
  try {
    const ttq = getTTQ();
    if (!ttq) return;
    hashEmail(email).then((hashedEmail) => {
      ttq.identify({ email: hashedEmail });
    }).catch(() => {});
  } catch {}
}

export function ttqViewContent(contentId: string, contentName: string) {
  const eventId = generateEventId();

  try {
    const ttq = getTTQ();
    if (ttq) {
      ttq.track("ViewContent", {
        contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
        event_id: eventId,
      });
    }
  } catch {}

  sendServerEvent({
    event: "ViewContent",
    eventId,
    contentId,
    contentType: "product",
    contentName,
    url: window.location.href,
    ttclid: getTtclid(),
  });
}

export function ttqClickButton(contentId: string, contentName: string) {
  const eventId = generateEventId();

  try {
    const ttq = getTTQ();
    if (ttq) {
      ttq.track("ClickButton", {
        contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
        event_id: eventId,
      });
    }
  } catch {}

  sendServerEvent({
    event: "ClickButton",
    eventId,
    contentId,
    contentType: "product",
    contentName,
    url: window.location.href,
    ttclid: getTtclid(),
  });
}

export function ttqLead(email: string, contentId: string, contentName: string, eventId?: string) {
  const eid = eventId || generateEventId();

  try {
    const ttq = getTTQ();
    if (ttq) {
      ttqIdentify(email);
      ttq.track("Lead", {
        contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
        event_id: eid,
      });
    }
  } catch {}

  sendServerEvent({
    event: "Lead",
    eventId: eid,
    email,
    contentId,
    contentType: "product",
    contentName,
    url: window.location.href,
    ttclid: getTtclid(),
  });
}
