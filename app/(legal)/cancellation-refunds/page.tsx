import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { refunds } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: refunds.title,
  description: `${refunds.title} — TechefyMe Digital Services.`,
  path: "/cancellation-refunds",
});

export default function Page() {
  return <LegalPage doc={refunds} />;
}
