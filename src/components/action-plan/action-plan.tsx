"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { ActionPlanArt } from "@/components/wrapped-shell/scene-art";
import planData from "@/data/action-plan.json";

gsap.registerPlugin(SplitText);

type WrappedActionPlanProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

const { stops } = planData;

// ── Route (SVG viewBox 1280×720). Deliberately chaotic — the points are scattered
//    and the path darts everywhere, crossing itself. Every leg is still due
//    N / E / S / W, but the overall shape is pure ADHD zig-zag, not a tidy snake. ──
type PNode = { x: number; y: number; stop?: number };
const PATH: PNode[] = [
    { x: 150, y: 300 },
    { x: 360, y: 300 },
    { x: 360, y: 150, stop: 0 }, // dart up — top-left
    { x: 360, y: 560 },
    { x: 660, y: 560, stop: 1 }, // long drop, then over — bottom-mid
    { x: 1000, y: 560 },
    { x: 1000, y: 210, stop: 2 }, // shoot up the right — top-right
    { x: 250, y: 210 }, // long sweep back across the top (crosses)
    { x: 250, y: 430, stop: 3 }, // drop — mid-left
    { x: 1050, y: 430 }, // long dash right (crosses)
    { x: 1050, y: 500, stop: 4 }, // settle — right
];
const ROUTE_POINTS = PATH.map((p) => `${p.x},${p.y}`).join(" ");
const SEGS = PATH.slice(1).map((p, i) => ({ len: Math.abs(p.x - PATH[i].x) + Math.abs(p.y - PATH[i].y) }));
const TOTAL = SEGS.reduce((s, g) => s + g.len, 0);
const CUM: number[] = [0];
SEGS.forEach((g, i) => CUM.push(CUM[i] + g.len / TOTAL));
const SPEED = 880; // viewBox units / second — snappier, more frantic

// Car points NORTH at 0°.
const heading = (a: PNode, b: PNode) => {
    if (b.x > a.x) return { rot: 90, word: "East" };
    if (b.x < a.x) return { rot: -90, word: "West" };
    if (b.y > a.y) return { rot: 180, word: "South" };
    return { rot: 0, word: "North" };
};

