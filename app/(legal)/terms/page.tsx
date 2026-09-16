import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { terms } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: terms.title,
  description: `${terms.title} — TechefyMe Digital Services.`,
  path: "/terms",
});

export default function Page() {
  return <LegalPage doc={terms} />;
}
