"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { submitEnquiry, type EnquiryField, type EnquiryState } from "@/app/actions/enquiry";
import { contact, site } from "@/content/site";
import { track } from "@/lib/analytics";

const f = contact.form;
const initial: EnquiryState = { status: "idle" };

const LABELS: Record<EnquiryField, string> = {
  name: f.name,
  email: f.email,
  phone: f.phone,
  country: f.country,
  service: f.service,
  budget: f.budget,
  timeline: f.timeline,
  details: f.details,
  consent: "Consent",
};

export function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const alertRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status !== "idle") alertRef.current?.focus();
  }, [state]);

  const onFirstFocus = () => {
    const input = startedRef.current;
    if (!input || input.value) return;
    input.value = String(Date.now());
    track("form_start");
  };

  const err = (name: EnquiryField) => state.errors?.[name];
  const val = (name: EnquiryField) => state.values?.[name];
  const describe = (name: EnquiryField, extra?: string) =>
    [err(name) ? `${name}-error` : "", extra ?? ""].filter(Boolean).join(" ") || undefined;

  const errorList = Object.entries(state.errors ?? {}) as [EnquiryField, string][];

  return (
    <form action={action} onFocusCapture={onFirstFocus} className="flex flex-col gap-3.5">
      {state.status !== "idle" ? (
        <div ref={alertRef} tabIndex={-1} role="alert" className="rounded-card bg-bg p-4 text-support outline-none">
          {state.status === "invalid" ? (
            <ul className="flex flex-col gap-1">
              {errorList.map(([name, message]) => (
                <li key={name}>
                  <a href={`#enquiry-${name}`} className="text-accent underline decoration-1 underline-offset-4">
                    {LABELS[name]}
                  </a>{" "}
                  — {message}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              We couldn’t send that just now. Email{" "}
              <a href={`mailto:${site.email}`} className="text-accent underline decoration-1 underline-offset-4">
                {site.email}
              </a>{" "}
              or call{" "}
              <a href={site.phoneHref} className="text-accent underline decoration-1 underline-offset-4">
                {site.phoneDisplay}
              </a>
              .
            </p>
          )}
        </div>
      ) : null}

      {/* Bot traps: a field humans never see, and the time the first field was focused. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

      {/* Two across, then service, budget and timeline three across, so the form fits one screen. */}
      <div className="grid gap-3 sm:grid-cols-6 sm:gap-x-3">
        <Field name="name" label={f.name} error={err("name")} className="sm:col-span-3">
          <input
            id="enquiry-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={val("name")}
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={describe("name")}
            className="field"
          />
        </Field>
        <Field name="email" label={f.email} error={err("email")} className="sm:col-span-3">
          <input
            id="enquiry-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={val("email")}
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={describe("email")}
            className="field"
          />
        </Field>
        <Field name="phone" label={f.phone} error={err("phone")} className="sm:col-span-3">
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={val("phone")}
            aria-invalid={err("phone") ? true : undefined}
            aria-describedby={describe("phone")}
            className="field"
          />
        </Field>
        <Field name="country" label={f.country} error={err("country")} className="sm:col-span-3">
          <select
            id="enquiry-country"
            name="country"
            autoComplete="country-name"
            defaultValue={val("country") ?? ""}
            aria-invalid={err("country") ? true : undefined}
            aria-describedby={describe("country")}
            className="field"
          >
            <option value="">{f.country}</option>
            {f.countryOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field name="service" label={f.service} error={err("service")} className="sm:col-span-2">
          <select
            id="enquiry-service"
            name="service"
            required
            defaultValue={val("service") ?? ""}
            aria-invalid={err("service") ? true : undefined}
            aria-describedby={describe("service")}
            className="field"
          >
            <option value="" disabled>
              {f.servicePlaceholder}
            </option>
            {f.serviceOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field name="budget" label={f.budget} error={err("budget")} className="sm:col-span-2">
          <select
            id="enquiry-budget"
            name="budget"
            defaultValue={val("budget") ?? ""}
            aria-invalid={err("budget") ? true : undefined}
            aria-describedby={describe("budget")}
            className="field"
          >
            <option value="">{f.budgetPlaceholder}</option>
            {f.budgetOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field name="timeline" label={f.timeline} error={err("timeline")} className="sm:col-span-2">
          <select
            id="enquiry-timeline"
            name="timeline"
            defaultValue={val("timeline") ?? ""}
            aria-invalid={err("timeline") ? true : undefined}
            aria-describedby={describe("timeline")}
            className="field"
          >
            <option value="">{f.timelinePlaceholder}</option>
            {f.timelineOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field name="details" label={f.details} error={err("details")}>
        <textarea
          id="enquiry-details"
          name="details"
          required
          rows={3}
          defaultValue={val("details")}
          aria-invalid={err("details") ? true : undefined}
          aria-describedby={describe("details", "details-hint")}
          className="field"
        />
        <p id="details-hint" className="mt-1 text-[0.8125rem] text-muted">
          {f.detailsHint}
        </p>
      </Field>

      <div>
        <label htmlFor="enquiry-consent" className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-snug">
          <input
            id="enquiry-consent"
            name="consent"
            type="checkbox"
            required
            defaultChecked={val("consent") === "on"}
            aria-invalid={err("consent") ? true : undefined}
            aria-describedby={err("consent") ? "consent-error" : undefined}
            className="size-5 shrink-0 accent-(--ink)"
          />
          <span className="text-muted">{f.consent}</span>
        </label>
        {err("consent") ? (
          <p id="consent-error" className="mt-2 text-[0.8125rem] text-ink">
            {err("consent")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-pill bg-accent-solid px-7 text-[1.0625rem] font-medium text-accent-ink transition-colors duration-150 ease-ui hover:bg-accent-hover disabled:opacity-40"
        >
          {f.submit}
        </button>
        <p className="eyebrow text-muted">{f.promise}</p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  className = "",
  children,
}: {
  name: EnquiryField;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`enquiry-${name}`} className="block text-[0.8125rem] font-medium text-muted">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-[0.8125rem] text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
