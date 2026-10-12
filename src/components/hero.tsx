"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Character, type Mood } from "./character";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [mood, setMood] = useState<Mood>("neutral");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: "power4.out" }, delay: 0.15 })
          .from("[data-hero-char]", { yPercent: 18, autoAlpha: 0, duration: 1.4, ease: "expo.out" })
          .from("[data-hero-hi]", { autoAlpha: 0, y: 20, duration: 0.7 }, 0.35)
          .fromTo(
            "[data-hero-name]",
            // Negative top/bottom insets leave room for descenders and the glow; cleared afterwards.
            { clipPath: "inset(-30% 100% -40% -5%)" },
            { clipPath: "inset(-30% 0% -40% -5%)", duration: 1.4, ease: "power2.inOut", clearProps: "clipPath" },
            0.5,
          )
          .from("[data-hero-copy]", { autoAlpha: 0, y: 20, duration: 0.8 }, 1.1)
          .from("[data-hero-cta]", { autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.1 }, 1.25);

        // Name and character drift apart a little as you scroll away.
        gsap.to("[data-hero-copy-wrap]", {
          yPercent: -35,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-char]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="grain relative isolate flex min-h-svh items-stretch overflow-hidden bg-[radial-gradient(120%_90%_at_70%_30%,var(--pf-magenta)_0%,var(--pf-red)_45%,var(--pf-red-deep)_100%)]"
    >
      <div className="mx-auto grid w-full max-w-[1240px] items-end gap-0 px-5 pt-28 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-0">
        <div data-hero-copy-wrap className="relative z-10 self-center pb-10 lg:pb-0">
          <p data-hero-hi className="text-lg font-semibold uppercase tracking-[0.3em] text-white/85">
            {profile.copy.heroGreeting}
          </p>
          <h1
            data-hero-name
            className="-ml-1 font-script text-[76px] leading-[0.95] text-white [text-shadow:0_6px_24px_rgba(80,0,10,0.35)] sm:text-[110px] lg:text-[124px]"
          >
            {profile.name}
          </h1>
          <p data-hero-copy className="mt-6 max-w-md text-lg leading-relaxed text-white/90">
            {profile.tagline}
          </p>
          {profile.disclaimer && (
            <p data-hero-copy className="mt-4 inline-flex rounded-full bg-black/20 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
              Unofficial fan tribute
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              data-hero-cta
              href={profile.copy.primaryCta.href}
              onPointerEnter={() => setMood("curious")}
              onPointerLeave={() => setMood("neutral")}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-red transition-ui hover:-translate-y-0.5 hover:bg-cream"
            >
              {profile.copy.primaryCta.label}
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              data-hero-cta
              href={profile.copy.secondaryCta.href}
              onPointerEnter={() => setMood("happy")}
              onPointerLeave={() => setMood("neutral")}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-white/90 px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-ui hover:-translate-y-0.5 hover:bg-white/10"
            >
              {profile.copy.secondaryCta.label}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div data-hero-char className="relative -mb-1 mx-auto w-full max-w-[560px] self-end">
          <Character mood={mood} className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
