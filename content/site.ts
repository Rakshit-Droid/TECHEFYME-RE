/**
 * Site-wide copy. Every string is verbatim from techefyme.com unless it sits
 * under TODO_CLIENT, which is never rendered until the client approves it.
 */

export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "#contact";

export const site = {
  name: "TechefyMe Digital Services",
  shortName: "TechefyMe",
  url: "https://techefyme.com",
  slogan: "Digital marketing, web design, and automation — engineered to move revenue.",
  description:
    "A senior digital services team delivering web design, digital marketing, SEO, AI automations, and GoHighLevel CRM builds for businesses across US, UK, Australia, NZ, Europe, and the Middle East.",
  email: "hello@techefyme.com",
  phoneDisplay: "+91 81431 37619",
  phoneHref: "tel:+918143137619",
  whatsappHref:
    "https://wa.me/918143137619?text=Hey%20TechefyMe%2C%20I%E2%80%99m%20looking%20for%20help%20to%20grow%20my%20business%20and%20boost%20revenue.%20Saw%20your%20services%20and%20wanted%20to%20explore%20working%20together.%20Let%E2%80%99s%20connect.",
  smsHref:
    "sms:+918143137619?body=Hey%20TechefyMe%2C%20I%E2%80%99m%20looking%20for%20help%20to%20grow%20my%20business%20and%20boost%20revenue.%20Saw%20your%20services%20and%20wanted%20to%20explore%20working%20together.%20Let%E2%80%99s%20connect.",
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/techefyme" },
    { label: "X", href: "https://x.com/techefyme" },
    { label: "Instagram", href: "https://www.instagram.com/techefyme" },
  ],
  regionsShort: "US · ME · EU · AU · NZ · UK",
} as const;

export const nav = {
  links: [
    { label: "Services", href: "/#services", id: "services" },
    { label: "Process", href: "/#process", id: "process" },
    { label: "Regions", href: "/#regions", id: "regions" },
    { label: "FAQ", href: "/#faq", id: "faq" },
    { label: "Contact", href: "/#contact", id: "contact" },
  ],
  cta: "Book a call",
} as const;

export const hero = {
  title: "Digital services that earn their keep.",
  sub: "A senior digital team for businesses ready to grow. Web design, digital marketing, SEO, AI automations, and CRM — shipped fast and tied to real numbers.",
  primary: "Book a discovery call",
  secondary: "See services",
  videoDescription:
    "A human hand and a robotic hand reach toward each other; where they meet, a black hole opens and fills the frame.",
} as const;

export const titleCard = {
  title: "Five disciplines. One bench.",
  body: "We don’t hand you off to a junior. The same small team designs, ranks, automates, and ships.",
  metrics: [
    { value: "47", label: "engagements shipped" },
    { value: "6", label: "regions served" },
    { value: "12d", label: "avg time to launch" },
  ],
  logosLabel: "Trusted by operators in six regions",
  logos: [
    "Halston & Reeve",
    "Nordhaven Supply Co.",
    "Mercado Atlas",
    "Fieldstone Analytics",
    "Kairo Logistics",
    "Cartwright Linen",
    "Hemlock & Fern",
  ],
} as const;

export const contact = {
  eyebrow: "06 · Contact",
  title: "Tell us what you're shipping next.",
  lead: "Send a few details and we’ll reply within one business day — in your timezone. Prefer to talk now? Pick a channel below.",
  channelsLabel: "Reach us directly",
  channels: [
    { label: "Phone", value: "+91 81431 37619", note: "Speak directly with us", href: "tel:+918143137619", kind: "phone" },
    { label: "WhatsApp", value: "+91 81431 37619", note: "Fastest for quick questions", href: site.whatsappHref, kind: "whatsapp" },
    { label: "SMS", value: "+91 81431 37619", note: "Text us anytime", href: site.smsHref, kind: "sms" },
    { label: "Email", value: "hello@techefyme.com", note: "Detailed briefs welcome", href: "mailto:hello@techefyme.com", kind: "email" },
  ],
  form: {
    name: "Full name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    countryOptions: [
      "United States",
      "United Kingdom",
      "Australia",
      "New Zealand",
      "Germany",
      "France",
      "Netherlands",
      "Spain",
      "Italy",
      "United Arab Emirates",
      "Saudi Arabia",
      "Qatar",
      "Other",
    ],
    service: "Service",
    servicePlaceholder: "Pick a service",
    serviceOptions: ["Web Design", "SEO Service", "AI Automations", "Vibe Coding", "GHL Service", "Not sure yet"],
    budget: "Budget",
    budgetPlaceholder: "Select a range",
    budgetOptions: ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Flexible"],
    timeline: "Timeline",
    timelinePlaceholder: "When?",
    timelineOptions: ["ASAP", "2 – 4 weeks", "1 – 3 months", "Just exploring"],
    details: "Project details",
    detailsHint: "A paragraph is plenty — we’ll ask the rest on the call.",
    consent: "I’m okay with TechefyMe replying by email, phone, or WhatsApp. No newsletters, no reselling.",
    promise: "Fast replies, guaranteed",
    submit: "Send enquiry",
  },
} as const;

export const footer = {
  navigate: [
    { label: "Services", href: "/#services" },
    { label: "Process", href: "/#process" },
    { label: "Regions", href: "/#regions" },
    { label: "Contact", href: "/#contact" },
    { label: "Pricing", href: "/pricing" },
  ],
  reach: [
    { label: "Call Us", href: "tel:+918143137619" },
    { label: "WhatsApp", href: site.whatsappHref },
    { label: "Email Us", href: "mailto:hello@techefyme.com" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Cancellation & Refunds", href: "/cancellation-refunds" },
    { label: "Delivery Policy", href: "/delivery-policy" },
  ],
  copyright: "© 2026 TechefyMe Digital Services.",
} as const;

/** New sentences proposed during the redesign. Not rendered until approved. */
export const TODO_CLIENT = {
  bookingHelper: "",
  thanksBody: "",
} as const;
