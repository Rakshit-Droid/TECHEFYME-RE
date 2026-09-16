import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero, site } from "@/content/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori needs a static font file; next/font output cannot be used here.
const inter = await readFile(join(process.cwd(), "assets/fonts/Inter-SemiBold.woff"));
// The mark, white on the black card. Satori does not resolve SVG masks, so it ships as a PNG.
const markData = await readFile(join(process.cwd(), "assets/logo-skill/escape-ink-white.png"), "base64");

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#f5f5f7",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${markData}`} width="48" height="48" alt="" />
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, letterSpacing: "-0.02em" }}>{site.shortName}</div>
        </div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 92, lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: 1000 }}>
          {hero.title}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter", data: inter, style: "normal", weight: 600 }] },
  );
}
