export type Service =
  | {
      id: "web-design";
      name: string;
      statement: string;
      description: string;
      exhibit: { kind: "handoff"; caption: string; steps: readonly string[] };
    }
  | {
      id: "seo";
      name: string;
      statement: string;
      description: string;
      exhibit: {
        kind: "keywords";
        caption: string;
        columns: readonly [string, string];
        rows: readonly { keyword: string; position: number; previous?: number }[];
      };
    }
  | {
      id: "ai-automations";
      name: string;
      statement: string;
      description: string;
      exhibit: {
        kind: "agent";
        caption: string;
        metrics: readonly { value: string; label: string }[];
        tasks: readonly string[];
      };
    }
  | {
      id: "product-development";
      name: string;
      statement: string;
      description: string;
      exhibit: { kind: "lighthouse"; caption: string };
    }
  | {
      id: "ghl";
      name: string;
      statement: string;
      description: string;
      exhibit: {
        kind: "pipeline";
        caption: string;
        stages: readonly { stage: string; people: readonly string[] }[];
      };
    };

export const servicesChapter = {
  eyebrow: "01 · Services",
} as const;

export const services: readonly Service[] = [
  {
    id: "web-design",
    name: "Web Design",
    statement: "Sites that sell, not decorate.",
    description:
      "Handcrafted marketing sites, landing pages, and product surfaces — wired for conversion from the first scroll.",
    exhibit: { kind: "handoff", caption: "Fig. 1.1 — Figma → Next.js → Deploy", steps: ["Figma", "Next.js", "Deploy"] },
  },
  {
    id: "seo",
    name: "SEO",
    statement: "Rank for terms that pay.",
    description: "Technical SEO, content architecture, and link work tied to commercial keywords — not vanity traffic.",
    exhibit: {
      kind: "keywords",
      caption: "Fig. 1.2 — Tracked keywords · sample",
      columns: ["Tracked keyword", "Position"],
      rows: [
        { keyword: "web design agency dubai", position: 14 },
        { keyword: "ghl setup services", position: 9 },
        { keyword: "ai automation consultant", position: 22 },
        { keyword: "shopify seo agency uk", position: 6 },
        { keyword: "product development studio", position: 31 },
      ],
    },
  },
  {
    id: "ai-automations",
    name: "AI Automations",
    statement: "Agents that do the unglamorous work.",
    description:
      "Lead routing, inbox triage, content generation, research, reporting — built on n8n, Make, or custom agents.",
    exhibit: {
      kind: "agent",
      caption: "Fig. 1.3 — Agent run · sample",
      metrics: [
        { value: "1,247", label: "runs" },
        { value: "312h", label: "saved" },
        { value: "$8.4k", label: "recovered" },
      ],
      tasks: [
        "Triage 23 new leads from calendar + form",
        "Draft first-touch replies in Marisol's voice",
        "Route 'enterprise' tag to Priyanka's inbox",
        "Generate weekly KPI rollup for Monday stand-up",
        "Flag Stripe disputes > $400 in Slack #ops",
      ],
    },
  },
  {
    id: "product-development",
    name: "Product Development",
    statement: "Products built fast and production-ready.",
    description: "Internal tools, MVPs, micro-products — shipped in days, not quarters. Full-stack, production-grade.",
    exhibit: { kind: "lighthouse", caption: "Fig. 1.4 — Lighthouse · techefyme.com · mobile" },
  },
  {
    id: "ghl",
    name: "GHL Service",
    statement: "GoHighLevel, tuned like software.",
    description:
      "Funnels, pipelines, automations, workflows, and white-label delivery on GoHighLevel — wired to your revenue model.",
    exhibit: {
      kind: "pipeline",
      caption: "Fig. 1.5 — Pipeline · sample",
      stages: [
        { stage: "New", people: ["Marisol A."] },
        { stage: "Qualified", people: ["Ewan T-R.", "Dashiell R."] },
        { stage: "Booked", people: ["Priyanka K."] },
        { stage: "Closed", people: ["Ingrid V-H."] },
      ],
    },
  },
];
