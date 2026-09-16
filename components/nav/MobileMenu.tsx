"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { BOOKING_URL, nav, site } from "@/content/site";

/** A page of the document, not a tray: native <dialog>, words instead of icons. */
export function MobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const theme = document.querySelector<HTMLElement>("[data-site-header]")?.dataset.theme ?? "light";
    dialog.dataset.theme = theme;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      const opener = openerRef.current;
      // Past 1024px the opener is display:none; hand focus to the wordmark instead of <body>.
      if (opener && opener.offsetParent !== null) opener.focus();
      else document.querySelector<HTMLElement>("[data-site-header] a")?.focus();
    };
    dialog.addEventListener("close", onClose);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && dialog.open && dialog.close();
    mq.addEventListener("change", onMq);
    return () => {
      dialog.removeEventListener("close", onClose);
      mq.removeEventListener("change", onMq);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const external = BOOKING_URL.startsWith("http");

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="eyebrow inline-flex min-h-12 min-w-12 items-center justify-center px-2"
      >
        Menu
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-ink opacity-0 transition-[opacity,display,overlay] transition-discrete duration-250 ease-exit backdrop:bg-transparent open:opacity-100 open:ease-enter starting:open:opacity-0"
      >
        <div className="mx-auto flex h-full max-w-[1408px] flex-col px-5 md:px-8">
          <div className="flex h-(--nav-h) items-center justify-between">
            <Link href="/" onClick={close} aria-label={site.shortName}>
              <Logo size={24} id="tm-menu" />
            </Link>
            <button type="button" onClick={close} className="eyebrow inline-flex min-h-12 min-w-12 items-center justify-center px-2">
              Close
            </button>
          </div>

          <nav aria-label="Menu" className="mt-8">
            <ul className="border-t border-line">
              {nav.links.map((link) => (
                <li key={link.id} className="border-b border-line">
                  <Link href={link.href} onClick={close} className="block py-4 text-[2rem] font-semibold tracking-[-0.03em]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <a
              href={BOOKING_URL}
              onClick={close}
              data-track="cta_book"
              data-track-location="menu"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex h-12 items-center justify-center rounded-pill bg-cta px-6 text-[1.0625rem] font-medium text-cta-ink transition-colors duration-150 hover:bg-cta-hover"
            >
              {nav.cta}
            </a>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-support text-muted">
              <a href={site.phoneHref} className="min-h-11 content-center">
                {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="min-h-11 content-center">
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
