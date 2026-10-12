"use client";

import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { profile } from "@/content/profile";
import { BACK_HAIR, LOCK_LEFT, LOCK_RIGHT, MANE, TEMPLE_LEFT, TEMPLE_RIGHT } from "./character-paths";

export type Mood = "neutral" | "happy" | "curious";

type Props = {
  mood?: Mood;
  className?: string;
};

/**
 * Parallax amounts (in SVG units) for a pointer at the edge of the range.
 * Layers move by different amounts so the flat drawing reads as a head turning in 3D.
 */
const RANGE = {
  head: { x: 14, y: 10, rotate: 6 },
  features: { x: 18, y: 13 },
  iris: { x: 7, y: 6 },
  bangs: { x: 7, y: 4 },
  ears: { x: -7, y: 0 },
  backHair: { x: -10, y: -5 },
  body: { x: 4, y: 0 },
};

const IDLE_AFTER_MS = 3500;

/** A code-drawn character whose head and eyes follow the pointer. */
export function Character({ mood = "neutral", className = "" }: Props) {
  const root = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const c = profile.character;
  const long = c.hairStyle === "long";
  const swept = c.hairStyle === "swept";
  const rugged = c.face === "rugged";

  useGSAP(
    (_, contextSafe) => {
      const svg = root.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 0 : 0.7;

      // One quickTo per layer/axis: cheap to call on every pointer event.
      const movers = Object.entries(RANGE).flatMap(([layer, range]) =>
        Object.entries(range).map(([prop, amount]) => ({
          prop,
          amount,
          set: gsap.quickTo(svg.querySelectorAll(`[data-layer="${layer}"]`), prop, {
            duration: dur,
            ease: "power3.out",
          }),
        })),
      );
      // `y` follows the vertical offset; `x` and `rotate` follow the horizontal one.
      const lookAt = (nx: number, ny: number) => {
        movers.forEach((m) => m.set((m.prop === "y" ? ny : nx) * m.amount));
      };

      // Pointer → normalised offset from the character's face.
      let idleTimer = 0;
      let idleTl: gsap.core.Timeline | null = null;
      const stopIdle = () => {
        idleTl?.kill();
        idleTl = null;
      };
      const startIdle = () => {
        if (reduce) return;
        stopIdle();
        idleTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        const points = [
          [-0.6, -0.1],
          [0.1, 0.2],
          [0.7, -0.3],
          [0, 0],
        ];
        points.forEach(([x, y]) => idleTl!.call(() => lookAt(x, y)).to({}, { duration: 1.6 }));
      };

      const onMove = contextSafe!((e: PointerEvent) => {
        const box = svg.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height * 0.38; // roughly the eyes
        const nx = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (window.innerWidth * 0.45));
        const ny = gsap.utils.clamp(-1, 1, (e.clientY - cy) / (window.innerHeight * 0.45));
        stopIdle();
        lookAt(nx, ny);
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(startIdle, IDLE_AFTER_MS);
      });

      window.addEventListener("pointermove", onMove, { passive: true });
      idleTimer = window.setTimeout(startIdle, 1500);

      // Natural, irregular blinking.
      let blinkTimer = 0;
      const blink = () => {
        if (!reduce) {
          gsap.fromTo(
            "[data-eye]",
            { scaleY: 1 },
            { scaleY: 0.08, duration: 0.07, yoyo: true, repeat: Math.random() < 0.2 ? 3 : 1, ease: "power1.in", transformOrigin: "50% 50%" },
          );
        }
        blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 3200);
      };
      blinkTimer = window.setTimeout(blink, 1800);

      // Breathing.
      if (!reduce) {
        gsap.to("[data-breathe]", { y: 3, scaleY: 1.008, transformOrigin: "50% 100%", duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-strand]", { rotate: 2.5, transformOrigin: "50% 0%", duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.3 });
      }

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.clearTimeout(idleTimer);
        window.clearTimeout(blinkTimer);
        stopIdle();
      };
    },
    { scope: root },
  );

  // Expressions.
  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const q = gsap.utils.selector(svg);
    const d = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35;
    const happy = mood === "happy";
    const curious = mood === "curious";
    gsap.to(q("[data-brow]"), { y: happy ? -7 : curious ? -4 : 0, duration: d, ease: "back.out(2)" });
    gsap.to(q("[data-brow-right]"), { rotate: curious ? -8 : 0, transformOrigin: "50% 50%", duration: d });
    gsap.to(q("[data-mouth='smile']"), { autoAlpha: happy ? 0 : 1, duration: d * 0.6 });
    gsap.to(q("[data-mouth='open']"), { autoAlpha: happy ? 1 : 0, duration: d * 0.6 });
    gsap.to(q("[data-blush]"), { opacity: happy ? 0.6 : 0.32, duration: d });
    gsap.to(q("[data-lower-lid]"), { y: happy ? -6 : 0, duration: d });
  }, [mood]);

  const eye = (cx: number, side: "l" | "r") => {
    const e = rugged
      ? { rx: 19, ry: 13, cy: 240, iris: 11, pupil: 5.5, glint: 3, lidY: 258, lidRx: 26, lidRy: 10 }
      : { rx: 22, ry: 25, cy: 238, iris: 16.5, pupil: 8, glint: 5, lidY: 276, lidRx: 30, lidRy: 14 };
    const s = side === "l" ? -1 : 1;
    return (
      <g data-eye>
        <clipPath id={`${uid}-eye-${side}`}>
          <ellipse cx={cx} cy={e.cy} rx={e.rx} ry={e.ry} />
        </clipPath>
        <ellipse cx={cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#fffaf6" />
        <g clipPath={`url(#${uid}-eye-${side})`}>
          <g data-layer="iris">
            <circle cx={cx} cy={e.cy + 2} r={e.iris} fill={c.eyes} />
            <circle cx={cx} cy={e.cy + 2} r={e.iris} fill={`url(#${uid}-iris)`} />
            <circle cx={cx} cy={e.cy + 2} r={e.pupil} fill="#120a07" />
            <circle cx={cx - e.iris * 0.38} cy={e.cy - e.iris * 0.35} r={e.glint} fill="#fff" />
            <circle cx={cx + e.iris * 0.38} cy={e.cy + e.iris * 0.45} r={e.glint * 0.48} fill="#fff" opacity={0.85} />
          </g>
          {/* lower lid rises when smiling */}
          <ellipse data-lower-lid cx={cx} cy={e.lidY} rx={e.lidRx} ry={e.lidRy} fill={c.skin} />
          {/* heavy upper lid for the rugged look */}
          {rugged && <ellipse cx={cx} cy={e.cy - 15} rx={e.rx + 4} ry={9} fill={c.skinShadow} />}
        </g>
        {/* upper lash / lid line */}
        <path
          d={
            rugged
              ? `M ${cx - 21} ${e.cy + 1} C ${cx - 12} ${e.cy - 13} ${cx + 12} ${e.cy - 14} ${cx + 21} ${e.cy - 2}`
              : side === "l"
                ? `M ${cx - 25} 236 C ${cx - 20} 212 ${cx + 18} 208 ${cx + 25} 230`
                : `M ${cx - 25} 230 C ${cx - 18} 208 ${cx + 20} 212 ${cx + 25} 236`
          }
          stroke="#1a0f0b"
          strokeWidth={rugged ? 4 : 5}
          strokeLinecap="round"
          fill="none"
        />
        {rugged ? (
          <path
            d={`M ${cx - 16} ${e.cy + 11} C ${cx - 6} ${e.cy + 15} ${cx + 6} ${e.cy + 15} ${cx + 16} ${e.cy + 11}`}
            stroke={c.skinShadow}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path d={`M ${cx + s * 24} 232 L ${cx + s * 31} 225`} stroke="#24130d" strokeWidth={3.5} strokeLinecap="round" />
        )}
      </g>
    );
  };

  const facePath = rugged
    ? "M170 205 C170 138 206 110 250 110 C294 110 330 138 330 205 C330 255 324 292 304 322 C290 342 270 354 250 354 C230 354 210 342 196 322 C176 292 170 255 170 205 Z"
    : "M168 210 C168 140 205 112 250 112 C295 112 332 140 332 210 C332 262 318 300 292 328 C276 345 262 352 250 352 C238 352 224 345 208 328 C182 300 168 262 168 210 Z";

  return (
    <svg ref={root} viewBox="0 0 500 620" role="img" aria-label={c.label} className={className}>
      <defs>
        <radialGradient id={`${uid}-iris`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
          <stop offset="70%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.45} />
        </radialGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.skin} />
          <stop offset="100%" stopColor={c.skinShadow} />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.hairShine} />
          <stop offset="55%" stopColor={c.hair} />
        </linearGradient>
        {/* woven trim: repeating hard colour stops along the band */}
        <linearGradient id={`${uid}-trim`} x1="0" y1="0" x2="0" y2="14" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          {["#c81d25", "#f2b705", "#2e8b57", "#1f5fae", "#7b3fa0"].flatMap((col, i) => [
            <stop key={`${col}a`} offset={i / 5} stopColor={col} />,
            <stop key={`${col}b`} offset={(i + 1) / 5} stopColor={col} />,
          ])}
        </linearGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#3a0007" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-soft)`}>
        {/* Back hair — moves opposite to the face for depth */}
        {(long || swept) && (
          <g data-layer="backHair">
            <path d={swept ? MANE : BACK_HAIR} fill={`url(#${uid}-hair)`} />
            <path data-strand d="M128 300 C118 350 132 390 120 430" stroke={c.hairShine} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
            <path data-strand d="M372 300 C382 350 368 390 380 430" stroke={c.hairShine} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
          </g>
        )}

        {/* Body */}
        <g data-layer="body">
          {c.outfit === "vest" ? (
            <g data-breathe>
              {/* bare, muscular shoulders and arms */}
              <path d="M34 620 C40 516 92 452 178 436 C204 431 220 424 224 408 L276 408 C280 424 296 431 322 436 C408 452 460 516 466 620 Z" fill={c.skin} />
              <path d="M74 540 C86 506 104 486 122 476" stroke={c.skinShadow} strokeWidth={5} strokeLinecap="round" fill="none" />
              <path d="M426 540 C414 506 396 486 378 476" stroke={c.skinShadow} strokeWidth={5} strokeLinecap="round" fill="none" />
              <path d="M58 620 C62 590 70 566 80 548" stroke={c.skinShadow} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
              <path d="M442 620 C438 590 430 566 420 548" stroke={c.skinShadow} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
              {/* sleeveless vest */}
              <path d="M112 620 C112 540 132 482 176 454 C200 441 214 432 224 420 L276 420 C286 432 300 441 324 454 C368 482 388 540 388 620 Z" fill={c.shirt} />
              <path d="M112 620 C112 560 122 516 140 488 C150 530 152 580 150 620 Z" fill={c.shirtShadow} />
              <path d="M388 620 C388 560 378 516 360 488 C350 530 348 580 350 620 Z" fill={c.shirtShadow} />
              {/* white inner collar */}
              <path d="M224 420 L250 478 L276 420 L262 420 L250 450 L238 420 Z" fill="#f6f2ec" />
              {/* woven trim crossing the chest */}
              <path d="M232 424 L246 424 L206 620 L190 620 Z" fill={`url(#${uid}-trim)`} />
              <path d="M232 424 L246 424 L206 620 L190 620 Z" fill="none" stroke="#5b4a3a" strokeWidth={1} opacity={0.5} />
              {/* tie strings */}
              <path d="M262 470 C264 500 258 520 262 546" stroke="#efe9df" strokeWidth={3} strokeLinecap="round" fill="none" />
              <path d="M272 474 C276 502 272 524 278 548" stroke="#efe9df" strokeWidth={3} strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g data-breathe>
              <path
                d="M64 620 C72 522 118 452 198 434 C222 428 236 420 240 406 L260 406 C264 420 278 428 302 434 C382 452 428 522 436 620 Z"
                fill={c.shirt}
              />
              <path d="M120 520 C132 560 136 590 134 620 L96 620 C98 580 106 548 120 520 Z" fill={c.shirtShadow} />
              <path d="M380 520 C368 560 364 590 366 620 L404 620 C402 580 394 548 380 520 Z" fill={c.shirtShadow} />
            </g>
          )}
          {/* neck */}
          <path
            d={rugged ? "M218 326 L218 404 C226 430 274 430 282 404 L282 326 Z" : "M226 330 L226 396 C230 428 270 428 274 396 L274 330 Z"}
            fill={c.skin}
          />
          <path
            d={
              rugged
                ? "M218 334 C236 360 264 360 282 334 L282 366 C262 378 238 378 218 366 Z"
                : "M226 336 C240 356 260 356 274 336 L274 362 C258 372 242 372 226 362 Z"
            }
            fill={c.skinShadow}
            opacity={0.7}
          />
          {c.necklace && <path d="M220 396 C226 440 274 440 280 396" stroke="#3b2418" strokeWidth={3} fill="none" strokeLinecap="round" />}
          {long && (
            <>
              <path data-strand d={LOCK_LEFT} fill={c.hair} />
              <path data-strand d={LOCK_RIGHT} fill={c.hair} />
            </>
          )}
        </g>

        {/* Head — pivots at the neck */}
        <g data-layer="head" style={{ transformOrigin: "250px 360px" }}>
          {/* Hair cap behind the face, moving with the head, so parallax never opens a gap to the background */}
          <path
            d="M152 230 C140 140 194 92 250 92 C306 92 360 140 348 230 C352 270 336 300 318 312 L182 312 C164 300 148 270 152 230 Z"
            fill={c.hair}
          />
          <g data-layer="ears">
            <ellipse cx={rugged ? 170 : 168} cy={240} rx={13} ry={20} fill={c.skinShadow} />
            <ellipse cx={rugged ? 330 : 332} cy={240} rx={13} ry={20} fill={c.skinShadow} />
            {long && (
              <>
                <circle cx={166} cy={266} r={6} fill="none" stroke="#e8c26a" strokeWidth={2.5} />
                <circle cx={334} cy={266} r={6} fill="none" stroke="#e8c26a" strokeWidth={2.5} />
              </>
            )}
          </g>

          <path d={facePath} fill={`url(#${uid}-face)`} />

          {/* Facial features shift furthest, selling the turn; clipped so nothing slides off the face */}
          <clipPath id={`${uid}-face-clip`}>
            <path d={facePath} />
          </clipPath>
          <g clipPath={`url(#${uid}-face-clip)`}>
            <g data-layer="features">
              {rugged ? (
                // stubble shadow along the jaw
                <path d="M196 300 C214 344 286 344 304 300 C300 332 278 352 250 352 C222 352 200 332 196 300 Z" fill={c.hair} opacity={0.14} />
              ) : (
                <>
                  <ellipse data-blush cx={196} cy={284} rx={16} ry={8} fill="#f07f86" opacity={0.32} />
                  <ellipse data-blush cx={304} cy={284} rx={16} ry={8} fill="#f07f86" opacity={0.32} />
                </>
              )}

              <g data-brow>
                {rugged ? (
                  <>
                    <path d="M184 214 C198 203 220 202 238 210 L236 218 C220 212 200 213 186 220 Z" fill={c.hair} />
                    <g data-brow-right>
                      <path d="M316 214 C302 203 280 202 262 210 L264 218 C280 212 300 213 314 220 Z" fill={c.hair} />
                    </g>
                  </>
                ) : (
                  <>
                    <path d="M188 200 C198 189 222 187 236 194" stroke={c.hair} strokeWidth={5.5} strokeLinecap="round" fill="none" />
                    <g data-brow-right>
                      <path d="M264 194 C278 187 302 189 312 200" stroke={c.hair} strokeWidth={5.5} strokeLinecap="round" fill="none" />
                    </g>
                  </>
                )}
              </g>

              {eye(rugged ? 210 : 212, "l")}
              {eye(rugged ? 290 : 288, "r")}

              {rugged ? (
                <>
                  <path d="M250 246 C248 266 242 280 246 288 C250 292 256 292 262 288" stroke={c.skinShadow} strokeWidth={3.2} strokeLinecap="round" fill="none" />
                  {/* moustache */}
                  <path d="M218 308 C228 293 243 293 250 298 C257 293 272 293 282 308 C272 305 262 306 250 310 C238 306 228 305 218 308 Z" fill={c.hair} />
                  <path data-mouth="smile" d="M232 316 C242 319 258 319 268 316" stroke={c.lips} strokeWidth={3.5} strokeLinecap="round" fill="none" />
                  <g data-mouth="open" opacity={0}>
                    <path d="M230 313 C240 326 262 326 272 311 C258 316 244 316 230 313 Z" fill="#5e2522" />
                    <path d="M236 314 C246 317 256 317 266 313 L265 318 C256 320 246 320 237 318 Z" fill="#fff" />
                  </g>
                  {/* chin crease */}
                  <path d="M240 336 C246 340 254 340 260 336" stroke={c.skinShadow} strokeWidth={2.5} strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  <path d="M249 262 C246 274 244 281 253 283" stroke={c.skinShadow} strokeWidth={3} strokeLinecap="round" fill="none" />
                  <path data-mouth="smile" d="M229 300 C240 316 260 316 271 300 C258 305 242 305 229 300 Z" fill={c.lips} />
                  <g data-mouth="open" opacity={0}>
                    <path d="M225 296 C235 326 265 326 275 296 C260 302 240 302 225 296 Z" fill="#7a2a2a" />
                    <path d="M231 299 C244 304 256 304 269 299 L267 306 C256 309 244 309 233 306 Z" fill="#fff" />
                    <path d="M238 318 C246 322 254 322 262 318 C256 314 244 314 238 318 Z" fill="#e0767a" />
                  </g>
                </>
              )}
            </g>
          </g>

          {/* Front hair */}
          <g data-layer="bangs">
            {swept ? (
              <>
                <path data-strand d={TEMPLE_LEFT} fill={c.hair} />
                <path data-strand d={TEMPLE_RIGHT} fill={c.hair} />
                {/* swept-back crown with a smooth arched hairline */}
                <path
                  d="M160 240 C148 132 204 86 256 88 C310 90 358 134 340 240 C332 196 300 158 250 158 C200 158 168 196 160 240 Z"
                  fill={`url(#${uid}-hair)`}
                />
                <path d="M210 128 C232 112 270 108 300 122" stroke={c.hairShine} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8} />
                <path d="M196 150 C214 128 240 120 262 122" stroke={c.hairShine} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
                <path d="M290 140 C310 150 324 170 330 196" stroke={c.hairShine} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
              </>
            ) : long ? (
              <path
                d="M160 228 C150 140 198 92 256 92 C318 92 356 140 342 230 C334 192 318 162 294 146 C280 166 244 174 206 172 C186 186 170 206 160 228 Z"
                fill={`url(#${uid}-hair)`}
              />
            ) : (
              <path
                d="M158 212 C146 124 204 82 256 86 C314 90 356 132 342 212 C334 178 320 160 300 150 C280 168 232 176 190 166 C176 180 164 196 158 212 Z"
                fill={`url(#${uid}-hair)`}
              />
            )}
            {!swept && (
              <path d="M222 112 C246 104 280 108 300 122" stroke={c.hairShine} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.75} />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
