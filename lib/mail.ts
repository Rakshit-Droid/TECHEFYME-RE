import "server-only";

export type Enquiry = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  service: string;
  budget?: string;
  timeline?: string;
  details: string;
};

export type DeliveryResult = "sent" | "unconfigured" | "failed";

/**
 * Sends an enquiry to whichever destinations are configured:
 *  - FORM_WEBHOOK_URL  → POST JSON (e.g. a GoHighLevel inbound webhook)
 *  - RESEND_API_KEY    → email to ENQUIRY_TO (default hello@techefyme.com) from ENQUIRY_FROM
 * Succeeds if at least one destination accepts it.
 */
export async function deliverEnquiry(enquiry: Enquiry): Promise<DeliveryResult> {
  const webhook = process.env.FORM_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!webhook && !resendKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[enquiry] no destination configured; development submission:", enquiry);
      return "sent";
    }
    console.error("[enquiry] no destination configured (FORM_WEBHOOK_URL or RESEND_API_KEY)");
    return "unconfigured";
  }

  const attempts: Promise<boolean>[] = [];

  if (webhook) {
    attempts.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiry, source: "techefyme.com", submittedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }

  if (resendKey) {
    const to = process.env.ENQUIRY_TO || "hello@techefyme.com";
    const from = process.env.ENQUIRY_FROM || "TechefyMe <enquiries@techefyme.com>";
    const text = [
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone || "—"}`,
      `Country: ${enquiry.country || "—"}`,
      `Service: ${enquiry.service}`,
      `Budget: ${enquiry.budget || "—"}`,
      `Timeline: ${enquiry.timeline || "—"}`,
      "",
      enquiry.details,
    ].join("\n");

    attempts.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: enquiry.email,
          subject: `Enquiry — ${enquiry.service} — ${enquiry.name}`,
          text,
        }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }

  const results = await Promise.all(attempts);
  if (results.some(Boolean)) return "sent";
  console.error("[enquiry] every destination rejected the submission");
  return "failed";
}
