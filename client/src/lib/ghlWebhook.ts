type WebhookPrimitive = string | number | boolean | null | undefined;
type WebhookValue = WebhookPrimitive | WebhookPrimitive[] | Record<string, WebhookPrimitive>;
type WebhookPayload = Record<string, WebhookValue>;

export const GHL_WEBHOOKS = {
  applyForm: "https://services.leadconnectorhq.com/hooks/xoGGASKk7CCdunBbeRyk/webhook-trigger/af9656cb-e385-44ae-9a43-8e9b4d721ed7",
  websiteResourceForm: "https://services.leadconnectorhq.com/hooks/xoGGASKk7CCdunBbeRyk/webhook-trigger/f0e21266-a8d5-4741-b67f-a6316cb5f394",
  websiteCalculatorForm: "https://services.leadconnectorhq.com/hooks/xoGGASKk7CCdunBbeRyk/webhook-trigger/2924e535-3836-43ad-ad45-9f47d310736a",
  websiteToolkitForm: "https://services.leadconnectorhq.com/hooks/xoGGASKk7CCdunBbeRyk/webhook-trigger/f93f0fbd-9722-4da2-bc0e-5be87f8ab4f6",
} as const;

function appendNormalizedValue(payload: Record<string, string | number | boolean | null>, key: string, value: WebhookValue) {
  if (value === undefined) return;

  if (value === null) {
    payload[key] = null;
    return;
  }

  if (Array.isArray(value)) {
    payload[key] = value.filter(item => item !== undefined && item !== null).join(", ");
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      if (nestedValue !== undefined) {
        payload[`${key}_${nestedKey}`] = nestedValue ?? null;
      }
    });
    payload[key] = JSON.stringify(value);
    return;
  }

  payload[key] = value;
}

function normalizeWebhookPayload(payload: WebhookPayload) {
  const normalizedPayload: Record<string, string | number | boolean | null> = {};

  Object.entries({ ...payload, submittedAt: new Date().toISOString() }).forEach(([key, value]) => {
    appendNormalizedValue(normalizedPayload, key, value);
  });

  return normalizedPayload;
}

export async function sendGhlWebhookGet(url: string, payload: WebhookPayload) {
  const normalizedPayload = normalizeWebhookPayload(payload);
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    throw new Error(`GHL webhook submission failed with ${response.status}${responseText ? `: ${responseText}` : ""}`);
  }
}
