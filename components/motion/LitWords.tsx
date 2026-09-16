import { Fragment, type CSSProperties } from "react";

/**
 * Splits text into words for ScrollLit. `from` continues the count across elements,
 * so a headline and the paragraph under it light up as one sweep.
 */
export function LitWords({ text, from = 0 }: { text: string; from?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="lit-word" style={{ "--i": from + i } as CSSProperties}>
            {word}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export const wordCount = (text: string) => text.split(" ").length;
