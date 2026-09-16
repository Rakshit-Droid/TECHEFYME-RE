export const pricing = {
  eyebrow: "Services",
  title: "Five disciplines. One bench.",
  lead: "Every engagement is scoped and priced on a call. Book a free discovery session and we'll put together a fixed proposal — no hidden fees, ever.",
  cta: "Book a discovery call",
  services: [
    {
      number: "01 · Service",
      name: "Web Design & Development",
      description: "Marketing sites, landing pages, and product surfaces built for conversion.",
      inclusions: [
        "Custom design (no templates)",
        "Mobile-responsive build",
        "Basic SEO setup",
        "Contact / enquiry form",
        "1 round of revisions",
      ],
    },
    {
      number: "02 · Service",
      name: "SEO",
      description: "Technical SEO, content architecture, and link work tied to commercial keywords.",
      inclusions: [
        "Initial technical audit",
        "Keyword research and targeting",
        "On-page optimisation",
        "Monthly performance report",
        "Minimum 3-month engagement",
      ],
    },
    {
      number: "03 · Service",
      name: "AI Automations",
      description:
        "Lead routing, inbox triage, reporting, and workflow automation built on n8n, Make, or custom agents.",
      inclusions: [
        "Discovery and workflow mapping",
        "Automation build and testing",
        "Handoff documentation",
        "1 month of support",
      ],
    },
    {
      number: "04 · Service",
      name: "Product Development",
      description: "Internal tools, MVPs, and micro-products — full-stack, production-grade.",
      inclusions: [
        "Requirements and scoping session",
        "Design and architecture",
        "Full-stack development",
        "Deployment and handoff",
      ],
    },
    {
      number: "05 · Service",
      name: "GoHighLevel (GHL) Setup",
      description: "Funnels, pipelines, automations, and white-label delivery on GoHighLevel.",
      inclusions: [
        "Account and pipeline setup",
        "Funnel and form build",
        "Automation workflows",
        "Walkthrough and training session",
      ],
    },
  ],
} as const;
