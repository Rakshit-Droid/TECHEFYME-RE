import { Chapter } from "@/components/ui/Chapter";
import { Linkify } from "@/components/ui/Linkify";
import { faq } from "@/content/chapters";
import { site } from "@/content/site";

/** Native disclosure on a card. Nothing moves except the panel itself. */
export function Faq() {
  return (
    <Chapter
      id="faq"
      theme="light"
      eyebrow={faq.eyebrow}
      title={faq.title}
      titleId="faq-title"
      lead={
        <>
          {faq.leadBefore}
          <a href={`mailto:${site.email}`} className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
            {site.email}
          </a>
          {faq.leadAfter}
        </>
      }
    >
      <div className="card mx-auto max-w-[52rem] px-6 md:px-8">
        {faq.items.map((item) => (
          <details key={item.id} name="faq" data-faq-id={item.id} className="faq-item group border-b border-line last:border-b-0">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-5">
              <h3 className="text-[1.0625rem] leading-snug font-medium md:text-lg">{item.q}</h3>
              <span aria-hidden="true" className="w-5 shrink-0 text-center text-xl leading-none text-accent">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="text-body max-w-[62ch] pb-7 text-muted">
              <Linkify text={item.a} />
            </p>
          </details>
        ))}
      </div>
    </Chapter>
  );
}
