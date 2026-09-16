export const process = {
  eyebrow: "02 · Process",
  title: "How we actually ship.",
  lead: "Four phases, zero ambiguity. Every week has a deliverable. Every deliverable has a metric attached.",
  phases: [
    {
      number: "01",
      name: "Discover",
      description: "We learn your revenue model, your funnel, and the three metrics you actually lose sleep over.",
      deliverables: ["Revenue model & funnel audit", "3 north-star metrics defined", "Competitor gap analysis", "Scope & timeline locked"],
    },
    {
      number: "02",
      name: "Design",
      description: "A brand-aligned system, not a template. Typography, motion, and data patterns that survive scale.",
      deliverables: ["Brand system documentation", "Motion language spec", "Component library scaffold", "Typography & spacing scale"],
    },
    {
      number: "03",
      name: "Build",
      description: "Shipped in public. Daily Loom updates, live staging URL, and a shared Linear for every ticket.",
      deliverables: ["Daily Loom progress updates", "Live staging URL from day one", "Shared Linear board access", "Lighthouse 95+ on every push"],
    },
    {
      number: "04",
      name: "Iterate",
      description: "30 days of measured tweaks post-launch — we stay on until the numbers move.",
      deliverables: ["A/B tests & heatmap analysis", "Conversion rate optimisation", "Metric baseline vs target", "30-day post-launch retro"],
    },
  ],
} as const;

export const whyUs = {
  eyebrow: "03 · Why us",
  title: "Not your average agency.",
  alternative: "The Alternative",
  us: "TechefyMe",
  usNote: "How we work",
  rows: [
    {
      label: "Design approach",
      alternative: "Template-based, refreshed when you complain",
      us: "Custom brand systems built around your funnel",
    },
    {
      label: "Progress visibility",
      alternative: "Updates only when you chase them",
      us: "Live staging + daily Loom from day one",
    },
    { label: "Post-launch", alternative: "Handed over a ZIP and gone", us: "30 days of measured iteration, included" },
    {
      label: "Success metrics",
      alternative: "Vague traffic and lead volume targets",
      us: "Every deliverable ships with a number attached",
    },
    { label: "Market fit", alternative: "One-size-fits-all global templates", us: "Region-aware execution across six markets" },
  ],
} as const;

/**
 * Timezone anchors are assumptions until the client names real locations
 * (inputs table, item 9). Only the region code and name are shown.
 */
export const regions = {
  title: "Six regions. One studio.",
  lead: "Work follows the clock: we keep coverage across every timezone you ship in.",
  list: [
    { code: "US", name: "United States", timeZone: "America/New_York" },
    { code: "ME", name: "Middle East", timeZone: "Asia/Dubai" },
    { code: "EU", name: "Europe", timeZone: "Europe/Berlin" },
    { code: "AU", name: "Australia", timeZone: "Australia/Sydney" },
    { code: "NZ", name: "New Zealand", timeZone: "Pacific/Auckland" },
    { code: "UK", name: "United Kingdom", timeZone: "Europe/London" },
  ],
} as const;

