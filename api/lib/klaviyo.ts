// Uses Klaviyo's public client API, which is keyed by the account's public
// site ID rather than a private API key (the same mechanism Klaviyo's own
// embedded signup forms use), so no secret needs to be configured.
const KLAVIYO_COMPANY_ID = "XVyiP2";
const KLAVIYO_LIST_ID = "TVUg5Z"; // "Subscribers" — triggers the JADYN Welcome flow
const KLAVIYO_REVISION = "2024-10-15";

async function klaviyoClientPost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`https://a.klaviyo.com/client/${path}/?company_id=${KLAVIYO_COMPANY_ID}`, {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      revision: KLAVIYO_REVISION,
      "content-type": "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Klaviyo] ${path} failed: ${res.status} ${text}`);
    throw new Error(`Klaviyo ${path} failed with ${res.status}`);
  }
}

export async function subscribeToKlaviyo(email: string, marketingOptIn: boolean): Promise<void> {
  if (marketingOptIn) {
    // Subscribes to email marketing and adds to the list. The list uses double
    // opt-in, so Klaviyo emails a confirmation link first; the profile joins
    // the list (and enters the welcome flow) once they confirm.
    await klaviyoClientPost("subscriptions", {
      data: {
        type: "subscription",
        attributes: {
          custom_source: "jadynmusic.com signup",
          profile: { data: { type: "profile", attributes: { email } } },
        },
        relationships: { list: { data: { type: "list", id: KLAVIYO_LIST_ID } } },
      },
    });
    console.log(`[Klaviyo] Subscription requested for list ${KLAVIYO_LIST_ID}`);
  } else {
    // No marketing consent: record the profile only, without subscribing it.
    await klaviyoClientPost("profiles", {
      data: {
        type: "profile",
        attributes: { email, properties: { signup_source: "jadynmusic.com (no marketing consent)" } },
      },
    });
    console.log("[Klaviyo] Profile recorded without marketing consent");
  }
}
