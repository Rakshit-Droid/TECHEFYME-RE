import { EnquiryForm } from "@/components/form/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { contact } from "@/content/site";

/** The last frame: the form on black, with the direct channels beside it. */
export function Contact() {
  return (
    <section
      id="contact"
      data-anchor=""
      data-theme="dark"
      data-nav-section="contact"
      aria-labelledby="contact-title"
      className="bg-bg py-20 text-ink md:py-28 xl:py-36"
    >
      <Container>
        <div data-reveal="statement" className="mx-auto max-w-[46rem] text-center">
          <p data-reveal-item className="eyebrow text-accent">
            {contact.eyebrow}
          </p>
          <h2 id="contact-title" data-reveal-item className="text-chapter mt-4">
            {contact.title}
          </h2>
          <p data-reveal-item className="text-lead mx-auto mt-5 max-w-[42rem] text-muted">
            {contact.lead}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-4 md:mt-20 md:gap-6">
          <div className="col-span-12 rounded-panel bg-surface p-6 md:p-10 lg:col-span-7">
            <EnquiryForm />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow text-faint">{contact.channelsLabel}</p>
            <ul className="mt-5 grid gap-3">
              {contact.channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.kind === "whatsapp"
                      ? { target: "_blank", rel: "noopener noreferrer", "data-track": "whatsapp_click" }
                      : {})}
                    className="card group flex items-baseline gap-4 px-6 py-5 transition-colors duration-150 hover:bg-line/40"
                  >
                    <span className="eyebrow w-20 shrink-0 text-faint">{c.label}</span>
                    <span>
                      <span className="block font-medium tabular">{c.value}</span>
                      <span className="text-support mt-1 block text-muted">{c.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
