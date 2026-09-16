import type { CSSProperties, ReactNode } from "react";
import lighthouse from "@/content/lighthouse.json";
import type { Service } from "@/content/services";

/*
 * The five service scenes. Each is plain server-rendered HTML whose motion is a CSS
 * function of one custom property, --dp (0 to 1), which ServicesRail writes from the
 * scroll position. So a scene builds as its panel arrives and rewinds on the way
 * back, and every number and label in it is already in the page for assistive tech.
 */

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** The window every scene sits in: chrome dots, the figure caption, a cursor light. */
function DemoWindow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="demo-window">
      <div className="demo-chrome" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="demo-body">{children}</div>
      <figcaption className="demo-caption">{caption}</figcaption>
    </figure>
  );
}

/** Web Design: a Figma frame that becomes a built page, then ships. */
function WebDemo({ exhibit }: { exhibit: Extract<Service["exhibit"], { kind: "handoff" }> }) {
  return (
    <DemoWindow caption={exhibit.caption}>
      <div className="demo-web">
        <ol className="demo-web-steps">
          {exhibit.steps.map((step, i) => (
            <li key={step} style={vars({ "--s": i })}>
              <span className="demo-web-step-dot" aria-hidden="true" />
              {step}
            </li>
          ))}
        </ol>
        <div className="demo-web-canvas" aria-hidden="true">
          <div className="demo-web-nav">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="demo-web-hero">
            <span className="demo-web-line demo-web-line--xl" />
            <span className="demo-web-line demo-web-line--lg" />
            <span className="demo-web-line demo-web-line--sm" />
            <span className="demo-web-button" />
            <span className="demo-web-select">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="demo-web-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="demo-web-deploy" aria-hidden="true">
          <span className="demo-web-deploy-bar" />
          <span className="demo-web-deploy-check">✓</span>
        </div>
      </div>
    </DemoWindow>
  );
}

/** SEO: the tracked terms arrive row by row, each placed on a top-40 rank meter. */
function SeoDemo({ exhibit }: { exhibit: Extract<Service["exhibit"], { kind: "keywords" }> }) {
  return (
    <DemoWindow caption={exhibit.caption}>
      <table className="demo-seo">
        <thead>
          <tr>
            <th scope="col">{exhibit.columns[0]}</th>
            <td aria-hidden="true" />
            <th scope="col">{exhibit.columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {exhibit.rows.map((row, i) => (
            <tr key={row.keyword} style={vars({ "--r": i, "--pos": row.position })} data-top={row.position <= 10 ? "" : undefined}>
              <th scope="row">{row.keyword}</th>
              <td aria-hidden="true" className="demo-seo-meter">
                <span className="demo-seo-track">
                  <span className="demo-seo-top" />
                  <span className="demo-seo-dot" />
                </span>
              </td>
              <td className="demo-seo-pos">#{row.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DemoWindow>
  );
}

/** AI Automations: an agent run, counting its totals while it works down the task list. */
function AgentDemo({ exhibit }: { exhibit: Extract<Service["exhibit"], { kind: "agent" }> }) {
  return (
    <DemoWindow caption={exhibit.caption}>
      <div className="demo-agent">
        <dl className="demo-agent-metrics">
          {exhibit.metrics.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>
                <span className="sr-only">{m.value}</span>
                <span aria-hidden="true" data-count={m.value}>
                  {m.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <ol className="demo-agent-tasks">
          {exhibit.tasks.map((task, i) => (
            <li key={task} style={vars({ "--k": i })}>
              <span className="demo-agent-state" aria-hidden="true">
                <span className="demo-agent-spin" />
                <span className="demo-agent-done">✓</span>
              </span>
              <span className="demo-agent-text">{task}</span>
            </li>
          ))}
        </ol>
      </div>
    </DemoWindow>
  );
}

const CATEGORIES = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["bestPractices", "Best Practices"],
  ["seo", "SEO"],
] as const;

/** Product Development: this site's own Lighthouse scores, filling their rings. */
function LighthouseDemo({ exhibit }: { exhibit: Extract<Service["exhibit"], { kind: "lighthouse" }> }) {
  const scores = lighthouse.scores as Record<(typeof CATEGORIES)[number][0], number>;
  return (
    <DemoWindow caption={exhibit.caption}>
      <dl className="demo-lh">
        {CATEGORIES.map(([key, label], i) => (
          <div key={key} style={vars({ "--k": i, "--score": scores[key] })}>
            <dd>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" pathLength={100} className="demo-lh-track" />
                <circle cx="50" cy="50" r="42" pathLength={100} className="demo-lh-ring demo-lh-halo" />
                <circle cx="50" cy="50" r="42" pathLength={100} className="demo-lh-ring" />
              </svg>
              <span className="sr-only">{scores[key]}</span>
              <span aria-hidden="true" className="demo-lh-score" data-count={String(scores[key])}>
                {scores[key]}
              </span>
            </dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>
      <p className="demo-lh-date">
        <time dateTime={lighthouse.measuredAt}>
          {new Date(lighthouse.measuredAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </time>
      </p>
    </DemoWindow>
  );
}

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s-]/gu, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** GHL: contacts start piled in the first stage and glide to where they stand. */
function PipelineDemo({ exhibit }: { exhibit: Extract<Service["exhibit"], { kind: "pipeline" }> }) {
  let k = 0;
  return (
    <DemoWindow caption={exhibit.caption}>
      <div className="demo-pipe">
        {exhibit.stages.map((stage, col) => (
          <div key={stage.stage} className="demo-pipe-col">
            <p className="demo-pipe-head">
              <span>{stage.stage}</span>
              <span>{stage.people.length}</span>
            </p>
            <ul>
              {stage.people.map((person, row) => (
                <li key={person} style={vars({ "--col": col, "--row": row, "--k": k++ })}>
                  <span className="demo-pipe-avatar" aria-hidden="true">
                    {initials(person)}
                  </span>
                  {person}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DemoWindow>
  );
}

export function ServiceDemo({ exhibit }: { exhibit: Service["exhibit"] }) {
  switch (exhibit.kind) {
    case "handoff":
      return <WebDemo exhibit={exhibit} />;
    case "keywords":
      return <SeoDemo exhibit={exhibit} />;
    case "agent":
      return <AgentDemo exhibit={exhibit} />;
    case "lighthouse":
      return <LighthouseDemo exhibit={exhibit} />;
    case "pipeline":
      return <PipelineDemo exhibit={exhibit} />;
  }
}
