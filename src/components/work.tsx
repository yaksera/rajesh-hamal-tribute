"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { profile, type Project } from "@/content/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/use-reveal";

export function Work() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="work" ref={root} className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p data-reveal className="text-sm font-semibold uppercase tracking-[0.3em] text-red">{profile.copy.workEyebrow}</p>
          <h2 data-reveal className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
            {profile.copy.workTitle}{" "}
            <span className="font-script text-6xl font-bold text-red sm:text-7xl">{profile.copy.workTitleScript}</span>
          </h2>
        </div>
        <p data-reveal className="max-w-sm text-muted">
          {profile.copy.workIntro}
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2">
        {profile.projects.map((p, i) => (
          <ProjectCard key={p.title} project={p} index={i} />
        ))}
      </ul>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const card = useRef<HTMLLIElement>(null);

  // Tilt toward the pointer and move a soft spotlight with it.
  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
        const el = card.current!;
        const inner = el.querySelector("[data-tilt]");
        const rx = gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power3.out" });
        const ry = gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power3.out" });
        gsap.set(inner, { transformPerspective: 900 });
        const move = contextSafe!((e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const px = (e.clientX - b.left) / b.width;
          const py = (e.clientY - b.top) / b.height;
          ry((px - 0.5) * 10);
          rx((0.5 - py) * 8);
          el.style.setProperty("--mx", `${px * 100}%`);
          el.style.setProperty("--my", `${py * 100}%`);
        });
        const leave = contextSafe!(() => {
          rx(0);
          ry(0);
        });
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: card },
  );

  const external = project.href.startsWith("http");

  return (
    <li ref={card} data-reveal={index % 2 ? "right" : "left"} className="group">
      <a
        href={project.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="block focus-visible:outline-none"
      >
        <div
          data-tilt
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-soft p-7 transition-ui group-hover:border-white/25 group-focus-visible:border-red sm:p-9"
        >
          {/* spotlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(420px circle at var(--mx,50%) var(--my,50%), ${project.accent}55, transparent 60%)` }}
          />
          <div
            aria-hidden
            className="relative mb-8 flex aspect-[16/9] items-end overflow-hidden rounded-2xl p-6"
            style={{ background: `linear-gradient(135deg, ${project.accent}, #0f0d0e 120%)` }}
          >
            <span className="absolute -right-4 -top-10 font-script text-[180px] leading-none text-white/10">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="relative text-3xl font-semibold text-white/95 sm:text-4xl">{project.title}</span>
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">{project.kind}</p>
              <h3 className="mt-1 text-2xl font-semibold">{project.title}</h3>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-ink transition-ui group-hover:bg-red group-hover:text-white">
              <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </div>
          <p className="relative mt-4 leading-relaxed text-cream/75">{project.description}</p>
          <ul className="relative mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li key={t} className="rounded-full border border-white/15 px-3 py-1 text-xs text-cream/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </a>
    </li>
  );
}
