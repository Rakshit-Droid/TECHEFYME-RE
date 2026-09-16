/**
 * Legal copy, verbatim from techefyme.com (captured 14 September 2026).
 * NOTE for the client: the privacy policy still names Netlify Forms, Google Maps
 * and ipapi.co, which the redesigned site does not use. Update before launch.
 */

type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "dl"; items: readonly { term: string; value: string; note: string }[] };

export type LegalDoc = {
  slug: "privacy-policy" | "terms" | "cancellation-refunds" | "delivery-policy";
  title: string;
  updated: string;
  sections: readonly { heading: string; blocks: readonly LegalBlock[] }[];
};

export const privacy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  updated: "Last updated: 13 July 2026",
  sections: [
    {
      heading: "1. Who We Are",
      blocks: [
        {
          type: "p",
          text: "TechefyMe Digital Services (“TechefyMe”, “we”, “us”, or “our”) is a digital services business operating in India. We provide web design, digital marketing, SEO, AI automations, GoHighLevel CRM setup, and product development services to clients globally.",
        },
        { type: "p", text: "You can reach us at: hello@techefyme.com or +91 81431 37619" },
      ],
    },
    {
      heading: "2. Information We Collect",
      blocks: [
        { type: "p", text: "We collect information you provide directly to us when you:" },
        {
          type: "ul",
          items: [
            "Fill out the contact form on our website (name, email, phone number, country, service interest, budget, timeline, and project details)",
            "Communicate with us via email, WhatsApp, or phone",
            "Enter into a service agreement with us",
          ],
        },
        {
          type: "p",
          text: "We also automatically collect your approximate country of origin via a third-party IP geolocation service (ipapi.co) solely to pre-fill the country field in our contact form. No personally identifiable information is stored from this lookup.",
        },
      ],
    },
    {
      heading: "3. How We Use Your Information",
      blocks: [
        { type: "p", text: "We use the information we collect to:" },
        {
          type: "ul",
          items: [
            "Respond to your enquiry and assess your project requirements",
            "Provide, manage, and deliver our services",
            "Send project updates, proposals, and invoices",
            "Send payment links via Razorpay to clients with whom we have an active service agreement",
            "Comply with legal obligations",
          ],
        },
        { type: "p", text: "We do not use your information for unsolicited marketing, newsletters, or promotional campaigns." },
      ],
    },
    {
      heading: "4. Third-Party Services",
      blocks: [
        { type: "p", text: "We use the following third-party processors who may handle your data:" },
        {
          type: "ul",
          items: [
            "Netlify Forms — form submission handling and storage service used to receive your contact form submissions",
            "Razorpay — payment processing platform used to send and process client payments. Razorpay's privacy policy governs data you provide directly on their payment pages",
            "Google Maps — embedded map on our contact page (subject to Google's privacy policy)",
            "ipapi.co — IP geolocation used only for country pre-fill on the contact form",
          ],
        },
      ],
    },
    {
      heading: "5. Data Sharing",
      blocks: [
        {
          type: "p",
          text: "We do not sell, rent, or share your personal information with third parties for marketing purposes. We may share your information only:",
        },
        {
          type: "ul",
          items: [
            "With service providers listed above who assist us in operating our business",
            "When required by law or to protect our legal rights",
          ],
        },
      ],
    },
    {
      heading: "6. Data Retention",
      blocks: [
        {
          type: "p",
          text: "We retain your personal information for as long as necessary to provide our services and comply with our legal obligations. If you have not entered into a service agreement with us, enquiry data is typically retained for up to 12 months.",
        },
      ],
    },
    {
      heading: "7. Cookies",
      blocks: [
        {
          type: "p",
          text: "Our website does not use tracking cookies or advertising cookies. We may use essential session cookies required for website functionality. The embedded Google Maps iframe may set cookies as per Google's own cookie policy.",
        },
      ],
    },
    {
      heading: "8. Your Rights",
      blocks: [
        { type: "p", text: "You have the right to:" },
        {
          type: "ul",
          items: [
            "Request access to the personal information we hold about you",
            "Request correction of inaccurate information",
            "Request deletion of your personal information (subject to legal obligations)",
            "Withdraw consent where processing is based on consent",
          ],
        },
        { type: "p", text: "To exercise any of these rights, contact us at hello@techefyme.com." },
      ],
    },
    {
      heading: "9. Changes to This Policy",
      blocks: [
        {
          type: "p",
          text: "We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page reflects the most recent revision. Continued use of our website after changes constitutes acceptance of the updated policy.",
        },
      ],
    },
    {
      heading: "10. Contact",
      blocks: [
        {
          type: "p",
          text: "For any privacy-related questions or requests, please contact us at hello@techefyme.com or call +91 81431 37619.",
        },
      ],
    },
  ],
};

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  updated: "Last updated: 26 April 2026",
  sections: [
    {
      heading: "1. Agreement to Terms",
      blocks: [
        {
          type: "p",
          text: "By accessing our website or engaging TechefyMe Digital Services (“TechefyMe”, “we”, “us”) for any service, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website or services.",
        },
      ],
    },
    {
      heading: "2. Services",
      blocks: [
        {
          type: "p",
          text: "TechefyMe provides digital services including web design and development, search engine optimisation (SEO), AI automations, product development, GoHighLevel (GHL) CRM setup and management, and related digital marketing services. The specific scope of services for each engagement is defined in a written proposal or service agreement.",
        },
      ],
    },
    {
      heading: "3. Proposals and Engagement",
      blocks: [
        {
          type: "p",
          text: "Any quote or proposal provided by TechefyMe is valid for 30 days from the date of issue unless otherwise stated. A proposal does not constitute a binding agreement until both parties have confirmed in writing (email confirmation is sufficient) and the agreed advance payment has been received.",
        },
      ],
    },
    {
      heading: "4. Payment Terms",
      blocks: [
        {
          type: "ul",
          items: [
            "Payment terms are specified in each project proposal.",
            "Most engagements require an advance payment (typically 50–100%) before work commences.",
            "Payments are collected via Razorpay payment links sent directly to the client.",
            "Work will not begin or continue until the agreed payment has been received.",
            "All prices are in Indian Rupees (INR) unless otherwise agreed in writing.",
            "Prices are exclusive of applicable taxes unless explicitly stated otherwise.",
          ],
        },
      ],
    },
    {
      heading: "5. Client Responsibilities",
      blocks: [
        { type: "p", text: "The client agrees to:" },
        {
          type: "ul",
          items: [
            "Provide all necessary materials, access, content, and feedback in a timely manner",
            "Ensure all content and materials provided do not infringe third-party rights",
            "Designate a single point of contact for the project",
            "Respond to review requests within 5 business days to avoid project delays",
          ],
        },
      ],
    },
    {
      heading: "6. Intellectual Property",
      blocks: [
        {
          type: "p",
          text: "Upon receipt of full and final payment, all deliverables created specifically for the client under the service agreement become the property of the client. TechefyMe retains ownership of all work until full payment is received.",
        },
        {
          type: "p",
          text: "TechefyMe reserves the right to display completed work in its portfolio unless the client requests otherwise in writing before project commencement.",
        },
        {
          type: "p",
          text: "Any third-party tools, libraries, themes, or platforms used in delivering services remain subject to their own respective licences.",
        },
      ],
    },
    {
      heading: "7. Limitation of Liability",
      blocks: [
        {
          type: "p",
          text: "TechefyMe delivers services to the best of its ability but does not guarantee specific business outcomes (e.g., revenue growth, ranking positions, lead volumes) unless explicitly agreed in writing.",
        },
        {
          type: "p",
          text: "To the maximum extent permitted by law, TechefyMe's total liability for any claim arising from our services shall not exceed the total amount paid by the client for the specific service in dispute.",
        },
      ],
    },
    {
      heading: "8. Confidentiality",
      blocks: [
        {
          type: "p",
          text: "Both parties agree to treat as confidential any proprietary or sensitive information shared during the engagement. This obligation survives the termination of the service agreement.",
        },
      ],
    },
    {
      heading: "9. Termination",
      blocks: [
        {
          type: "p",
          text: "Either party may terminate an engagement by providing written notice. In the event of termination, the client is liable for payment for all work completed up to the date of termination. Advance payments are non-refundable once work has commenced (see our Cancellation & Refunds Policy).",
        },
      ],
    },
    {
      heading: "10. Governing Law",
      blocks: [
        {
          type: "p",
          text: "These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.",
        },
      ],
    },
    {
      heading: "11. Changes to These Terms",
      blocks: [
        {
          type: "p",
          text: "We reserve the right to update these Terms at any time. The “Last updated” date reflects the most recent revision. Continued use of our services after changes constitutes acceptance.",
        },
      ],
    },
    {
      heading: "12. Contact",
      blocks: [{ type: "p", text: "For any questions regarding these Terms, contact us at hello@techefyme.com." }],
    },
  ],
};

