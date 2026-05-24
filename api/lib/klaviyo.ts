const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = "TVUg5Z";

export async function subscribeToKlaviyo(email: string, marketingOptIn: boolean): Promise<void> {
  if (!KLAVIYO_API_KEY) {
    console.warn("[Klaviyo] KLAVIYO_API_KEY not set, skipping");
    return;
  }

  const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      revision: "2024-02-15",
      "content-type": "application/vnd.api+json",
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: marketingOptIn ? "SUBSCRIBED" : "NEVER_SUBSCRIBED",
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: "list",
              id: KLAVIYO_LIST_ID,
            },
          },
        },
      },
    }),
  });

  if (res.status === 202) {
    console.log(`[Klaviyo] Subscribed ${email} to list ${KLAVIYO_LIST_ID}`);
  } else {
    const text = await res.text();
    console.error(`[Klaviyo] Failed to subscribe: ${res.status} ${text}`);
  }
}