export const proof = {
  eyebrow: "04 · Proof",
  title: "Teams that kept us on after launch.",
  more: "+ 40 more engagements across six regions",
  testimonials: [
    {
      quote:
        "The rebuild moved our trial-to-paid from 7.4% to 11.8% in six weeks. No marketing spend changed. The landing just finally matches what we actually do.",
      name: "Marisol Abenoja",
      role: "Head of Growth",
      company: "Nordhaven Supply Co.",
    },
    {
      quote:
        "They ripped out five Make scenarios, rebuilt them as one agent in n8n, and cut our ops cost by $1,800 a month. Shipped in four days.",
      name: "Ewan Tomlin-Reyes",
      role: "Founder",
      company: "Fieldstone Analytics",
    },
    {
      quote:
        "Patient intake used to be three tools duct-taped together. They replaced it with one flow that handles 200 forms a day without a single manual touch.",
      name: "Hiroshi Okafor-Lane",
      role: "CTO",
      company: "Stratford Clinical",
    },
    {
      quote:
        "Our demo page looked like a 2019 SaaS template. The redesign pulled in two enterprise deals the first month — deals we'd chased for a year.",
      name: "Emilia Vanden Berg",
      role: "VP Marketing",
      company: "Kielder Bio",
    },
    {
      quote:
        "Custom GHL build tracking every shipment from bid to invoice. Sales stopped living in spreadsheets. Close rate up 34% in the first quarter.",
      name: "Daniyar Oralbek",
      role: "COO",
      company: "Caspian Freight",
    },
    {
      quote:
        "They didn't try to sell us anything we didn't need. Three-page site, one automation, and it outperformed the old stack on every metric we track.",
      name: "Willa Ngata-Franks",
      role: "Founder",
      company: "Tūrangi Organic",
    },
    {
      quote:
        "I watched them scope, price, and ship a full CRM migration inside two weeks. I've been quoted six months for the same thing. Twice.",
      name: "Rafael Cordeiro-Steyn",
      role: "Director",
      company: "Bluewater Consulting",
    },
    {
      quote:
        "The n8n agent they built auto-qualifies every inbound lead against six criteria. We stopped hiring the second SDR we had budgeted.",
      name: "Sabine Lindqvist",
      role: "Head of RevOps",
      company: "Halden Group",
    },
    {
      quote:
        "I have worked with three agencies on GHL before this. This was the first time the system actually mapped to how we sell.",
      name: "Priyanka Katara",
      role: "COO",
      company: "Mercado Atlas",
    },
    {
      quote:
        "Clear scope, honest timelines, and a working demo at the end of every week. It sounds obvious. In this industry, it really isn't.",
      name: "Tomás Alarcón-Reid",
      role: "Product Lead",
      company: "Porthaven Labs",
    },
    {
      quote:
        "The new site doubled our studio inquiries in the first month. The old one had been live for three years and we thought it was fine.",
      name: "Noor Al-Hassan",
      role: "Founder",
      company: "Thalia Interiors",
    },
    {
      quote:
        "Replaced a six-person ticket queue with two agents and a dashboard. Nobody got laid off — they moved to work that actually needs a human.",
      name: "Kenji Maitland-Oyebade",
      role: "Ops Manager",
      company: "Arcline Freight",
    },
  ],
} as const;

export const faq = {
  eyebrow: "05 · Questions",
  title: "Things people ask before signing.",
  leadBefore: "If something’s still unclear, send it to ",
  leadAfter: " and we’ll reply within one business day.",
  items: [
    {
      id: "timeline",
      q: "How long does a typical project take?",
      a: "Most landing pages ship in 2–3 weeks. Full marketing sites and CRM builds run 4–8 weeks. AI automation projects depend on scope but usually 1–4 weeks. Every engagement starts with a fixed timeline you sign off on.",
    },
    {
      id: "fixed-price",
      q: "Do you offer fixed-price quotes?",
      a: "Yes. Every project is scoped on a discovery call and quoted as a fixed proposal — no hourly billing, no surprise invoices.",
    },
    {
      id: "regions",
      q: "Which regions and timezones do you serve?",
      a: "Active clients across the US, UK, Australia, New Zealand, Europe, and the Middle East. We work in your timezone — calls, replies, and standups are scheduled around your working hours.",
    },
    {
      id: "discovery-call",
      q: "What happens on the discovery call?",
      a: "A 30-minute scoping conversation: your goals, current stack, what's blocking growth, and what success looks like. You leave with a clear next-step recommendation, whether or not you work with us.",
    },
    {
      id: "support",
      q: "Do you provide ongoing support after launch?",
      a: "Yes. Every build ships with a support window (1 month standard, longer on retainer). For SEO and AI automation, ongoing engagement is the default — minimum 3 months for SEO so the work has time to compound.",
    },
    {
      id: "existing-systems",
      q: "Can you work with our existing systems (GHL, HubSpot, n8n, etc.)?",
      a: "Yes. We integrate with most modern CRMs and automation platforms. The discovery call covers your current stack and where the new work plugs in.",
    },
    {
      id: "payment",
      q: "How does payment work?",
      a: "50% to start, 50% on delivery for fixed-scope projects. Retainers are billed monthly. We invoice in your local currency where possible.",
    },
    {
      id: "performance",
      q: "What if the work doesn't perform?",
      a: "We scope every engagement against measurable outcomes (conversion rate, qualified leads, hours saved). If the agreed metric isn't moving after the first milestone, we revisit scope before more work ships. Detailed cancellation terms live on /cancellation-refunds.",
    },
  ],
} as const;