export const refunds: LegalDoc = {
  slug: "cancellation-refunds",
  title: "Cancellation & Refunds",
  updated: "Last updated: 26 April 2026",
  sections: [
    {
      heading: "Our Policy",
      blocks: [
        {
          type: "p",
          text: "TechefyMe Digital Services provides custom digital services. Because our work is bespoke — involving research, planning, design, and development time allocated specifically to each client — our general policy is no refunds once work has commenced.",
        },
        {
          type: "p",
          text: "We are clear about scope, timelines, and deliverables before any engagement begins, and we encourage you to ask all questions upfront so there are no surprises.",
        },
      ],
    },
    {
      heading: "Cancellation Before Work Begins",
      blocks: [
        {
          type: "p",
          text: "If you wish to cancel within 24 hours of making your advance payment, and no work has commenced, you may request a full refund by contacting us at hello@techefyme.com.",
        },
        { type: "p", text: "Refund requests after 24 hours or once any work has begun will not be accepted." },
      ],
    },
    {
      heading: "No Refunds Once Work Has Begun",
      blocks: [
        {
          type: "p",
          text: "Once work has commenced on your project — including but not limited to discovery calls, research, wireframing, design, development, content creation, or any other billable activity — the fees paid are non-refundable.",
        },
        {
          type: "p",
          text: "This applies to all service types: web design, SEO, AI automations, product development, and GoHighLevel setup.",
        },
      ],
    },
    {
      heading: "Project Pauses and Abandonment",
      blocks: [
        {
          type: "p",
          text: "If a client becomes unresponsive for more than 30 days without prior notice, the project may be considered abandoned. Fees paid will not be refunded, and a restart fee may apply to resume the project.",
        },
      ],
    },
    {
      heading: "Disputes",
      blocks: [
        {
          type: "p",
          text: "If you are unsatisfied with a deliverable, please contact us at hello@techefyme.com within 7 days of delivery. We will work with you in good faith to address reasonable concerns through revisions within the agreed scope. Disputes do not entitle the client to withhold remaining payments or demand refunds for work already delivered.",
        },
      ],
    },
    {
      heading: "How to Request a Cancellation",
      blocks: [
        { type: "p", text: "To request a cancellation (within the eligible window):" },
        {
          type: "ul",
          items: [
            "Email us at hello@techefyme.com with subject line: Cancellation Request — [Your Name / Project]",
            "Include your name, project details, and reason for cancellation",
            "Eligible refunds will be processed within 7–10 business days to the original payment method",
          ],
        },
      ],
    },
  ],
};

