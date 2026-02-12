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
  return typeof window !== "undefined" ? window.ttq : null;
}

export async function ttqIdentify(email: string) {
  const ttq = getTTQ();
  if (!ttq) return;
  const hashedEmail = await hashEmail(email);
  ttq.identify({ email: hashedEmail });
}

export function ttqViewContent(contentId: string, contentName: string) {
  const ttq = getTTQ();
  if (!ttq) return;
  ttq.track("ViewContent", {
    contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
  });
}

export function ttqClickButton(contentId: string, contentName: string) {
  const ttq = getTTQ();
  if (!ttq) return;
  ttq.track("ClickButton", {
    contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
  });
}

export async function ttqLead(email: string, contentId: string, contentName: string) {
  const ttq = getTTQ();
  if (!ttq) return;
  await ttqIdentify(email);
  ttq.track("Lead", {
    contents: [{ content_id: contentId, content_type: "product", content_name: contentName }],
  });
}
