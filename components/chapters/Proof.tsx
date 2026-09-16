import { Avatar } from "@/components/ui/Avatar";
import { Chapter } from "@/components/ui/Chapter";
import { proof } from "@/content/chapters";

/** Twelve named people as one argument: a lead quote, then the rest on cards. */
export function Proof() {
  const [lead, ...rest] = proof.testimonials;

  return (
    <Chapter id="proof" theme="surface" eyebrow={proof.eyebrow} title={proof.title} titleId="proof-title">
      <div data-reveal="fade">
        <figure className="mx-auto max-w-[52rem] text-center">
          <blockquote className="text-feature">
            <p>“{lead.quote}”</p>
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-3">
            <Avatar name={lead.name} />
            <span className="text-support text-left">
              <span className="block font-medium text-ink">{lead.name}</span>
              <span className="block text-muted">
                {lead.role}, {lead.company}
              </span>
            </span>
          </figcaption>
        </figure>

        <ul className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((t) => (
            <li key={t.name} className="rounded-card bg-bg p-7">
              <figure className="flex h-full flex-col">
                <blockquote className="text-body flex-1">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="text-support mt-6 flex items-center gap-3">
                  <Avatar name={t.name} />
                  <span>
                    <span className="block font-medium text-ink">{t.name}</span>
                    <span className="block text-muted">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-10 text-center text-faint">{proof.more}</p>
      </div>
    </Chapter>
  );
}