export const delivery: LegalDoc = {
  slug: "delivery-policy",
  title: "Delivery Policy",
  updated: "Last updated: 26 April 2026",
  sections: [
    {
      heading: "Digital Delivery Only",
      blocks: [
        {
          type: "p",
          text: "TechefyMe Digital Services provides exclusively digital services. We do not ship physical products. All deliverables are delivered electronically via one or more of the following methods:",
        },
        {
          type: "ul",
          items: [
            "Shared Google Drive or cloud folder link",
            "Staging / preview URL (for websites and web applications)",
            "Direct transfer of access credentials (for platforms like GoHighLevel)",
            "Video walkthroughs and documentation shared via email or messaging",
            "Live handoff session via video call where applicable",
          ],
        },
      ],
    },
    {
      heading: "Delivery Timelines by Service",
      blocks: [
        {
          type: "p",
          text: "The following timelines are estimates from the date all required client materials and access have been received. Timelines may vary based on project complexity and are detailed in each project proposal.",
        },
        {
          type: "dl",
          items: [
            {
              term: "Web Design & Development",
              value: "7 – 21 business days",
              note: "Depending on scope and number of pages. Timelines assume timely content and feedback from the client.",
            },
            {
              term: "SEO",
              value: "Ongoing monthly",
              note: "Initial audit and strategy delivered within 5 business days of project start. Monthly reports delivered within 3 business days of each month-end.",
            },
            {
              term: "AI Automations",
              value: "5 – 14 business days",
              note: "Depending on complexity of workflows. Includes setup, testing, and handoff documentation.",
            },
            {
              term: "Product Development",
              value: "14 – 45 business days",
              note: "Custom scope. Detailed timelines and milestones are defined in the project proposal.",
            },
            {
              term: "GoHighLevel (GHL) Setup",
              value: "5 – 10 business days",
              note: "Includes CRM configuration, funnel setup, automations, and walkthrough session.",
            },
          ],
        },
      ],
    },
    {
      heading: "Client Responsibilities",
      blocks: [
        {
          type: "p",
          text: "Delivery timelines begin only after we have received all required materials from the client, including but not limited to:",
        },
        {
          type: "ul",
          items: [
            "Brand assets (logo, colours, fonts)",
            "Written content or brief",
            "Platform access and login credentials",
            "Feedback on drafts and review milestones",
          ],
        },
        {
          type: "p",
          text: "Delays caused by the client not providing required materials or feedback are not counted against our stated timelines.",
        },
      ],
    },
    {
      heading: "Revisions",
      blocks: [
        {
          type: "p",
          text: "Each project includes a defined number of revision rounds as specified in the proposal. Additional revisions beyond the agreed scope may incur extra charges.",
        },
      ],
    },
    {
      heading: "Questions",
      blocks: [
        {
          type: "p",
          text: "If you have questions about delivery of your specific project, contact us at hello@techefyme.com or +91 81431 37619.",
        },
      ],
    },
  ],
};