export function WrappedActionPlan({ user, onComplete, active = true }: WrappedActionPlanProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const container2_Ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const carRef = useRef<SVGGElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);

    const hudRef = useRef<HTMLDivElement>(null);
    const hudTurnRef = useRef<HTMLSpanElement>(null);
    const hudDestRef = useRef<HTMLSpanElement>(null);
    const hudEtaRef = useRef<HTMLSpanElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const sTagRef = useRef<HTMLSpanElement>(null);
    const sIconRef = useRef<HTMLSpanElement>(null);
    const sAreaRef = useRef<HTMLSpanElement>(null);
    const sRecRef = useRef<HTMLParagraphElement>(null);
    const sCourseRef = useRef<HTMLSpanElement>(null);
    const sWeeksRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!active) return;
        if (
            !rootRef.current ||
            !containerRef.current ||
            !container2_Ref.current ||
            !mapRef.current ||
            !carRef.current ||
            !finaleRef.current
        )
            return;

        const finaleEl = finaleRef.current;
        const car = carRef.current;

        const ctx = gsap.context(() => {
            gsap.set(container2_Ref.current, { autoAlpha: 0 });
            gsap.set(car, { x: PATH[0].x, y: PATH[0].y, rotation: 90, transformOrigin: "50% 50%" });
            gsap.set(".ap-travel", { strokeDasharray: 1000, strokeDashoffset: 1000 });
            gsap.set(sheetRef.current, { yPercent: 130, autoAlpha: 0 });

            // Camera: animate the SVG viewBox (no group transform → no GSAP residual).
            // FULL frames the whole route; FOCUS zooms onto one point — its own "page".
            const svgEl = mapRef.current?.querySelector("svg");
            const cam = { x: 0, y: 0, w: 1280, h: 720 };
            const applyCam = () => svgEl?.setAttribute("viewBox", `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
            const FULL = { x: 0, y: 0, w: 1280, h: 720 };
            const FOCUS_Z = 2.4;
            const focusBox = (sx: number, sy: number) => {
                const w = 1280 / FOCUS_Z;
                const h = 720 / FOCUS_Z;
                return { x: sx - w / 2, y: sy - h / 2, w, h };
            };

            const split = SplitText.create(containerRef.current, { type: "lines, words", linesClass: "overflow-hidden" });
            const split2 = SplitText.create(container2_Ref.current, { type: "lines", linesClass: "overflow-hidden" });

            const tl = gsap.timeline({ delay: 0.5 });

            // 1–2. Headlines
            tl.from(split.lines, { rotationX: -90, transformOrigin: "50% 0% -50px", opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.55 });
            gsap.set(containerRef.current, { opacity: 1 });
            tl.to(containerRef.current, { opacity: 0, y: -40, duration: 0.6, ease: "power2.in", delay: 1.1 });
            tl.set(container2_Ref.current, { autoAlpha: 1 });
            tl.from(split2.lines, { rotationX: -90, transformOrigin: "50% 0% -50px", opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.5, delay: 0.6 });
            tl.to(container2_Ref.current, { opacity: 0, y: -40, duration: 0.6, ease: "power2.in", delay: 0.7 });

            // 3. Clear ambient art + chrome
            tl.to([".plan-road", ".plan-node", ".plan-label", ".plan-arrow"], {
                scale: 0, opacity: 0, duration: 0.5, stagger: { each: 0.04, from: "random" }, ease: "back.in(1.6)", transformOrigin: "50% 50%",
            }, "+=0.1");
            tl.to([".wrapped-marquee", ".wrapped-strip"], { autoAlpha: 0, duration: 0.4, ease: "power2.in" });

            // 4. Reveal the map
            tl.set(mapRef.current, { autoAlpha: 1 });
            tl.from(".ap-plan", { opacity: 0, duration: 0.6, ease: "power2.out" });
            tl.from(hudRef.current, { y: -40, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
            tl.from(car, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "back.out(2)", transformOrigin: "50% 50%" });
            tl.add(() => {
                gsap.to(".ap-pulse", { scale: 1.7, opacity: 0, duration: 1.5, ease: "power1.out", repeat: -1, transformOrigin: "50% 50%" });
            });

            // 5. Drive the route, stop by stop (slight motion blur per leg).
            const pulseBlur = (dur: number) => {
                const o = { b: 0 };
                const apply = () => { if (car) car.style.filter = `blur(${o.b.toFixed(2)}px)`; };
                gsap.timeline()
                    .to(o, { b: 2.8, duration: dur * 0.3, ease: "power2.in", onUpdate: apply })
                    .to(o, { b: 0, duration: dur * 0.5, ease: "power2.out", onUpdate: apply });
            };

            PATH.forEach((node, i) => {
                if (i === 0) return;
                const prev = PATH[i - 1];
                const h = heading(prev, node);
                const dur = SEGS[i - 1].len / SPEED;

                tl.to(car, { rotation: h.rot, duration: 0.22, ease: "power2.inOut" });
                tl.add(() => pulseBlur(dur));
                tl.to(car, { x: node.x, y: node.y, duration: dur, ease: "power1.inOut" }, "<");
                tl.to(".ap-travel", { strokeDashoffset: 1000 * (1 - CUM[i]), duration: dur, ease: "power1.inOut" }, "<");

                if (node.stop !== undefined) {
                    const idx = node.stop;
                    const s = stops[idx];
                    // Zoom into this point — its own page.
                    tl.to(cam, { ...focusBox(node.x, node.y), duration: 0.6, ease: "power2.inOut", onUpdate: applyCam });
                    tl.add(() => {
                        const pin = rootRef.current?.querySelector<SVGGElement>(`[data-pin="${idx}"]`);
                        if (pin) gsap.fromTo(pin, { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: "bounce.out" });
                        if (hudTurnRef.current) hudTurnRef.current.textContent = h.word;
                        if (hudDestRef.current) hudDestRef.current.textContent = s.area;
                        if (hudEtaRef.current) hudEtaRef.current.textContent = `${s.weeks} wk`;
                        if (progressRef.current) gsap.to(progressRef.current, { width: `${((idx + 1) / stops.length) * 100}%`, duration: 0.5, ease: "power2.out" });
                        if (sTagRef.current) sTagRef.current.textContent = s.tag;
                        if (sIconRef.current) sIconRef.current.textContent = s.icon;
                        if (sAreaRef.current) sAreaRef.current.textContent = s.area;
                        if (sRecRef.current) sRecRef.current.textContent = s.recommendation;
                        if (sCourseRef.current) sCourseRef.current.textContent = s.course;
                        if (sWeeksRef.current) sWeeksRef.current.textContent = `${s.weeks} weeks`;
                    });
                    tl.fromTo(sheetRef.current, { yPercent: 130, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.5)" });
                    tl.to({}, { duration: 2.2 });
                    if (idx < stops.length - 1) {
                        tl.to(sheetRef.current, { yPercent: 130, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
                        // Pull back out to drive on to the next point.
                        tl.to(cam, { ...FULL, duration: 0.55, ease: "power2.inOut", onUpdate: applyCam });
                    }
                }
            });

            // 6. Arrived — flag + finale.
            tl.fromTo(".ap-flag", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", transformOrigin: "1050px 460px" });
            tl.to(sheetRef.current, { yPercent: 130, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
            tl.to([mapRef.current, hudRef.current], { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.3");
            tl.set(finaleEl, { autoAlpha: 1 });
            tl.from(finaleEl.querySelectorAll("p"), { y: 40, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.15 });
            tl.to(finaleEl, { opacity: 0, y: -20, duration: 0.6, ease: "power2.in" }, "+=2.2");

            let completeDelay: gsap.core.Tween | null = null;
            tl.eventCallback("onComplete", () => { completeDelay = gsap.delayedCall(0.3, () => onComplete?.()); });
            return () => {
                completeDelay?.kill();
                split.revert();
                split2.revert();
                if (car) car.style.filter = "none";
            };
        });

        return () => ctx.revert();
    }, [onComplete, user.name, active]);

    return (
        <WrappedShell
            sceneNumber="05"
            sceneLabel="Action Plan"
            marqueeText="route loaded  //  next stop: 2027  //  recalculating…"
            variant="blue"
            art={<ActionPlanArt />}
        >
            <div ref={rootRef} className="relative w-full h-full" style={{ perspective: "800px" }}>
                {/* Headline one */}
                <div ref={containerRef} style={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center">
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 text-[#e23a2e]">// 05 — Roadmap</p>
                    <p className="font-figtree font-black text-[clamp(38px,6.4vw,86px)] leading-[0.95] tracking-tight whitespace-nowrap">Where to from here?</p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">buckle up — I mapped it, {user.name}</p>
                </div>

                {/* Headline two */}
                <div ref={container2_Ref} style={{ visibility: "hidden", opacity: 0 }} className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center">
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 text-[#e23a2e]">// 05 — The route</p>
                    <p className="font-figtree font-black text-[clamp(38px,6.4vw,86px)] leading-[0.95] tracking-tight whitespace-nowrap">Five stops to a sharper you</p>
                </div>

                {/* ── The map ── */}
                <div ref={mapRef} style={{ visibility: "hidden", opacity: 0 }} className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden>
                        <defs>
                            <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* planned route ahead — faint dotted white */}
                        <polyline className="ap-plan" points={ROUTE_POINTS} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 18" opacity="0.45" />

                        {/* the road the car draws behind it — bold white + navy lane dashes */}
                        <polyline className="ap-travel" points={ROUTE_POINTS} pathLength={1000} fill="none" stroke="#f6fbff" strokeWidth="17" strokeLinejoin="round" strokeLinecap="round" />
                        <polyline className="ap-travel" points={ROUTE_POINTS} pathLength={1000} fill="none" stroke="#0a2236" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="3 16" opacity="0.4" />

                        {/* destination dots (red) */}
                        {PATH.filter((p) => p.stop !== undefined).map((p) => (
                            <g key={p.stop} data-pin={p.stop} style={{ visibility: "hidden" }}>
                                <circle className="ap-pulse" cx={p.x} cy={p.y} r="16" fill="none" stroke="#e23a2e" strokeWidth="3" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                                <circle cx={p.x} cy={p.y} r="16" fill="#e23a2e" stroke="#f6fbff" strokeWidth="4" />
                                <text x={p.x} y={p.y + 5} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="16" fill="#f6fbff">{(p.stop ?? 0) + 1}</text>
                            </g>
                        ))}

                        {/* finish flag at the last stop */}
                        <g className="ap-flag" style={{ transformOrigin: "1050px 460px" }} opacity="0">
                            <rect x="1047" y="450" width="4" height="52" fill="#0a2236" />
                            <path d="M 1051 452 L 1108 464 L 1051 478 Z" fill="#e23a2e" stroke="#0a2236" strokeWidth="2.5" />
                        </g>

                        {/* the car (navy avatar, white outline) */}
                        <g ref={carRef} style={{ visibility: "hidden" }}>
                            <polygon points="0,-64 -26,-12 26,-12" fill="url(#beam)" />
                            <ellipse cx="3" cy="5" rx="17" ry="26" fill="rgba(10,34,54,0.28)" />
                            <rect x="-16" y="-25" width="32" height="50" rx="11" fill="#0a2236" stroke="#f6fbff" strokeWidth="3.5" />
                            <rect x="-11" y="-17" width="22" height="13" rx="4" fill="#bfe3f5" />
                            <rect x="-11" y="6" width="22" height="11" rx="4" fill="#bfe3f5" opacity="0.7" />
                            <circle cx="-9" cy="-23" r="3.4" fill="#fff3c4" />
                            <circle cx="9" cy="-23" r="3.4" fill="#fff3c4" />
                            <circle cx="-9" cy="22" r="3" fill="#e23a2e" />
                            <circle cx="9" cy="22" r="3" fill="#e23a2e" />
                        </g>
                    </svg>

                    {/* Top nav HUD */}
                    <div ref={hudRef} className="absolute top-[4%] left-1/2 -translate-x-1/2 w-[min(92%,560px)]">
                        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: "#0a2236", border: "2px solid #f6fbff", boxShadow: "0 8px 0 0 rgba(10,34,54,0.35)" }}>
                            <span className="grid place-items-center rounded-xl shrink-0 font-black text-2xl" style={{ width: 44, height: 44, backgroundColor: "#e23a2e", color: "#f6fbff" }}>↑</span>
                            <div className="flex flex-col leading-tight min-w-0">
                                <span className="font-montserrat font-bold uppercase tracking-[0.2em] text-[10px] text-[#7fd0f5]">
                                    Head <span ref={hudTurnRef}>North</span> · <span ref={hudEtaRef}>4 wk</span>
                                </span>
                                <span ref={hudDestRef} className="font-figtree font-black text-[#f6fbff] text-[17px] truncate">Systems &amp; Infrastructure</span>
                            </div>
                            <div className="ml-auto h-1.5 w-20 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: "rgba(246,251,255,0.2)" }}>
                                <div ref={progressRef} className="h-full rounded-full" style={{ width: "0%", backgroundColor: "#e23a2e" }} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom sheet — one action plan per stop */}
                    <div ref={sheetRef} className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[min(94%,620px)]">
                        <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#f4ead2", border: "3px solid #0a2236", boxShadow: "7px 7px 0 0 rgba(10,34,54,0.45)" }}>
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center rounded-xl shrink-0 text-2xl" style={{ width: 48, height: 48, backgroundColor: "#e23a2e", border: "3px solid #0a2236" }}>
                                    <span ref={sIconRef}>🖧</span>
                                </span>
                                <div className="flex flex-col min-w-0">
                                    <span ref={sTagRef} className="font-montserrat font-black uppercase tracking-[0.18em] text-[10px] text-[#e23a2e]">First stop</span>
                                    <span ref={sAreaRef} className="font-figtree font-black text-[#0a2236] text-[20px] leading-tight truncate">Systems &amp; Infrastructure</span>
                                </div>
                                <span className="ml-auto flex flex-col items-end shrink-0">
                                    <span ref={sWeeksRef} className="font-figtree font-black text-[#0a2236] text-[16px] leading-none">4 weeks</span>
                                    <span className="font-montserrat font-bold uppercase tracking-[0.15em] text-[9px] text-[#0a2236]/55">to clear</span>
                                </span>
                            </div>
                            <p ref={sRecRef} className="font-figtree font-bold text-[#0a2236] text-[15px] leading-snug mt-3">Ship a small distributed service and deploy it end-to-end.</p>
                            <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: "#0a2236" }}>
                                <span className="font-montserrat font-black uppercase tracking-[0.15em] text-[9px] text-[#f4a261] shrink-0">Take</span>
                                <span ref={sCourseRef} className="font-figtree font-black text-[#f6fbff] text-[14px] leading-none truncate">Cloud Infrastructure: Core Concepts</span>
                                <span className="ml-auto text-[#7fd0f5] text-lg leading-none shrink-0">▶</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Finale */}
                <div ref={finaleRef} style={{ visibility: "hidden", opacity: 0 }} className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center">
                    <p className="font-figtree font-black text-[clamp(38px,6.4vw,86px)] leading-[0.95] tracking-tight whitespace-nowrap">You&apos;ve got the map.</p>
                    <p className="font-figtree font-bold text-xl md:text-2xl mt-5 text-[#e23a2e]">now just drive.</p>
                </div>
            </div>
        </WrappedShell>
    );
}
