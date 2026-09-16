import { EnquiryForm } from "@/components/form/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { contact } from "@/content/site";
import { RobotScene } from "./RobotScene";

/**
 * The last frame, sized to one screen on a desktop. The statement, the direct channels and
 * the form sit on the left; the robot stands clear in the right half of the section,
 * looking toward the pointer anywhere in the section. On narrow screens it is left out.
 */
export function Contact() {
  return (
    <section
      id="contact"
      data-anchor=""
      data-theme="dark"
      data-nav-section="contact"
      data-robot-scope=""
      aria-labelledby="contact-title"
      className="contact relative isolate overflow-clip bg-bg py-16 text-ink md:py-20 lg:py-12"
    >
      <RobotScene />
      {/* Above the robot's stage, which runs under the right edge of the form. */}
      <Container className="relative z-[1]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <div>
            <div data-reveal="statement">
              <p data-reveal-item className="eyebrow text-accent">
                {contact.eyebrow}
              </p>
              <h2 id="contact-title" data-reveal-item className="contact-title mt-3">
                {contact.title}
              </h2>
              <p data-reveal-item className="mt-2.5 max-w-[40rem] text-[0.9375rem] leading-relaxed text-muted">
                {contact.lead}
              </p>
            </div>
            {/* The lead ends "Pick a channel below", so the channels come straight after it. */}
            <ul aria-label={contact.channelsLabel} className="mt-4 flex flex-wrap gap-2">
              {contact.channels.map((c) => {
                // WhatsApp and SMS share the phone number, so only phone and email show a value.
                const showValue = c.kind === "phone" || c.kind === "email";
                return (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      title={`${c.value} · ${c.note}`}
                      {...(c.kind === "whatsapp"
                        ? { target: "_blank", rel: "noopener noreferrer", "data-track": "whatsapp_click" }
                        : {})}
                      className="contact-link"
                    >
                      <span className="contact-link-label">{c.label}</span>
                      <span className={showValue ? "tabular" : "sr-only"}>{c.value}</span>
                      <span className="sr-only">, {c.note}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
