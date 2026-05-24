const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = "TVUg5Z";

export async function subscribeToKlaviyo(email: string, marketingOptIn: boolean): Promise<void> {
  if (!KLAVIYO_API_KEY) {
    console.warn("[Klaviyo] KLAVIYO_API_KEY not set, skipping");
    return;
  }

  const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      revision: "2024-02-15",
      "content-type": "application/vnd.api+json",
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email,
          properties: {
            marketing_opt_in: marketingOptIn,
          },
        },
      },
    }),
  });

  let profileId: string | null = null;

  if (profileRes.status === 201) {
    const profileData = await profileRes.json();
    profileId = profileData?.data?.id ?? null;
  } else if (profileRes.status === 409) {
    const conflictData = await profileRes.json();
    profileId = conflictData?.errors?.[0]?.meta?.duplicate_profile_id ?? null;
  } else {
    const text = await profileRes.text();
    console.error(`[Klaviyo] Failed to create profile: ${profileRes.status} ${text}`);
    return;
  }

  if (!profileId) {
    console.error("[Klaviyo] Could not determine profile ID");
    return;
  }

  const listRes = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      revision: "2024-02-15",
      "content-type": "application/vnd.api+json",
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    body: JSON.stringify({
      data: [{ type: "profile", id: profileId }],
    }),
  });

  if (listRes.status !== 204) {
    const text = await listRes.text();
    console.error(`[Klaviyo] Failed to add profile to list: ${listRes.status} ${text}`);
    return;
  }

  console.log(`[Klaviyo] Subscribed ${email} to list ${KLAVIYO_LIST_ID}`);
}
