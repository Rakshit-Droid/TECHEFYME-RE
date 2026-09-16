import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacy } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: privacy.title,
  description: `${privacy.title} — TechefyMe Digital Services.`,
  path: "/privacy-policy",
});

export default function Page() {
  return <LegalPage doc={privacy} />;
}
