import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { delivery } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: delivery.title,
  description: `${delivery.title} — TechefyMe Digital Services.`,
  path: "/delivery-policy",
});

export default function Page() {
  return <LegalPage doc={delivery} />;
}
