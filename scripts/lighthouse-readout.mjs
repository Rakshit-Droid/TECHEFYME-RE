// Runs Lighthouse (mobile, 3 runs) against a URL and writes the median category
// scores to content/lighthouse.json for Fig. 1.4. Fails if any category is below 95,
// because the figure is only published when it is true.
//
//   node scripts/lighthouse-readout.mjs https://techefyme.com
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://localhost:3100";
const runs = Number(process.env.RUNS ?? 3);
const dir = mkdtempSync(join(tmpdir(), "lh-"));
const cli = join("node_modules", "lighthouse", "cli", "index.js");
const keys = { performance: "performance", accessibility: "accessibility", bestPractices: "best-practices", seo: "seo" };
const results = [];

for (let i = 0; i < runs; i++) {
  const out = join(dir, `run-${i}.json`);
  try {
    execFileSync(process.execPath, [cli, url, "--quiet", "--output=json", `--output-path=${out}`, "--chrome-flags=--headless=new"], {
      stdio: ["ignore", "ignore", "pipe"],
    });
  } catch (err) {
    // On Windows chrome-launcher can fail to delete its temp profile after the report is written.
    if (!existsSync(out)) throw err;
  }
  const report = JSON.parse(readFileSync(out, "utf8"));
  results.push(Object.fromEntries(Object.entries(keys).map(([k, id]) => [k, Math.round(report.categories[id].score * 100)])));
  console.log(`run ${i + 1}:`, results.at(-1), `LCP ${Math.round(report.audits["largest-contentful-paint"].numericValue)}ms CLS ${report.audits["cumulative-layout-shift"].numericValue.toFixed(3)} TBT ${Math.round(report.audits["total-blocking-time"].numericValue)}ms`);
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const scores = Object.fromEntries(Object.keys(keys).map((k) => [k, median(results.map((r) => r[k]))]));
console.log("median:", scores);

const failing = Object.entries(scores).filter(([, v]) => v < 95);
if (failing.length) {
  console.error("Not publishing: below 95 →", failing);
  process.exit(1);
}

writeFileSync(
  "content/lighthouse.json",
  JSON.stringify({ measuredAt: new Date().toISOString().slice(0, 10), url: "https://techefyme.com", formFactor: "mobile", scores }, null, 2) + "\n",
);
console.log("wrote content/lighthouse.json");
