import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/footer/Footer";
import { Intro } from "@/components/intro/Intro";
import { Nav } from "@/components/nav/Nav";
import { site } from "@/content/site";
import { HEAD_SCRIPT } from "@/lib/hero-gate";
import { INTRO_HEAD_SCRIPT } from "@/lib/intro";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.shortName,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Pre-paint, so a single inline script. Browser extensions often put their own
            <script> at the top of <head> before React hydrates, and React then pairs this
            element with theirs. Its content is a constant, so any mismatch here is foreign
            and harmless: the script has already run. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `${INTRO_HEAD_SCRIPT};${HEAD_SCRIPT}` }} />
      </head>
      <body className="relative">
        <Intro />
        <div aria-hidden="true" data-scroll-sentinel className="pointer-events-none absolute top-0 left-0 h-2 w-px" />
        <a
          href="#main"
          className="eyebrow fixed top-2 left-2 z-[60] -translate-y-20 rounded-xs bg-cta px-4 py-3 text-cta-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
