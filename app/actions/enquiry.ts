"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { contact } from "@/content/site";
import { deliverEnquiry } from "@/lib/mail";

const f = contact.form;

const optional = <T extends z.ZodType>(schema: T) => z.union([schema, z.literal("")]).optional();

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.email("Please enter a valid email address.").max(200),
  phone: optional(z.string().trim().max(40)),
  country: optional(z.enum(f.countryOptions)),
  service: z.enum(f.serviceOptions, { error: "Please pick a service." }),
  budget: optional(z.enum(f.budgetOptions)),
  timeline: optional(z.enum(f.timelineOptions)),
  details: z.string().trim().min(10, "A sentence or two about the project is enough.").max(5000),
  consent: z.literal("on", { error: "Please confirm we can reply to you." }),
});

export type EnquiryField = keyof z.infer<typeof schema>;

export type EnquiryState = {
  status: "idle" | "invalid" | "unavailable";
  errors?: Partial<Record<EnquiryField, string>>;
  values?: Partial<Record<EnquiryField, string>>;
};

const MIN_FILL_MS = 3000;

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Bots: a filled honeypot gets a silent success.
  if (String(formData.get("website") ?? "").length > 0) redirect("/thanks");

  const raw = Object.fromEntries(
    (["name", "email", "phone", "country", "service", "budget", "timeline", "details", "consent"] as const).map((k) => [
      k,
      String(formData.get(k) ?? ""),
    ]),
  ) as Record<EnquiryField, string>;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<EnquiryField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as EnquiryField;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "invalid", errors, values: raw };
  }

  // A valid form completed faster than a person can type is treated as a bot, silently.
  const startedAt = Number(formData.get("startedAt"));
  if (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) redirect("/thanks");

  const { name, email, phone, country, service, budget, timeline, details } = parsed.data;
  const result = await deliverEnquiry({ name, email, phone, country, service, budget, timeline, details });
  if (result !== "sent") return { status: "unavailable", values: raw };

  redirect("/thanks");
}
