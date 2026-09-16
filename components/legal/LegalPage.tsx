import { Container } from "@/components/ui/Container";
import { Linkify } from "@/components/ui/Linkify";
import type { LegalDoc } from "@/content/legal";

/** Legal pages: one readable column, no motion. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article data-theme="light" className="bg-bg pt-[calc(var(--nav-h)+4rem)] pb-24 text-ink md:pt-[calc(var(--nav-h)+6rem)] md:pb-40">
      <Container>
        <div className="max-w-[64ch]">
          <p className="eyebrow text-accent">Legal</p>
          <h1 className="text-statement mt-4">{doc.title}</h1>
          <p className="text-support mt-6 text-muted">{doc.updated}</p>

          {doc.sections.map((section) => (
            <section key={section.heading} className="mt-12 border-t border-line pt-8">
              <h2 className="text-feature">{section.heading}</h2>
              {section.blocks.map((block, i) => {
                if (block.type === "p") {
                  return (
                    <p key={i} className="text-body mt-4 text-muted">
                      <Linkify text={block.text} />
                    </p>
                  );
                }
                if (block.type === "ul") {
                  return (
                    <ul key={i} className="text-body mt-4 flex list-disc flex-col gap-2 pl-5 text-muted marker:text-faint">
                      {block.items.map((item) => (
                        <li key={item}>
                          <Linkify text={item} />
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <dl key={i} className="mt-6 border-b border-line">
                    {block.items.map((item) => (
                      <div key={item.term} className="grid gap-x-6 gap-y-1 border-t border-line py-5 md:grid-cols-[1fr_12rem]">
                        <dt className="font-medium text-ink">{item.term}</dt>
                        <dd className="font-medium tabular text-ink md:text-right">{item.value}</dd>
                        <dd className="text-support text-muted md:col-span-2">{item.note}</dd>
                      </div>
                    ))}
                  </dl>
                );
              })}
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
