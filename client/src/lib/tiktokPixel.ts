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
  try {
    const ttq = getTTQ();
    if (!ttq) return;
    ttq.track("ViewContent", {
      contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
    });
  } catch {}
}

export function ttqClickButton(contentId: string, contentName: string) {
  try {
    const ttq = getTTQ();
    if (!ttq) return;
    ttq.track("ClickButton", {
      contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
    });
  } catch {}
}

export function ttqLead(email: string, contentId: string, contentName: string) {
  try {
    const ttq = getTTQ();
    if (!ttq) return;
    ttqIdentify(email);
    ttq.track("Lead", {
      contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
    });
  } catch {}
}
