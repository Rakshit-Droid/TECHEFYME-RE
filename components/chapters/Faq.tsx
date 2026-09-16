import type { CSSProperties, ReactNode } from "react";
import { InView } from "@/components/motion/InView";
import { Chapter } from "@/components/ui/Chapter";
import { Linkify } from "@/components/ui/Linkify";
import { LogoMark } from "@/components/ui/Logo";
import { faq } from "@/content/chapters";
import { site } from "@/content/site";

type Kind = "heart" | "star" | "thumb";

/** A few questions carry a reaction, pinned to a corner of the bubble. */
const REACTIONS: Partial<Record<string, { kind: Kind; corner: "tl" | "tr" }>> = {
  timeline: { kind: "heart", corner: "tr" },
  "discovery-call": { kind: "star", corner: "tl" },
  "existing-systems": { kind: "thumb", corner: "tr" },
};

const ICON: Record<Kind, ReactNode> = {
  heart: <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 8 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.4 3.5 4.3 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />,
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />,
  thumb: (
    <path d="M7 10.5V20H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1H7Zm2 0 3.4-6.3c.3-.5.8-.7 1.3-.7 1 0 1.8.9 1.6 1.9L14.8 9h4.4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 18 20H9v-9.5Z" />
  ),
};

/** A small badge in the site's gradient, drawn rather than a system emoji so it looks the same everywhere. */
function Reaction({ kind, corner, index }: { kind: Kind; corner: "tl" | "tr"; index: number }) {
  return (
    <span aria-hidden="true" className="faq-react" data-corner={corner} style={{ "--i": index } as CSSProperties}>
      <span className="faq-react-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
          {ICON[kind]}
        </svg>
      </span>
    </span>
  );
}

/**
 * The questions as a chat thread. Each question is a message you can open; the answer
 * arrives as a reply after a beat of typing dots. Still native disclosure underneath,
 * so it works without script and opens for find-in-page.
 */
export function Faq() {
  return (
    <Chapter
      id="faq"
      theme="dark"
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
      <InView threshold={0.2} className="faq-chat">
        {faq.items.map((item) => {
          const reaction = REACTIONS[item.id];
          const index = Object.keys(REACTIONS).indexOf(item.id);
          return (
            <details key={item.id} data-faq-id={item.id} className="faq-item">
              <summary className="faq-q">
                <h3 className="faq-q-bubble">
                  {item.q}
                  {reaction ? <Reaction kind={reaction.kind} corner={reaction.corner} index={index} /> : null}
                </h3>
                <span aria-hidden="true" className="faq-toggle">
                  <i />
                  <i />
                </span>
              </summary>
              <div className="faq-a-row">
                <span aria-hidden="true" className="faq-typing">
                  <i />
                  <i />
                  <i />
                </span>
                {/* Light tokens inside the reply, so its links keep their contrast on white. */}
                <p data-theme="light" className="faq-a">
                  <Linkify text={item.a} />
                </p>
                <span aria-hidden="true" className="faq-from">
                  <LogoMark size={14} id={`faq-mark-${item.id}`} />
                </span>
              </div>
            </details>
          );
        })}
      </InView>
    </Chapter>
  );
}
