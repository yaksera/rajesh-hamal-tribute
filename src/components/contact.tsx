"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Mail, Send } from "lucide-react";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";
import { useHydrated } from "@/lib/use-hydrated";
import { useReveal } from "@/lib/use-reveal";

type Errors = Record<string, string[]>;
type Status = "idle" | "sending" | "sent" | "unconfigured";

const input =
  "w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-cream placeholder:text-cream/40 outline-none transition-ui focus:border-red focus:bg-white/10";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const hydrated = useHydrated();
  useReveal(root);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        form.reset();
        setErrors({});
        setStatus("sent");
        requestAnimationFrame(() =>
          gsap.from("[data-sent] > *", { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.5, ease: "power2.out" }),
        );
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 && data.code === "not_configured") {
        setStatus("unconfigured");
        return;
      }
      setErrors(data);
    } catch {
      setErrors({ non_field_errors: ["Couldn't reach the server. Please email me directly."] });
    }
    setStatus("idle");
  }

  const err = (field: string) =>
    errors[field]?.[0] && (
      <p role="alert" className="mt-1.5 text-sm text-red">
        {errors[field][0]}
      </p>
    );

  return (
    <section id="contact" ref={root} className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p data-reveal className="text-sm font-semibold uppercase tracking-[0.3em] text-red">{profile.copy.contactEyebrow}</p>
          <h2 data-reveal className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            {profile.copy.contactTitle}{" "}
            <span className="font-script font-bold text-red">{profile.copy.contactTitleScript}</span>
          </h2>
          <p data-reveal className="mt-6 max-w-md text-lg text-cream/70">
            {profile.copy.contactIntro}
          </p>
          <a
            data-reveal
            href={`mailto:${profile.email}`}
            className="group mt-8 inline-flex items-center gap-3 text-2xl font-medium underline decoration-red decoration-2 underline-offset-8 transition-ui hover:text-red"
          >
            <Mail className="size-6" />
            {profile.email}
          </a>
          {profile.socials.length > 0 && (
          <ul data-reveal className="mt-10 flex flex-wrap gap-3">
            {profile.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 transition-ui hover:border-red hover:bg-red"
                >
                  {s.label}
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
          )}
        </div>

        <div data-reveal="right" className="rounded-3xl border border-white/10 bg-ink-soft p-6 sm:p-10">
          {status === "sent" ? (
            <div data-sent className="py-12 text-center">
              <CheckCircle2 className="mx-auto size-16 text-red" strokeWidth={1.5} />
              <h3 className="mt-5 text-3xl font-semibold">Message sent!</h3>
              <p className="mt-2 text-cream/70">Thanks for writing in. It means a lot.</p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-red underline underline-offset-4">
                Send another
              </button>
            </div>
          ) : status === "unconfigured" ? (
            <div className="py-12 text-center">
              <Mail className="mx-auto size-14 text-red" strokeWidth={1.5} />
              <h3 className="mt-5 text-2xl font-semibold">The form isn&rsquo;t connected yet</h3>
              <p className="mt-2 text-cream/70">Please send your message by email instead.</p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 font-semibold transition-ui hover:bg-red-deep"
              >
                Email {profile.email}
              </a>
            </div>
          ) : (
            <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <label htmlFor="c-name" className="mb-2 block text-sm text-cream/70">
                  Your name
                </label>
                <input id="c-name" name="name" required autoComplete="name" placeholder="Jane Doe" className={input} />
                {err("name")}
              </div>
              <div>
                <label htmlFor="c-email" className="mb-2 block text-sm text-cream/70">
                  Email
                </label>
                <input id="c-email" name="email" type="email" required autoComplete="email" placeholder="jane@company.com" className={input} />
                {err("email")}
              </div>
              <div>
                <label htmlFor="c-message" className="mb-2 block text-sm text-cream/70">
                  Message
                </label>
                <textarea id="c-message" name="message" required rows={5} maxLength={3000} placeholder="Tell me about your project…" className={`${input} resize-y`} />
                {err("message")}
              </div>
              {/* honeypot */}
              <div aria-hidden className="absolute -left-[9999px]">
                <label htmlFor="c-company">Company</label>
                <input id="c-company" name="company" tabIndex={-1} autoComplete="off" />
              </div>
              {err("non_field_errors")}
              <button
                type="submit"
                disabled={!hydrated || status === "sending"}
                className="group mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-red py-4 text-lg font-semibold text-white transition-ui hover:bg-red-deep disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send message"}
                <Send className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
