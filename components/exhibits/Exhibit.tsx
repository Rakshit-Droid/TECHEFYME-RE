import { Avatar } from "@/components/ui/Avatar";
import { Fig } from "@/components/ui/Fig";
import lighthouse from "@/content/lighthouse.json";
import type { Service } from "@/content/services";

type Props = {
  exhibit: Service["exhibit"];
  /** Mark rows for the one-time fade used when exhibits are stacked under their text. */
  revealRows?: boolean;
  className?: string;
};

/** Renders a service's artifact as a captioned figure in real, semantic HTML. */
export function Exhibit({ exhibit, revealRows = false, className = "" }: Props) {
  const row: Record<string, string> = revealRows ? { "data-reveal-item": "" } : {};

  return (
    <Fig caption={exhibit.caption} className={className}>
      <div {...(revealRows ? { "data-reveal": "exhibit" } : {})} className="h-full">
        {exhibit.kind === "handoff" && (
          <ol className="flex h-full flex-col justify-center">
            {exhibit.steps.map((step, i) => (
              <li
                key={step}
                {...row}
                className="flex items-baseline justify-between gap-4 border-t border-line py-4 first:border-t-0 md:py-5"
              >
                <span className="text-data text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-xl font-semibold tracking-[-0.02em] md:text-2xl">{step}</span>
                <span aria-hidden="true" className="text-xl text-accent md:text-2xl">
                  ›
                </span>
              </li>
            ))}
          </ol>
        )}

        {exhibit.kind === "keywords" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[18rem] border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="eyebrow pb-3 font-medium text-muted">
                    {exhibit.columns[0]}
                  </th>
                  <th scope="col" className="eyebrow pb-3 text-right font-medium text-muted">
                    {exhibit.columns[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {exhibit.rows.map((r) => (
                  <tr key={r.keyword} {...row} className="border-t border-line">
                    <th scope="row" className="text-data py-2.5 pr-4 font-medium md:py-3">
                      {r.keyword}
                    </th>
                    <td className="text-data py-2.5 text-right md:py-3">
                      <span className="text-muted">#</span>
                      {r.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {exhibit.kind === "agent" && (
          <div>
            <dl className="grid grid-cols-3 gap-4 pb-6">
              {exhibit.metrics.map((m) => (
                <div key={m.label} {...row} className="flex flex-col">
                  <dt className="eyebrow order-2 mt-2 text-muted">{m.label}</dt>
                  <dd className="order-1 text-2xl leading-none font-semibold tracking-[-0.03em] tabular md:text-[2rem]">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
            <ol className="border-t border-line">
              {exhibit.tasks.map((task, i) => (
                <li key={task} {...row} className="flex gap-4 border-b border-line py-2.5 last:border-b-0 md:py-3">
                  <span className="text-data text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-data">{task}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {exhibit.kind === "lighthouse" && <LighthouseReadout rowProps={row} />}

        {exhibit.kind === "pipeline" && (
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-4 sm:gap-4">
            {exhibit.stages.map((s) => (
              <div key={s.stage} {...row} className="border-t border-line py-3 sm:py-0 sm:pt-3">
                <p className="eyebrow flex justify-between text-muted">
                  <span>{s.stage}</span>
                  <span className="tabular">{s.people.length}</span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
                  {s.people.map((p) => (
                    <li key={p} className="text-data flex items-center gap-2 whitespace-nowrap">
                      <Avatar name={p} size={24} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Fig>
  );
}

const CATEGORIES = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["bestPractices", "Best Practices"],
  ["seo", "SEO"],
] as const;

function LighthouseReadout({ rowProps }: { rowProps: Record<string, string> }) {
  const scores = lighthouse.scores as Record<(typeof CATEGORIES)[number][0], number> | null;
  return (
    <div className="flex h-full flex-col justify-center">
      <dl className="grid grid-cols-2 gap-x-6">
        {CATEGORIES.map(([key, label]) => (
          <div key={key} {...rowProps} className="border-t border-line py-4">
            <dt className="eyebrow text-muted">{label}</dt>
            <dd className="mt-3 text-[2rem] leading-none font-semibold tracking-[-0.03em] tabular md:text-5xl">
              {scores ? scores[key] : "—"}
            </dd>
          </div>
        ))}
      </dl>
      {lighthouse.measuredAt ? (
        <p className="text-support mt-2 text-muted">
          <time dateTime={lighthouse.measuredAt}>
            {new Date(lighthouse.measuredAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </time>
        </p>
      ) : null}
    </div>
  );
}
