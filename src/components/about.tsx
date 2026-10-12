"use client";

import { useRef } from "react";
import { MapPin } from "lucide-react";
import { profile } from "@/content/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/use-reveal";

export function About() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Infinite skills marquee.
        gsap.to("[data-marquee]", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

        // Count stats up when they appear.
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: Number(el.dataset.count),
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => (el.textContent = String(Math.round(obj.v))),
          });
        });

        // Timeline line draws as you scroll.
        gsap.fromTo(
          "[data-timeline-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: { trigger: "[data-timeline]", start: "top 75%", end: "bottom 60%", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const skills = [...profile.skills, ...profile.skills];

  return (
    <section id="about" ref={root} className="relative border-y border-white/10 bg-ink-soft py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-16 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p data-reveal className="text-sm font-semibold uppercase tracking-[0.3em] text-red">{profile.copy.aboutEyebrow}</p>
          <h2 data-reveal className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {profile.copy.aboutTitle}{" "}
            <span className="font-script text-5xl font-bold text-red sm:text-6xl">{profile.copy.aboutTitleScript}</span>
          </h2>
          {profile.about.map((para) => (
            <p key={para.slice(0, 20)} data-reveal className="mt-6 text-lg leading-relaxed text-cream/75">
              {para}
            </p>
          ))}
          <p data-reveal className="mt-6 inline-flex items-center gap-2 text-muted">
            <MapPin className="size-4" /> {profile.location}
            {profile.available && (
              <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Open to work
              </span>
            )}
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4">
            {profile.stats.map((s) => (
              <div key={s.label} data-reveal className="rounded-2xl border border-white/10 p-5">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-4xl font-semibold text-white sm:text-5xl">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-red">{s.suffix}</span>
                </dd>
                <dd aria-hidden className="mt-2 text-sm text-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-timeline className="relative">
          <p data-reveal className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">{profile.copy.experienceLabel}</p>
          <ol className="relative mt-6 border-l border-white/10 pl-8">
            <span data-timeline-line aria-hidden className="absolute -left-px top-0 h-full w-px bg-red" />
            {profile.experience.map((job) => (
              <li key={job.period + job.title} data-reveal="right" className="relative pb-10 last:pb-0">
                <span aria-hidden className="absolute -left-[38px] top-1.5 size-3.5 rounded-full border-2 border-red bg-ink" />
                <p className="text-sm text-muted">{job.period}</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {job.title} <span className="text-cream/50">· {job.company}</span>
                </h3>
                <p className="mt-2 leading-relaxed text-cream/70">{job.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-y border-white/10 py-6" aria-label={profile.copy.skillsLabel}>
        <ul data-marquee className="flex w-max gap-4">
          {skills.map((s, i) => (
            <li
              key={`${s}-${i}`}
              aria-hidden={i >= profile.skills.length || undefined}
              className="whitespace-nowrap rounded-full border border-white/15 px-6 py-3 text-lg text-cream/85"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
