import type { ComponentProps } from "react";

/** 1280px content column with 20 / 32 / 64px outer margins. */
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[1408px] px-5 md:px-8 xl:px-16 ${className}`} {...props} />;
}
