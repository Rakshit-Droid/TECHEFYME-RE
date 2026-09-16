import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/privacy-policy", "/terms", "/cancellation-refunds", "/delivery-policy"];
  return routes.map((path) => ({ url: `${site.url}${path}`, changeFrequency: "monthly", priority: path === "" ? 1 : 0.5 }));
}
