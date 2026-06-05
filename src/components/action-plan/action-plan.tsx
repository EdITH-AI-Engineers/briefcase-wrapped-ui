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

// ── Route follows the storyboard line: it DROPS down the left, hits a checkpoint
//    and JOGS right, hits another, then keeps DESCENDING through the rest — one map
//    per checkpoint as the camera follows the line down/right/down. Tall canvas; the
//    camera window scrolls through it. Every leg is due N / E / S / W. ─────────────
const CANVAS_W = 1280;
const CANVAS_H = 2450;
const WIN_W = 960;
const WIN_H = 540;
type PNode = { x: number; y: number; stop?: number };
const PATH: PNode[] = [
    { x: 430, y: 140 }, // start, top
    { x: 430, y: 560, stop: 0 }, // ↓ drop — checkpoint 1 (turn right)
    { x: 940, y: 560, stop: 1 }, // → jog right — checkpoint 2
    { x: 940, y: 880 }, { x: 500, y: 880 }, // ↓ then jog LEFT
    { x: 500, y: 1140, stop: 2 }, // ↓ — checkpoint 3 (left)
    { x: 500, y: 1380 }, { x: 960, y: 1380 }, // ↓ then jog RIGHT
    { x: 960, y: 1640, stop: 3 }, // ↓ — checkpoint 4 (right)
    { x: 960, y: 1880 }, { x: 520, y: 1880 }, // ↓ then jog LEFT
    { x: 520, y: 2140, stop: 4 }, // ↓ — checkpoint 5 (finish, bottom-left)
];
const ROUTE_POINTS = PATH.map((p) => `${p.x},${p.y}`).join(" ");
const SEGS = PATH.slice(1).map((p, i) => ({ len: Math.abs(p.x - PATH[i].x) + Math.abs(p.y - PATH[i].y) }));
const TOTAL = SEGS.reduce((s, g) => s + g.len, 0);
const CUM: number[] = [0];
SEGS.forEach((g, i) => CUM.push(CUM[i] + g.len / TOTAL));
const SPEED = 900; // viewBox units / second

// Which side of the road each checkpoint's landmark + bus stop sit on.
const SIDES: ("left" | "right")[] = ["left", "right", "left", "right", "right"];
const CHECKPOINTS = PATH.filter((p): p is Required<PNode> => p.stop !== undefined);
// Scenery sprinkled through the open parts of the map — trees line the road, with
// the odd house and pond for a lived-in, drive-through feel.
const SCENERY: { kind: "tree" | "house" | "pond"; x: number; y: number; s?: number }[] = [
    // top
    { kind: "tree", x: 120, y: 220, s: 1.1 }, { kind: "tree", x: 300, y: 185, s: 0.8 },
    { kind: "tree", x: 1080, y: 205, s: 1.15 }, { kind: "tree", x: 1200, y: 345, s: 0.8 },
    { kind: "tree", x: 1055, y: 460, s: 0.95 }, { kind: "tree", x: 345, y: 665, s: 1.05 },
    // upper-mid
    { kind: "tree", x: 140, y: 900, s: 1 }, { kind: "tree", x: 700, y: 1000, s: 0.85 },
    { kind: "tree", x: 770, y: 1230, s: 1.05 }, { kind: "tree", x: 1100, y: 760, s: 1 },
    { kind: "tree", x: 1205, y: 985, s: 0.8 }, { kind: "tree", x: 1090, y: 1180, s: 1.05 },
    { kind: "tree", x: 140, y: 1230, s: 0.9 }, { kind: "tree", x: 345, y: 1330, s: 1.1 },
    // lower-mid
    { kind: "tree", x: 700, y: 1610, s: 0.95 }, { kind: "tree", x: 800, y: 1755, s: 1.1 },
    { kind: "tree", x: 1095, y: 1455, s: 0.9 }, { kind: "tree", x: 1100, y: 1810, s: 1 },
    { kind: "tree", x: 1210, y: 1985, s: 0.8 }, { kind: "tree", x: 175, y: 1640, s: 1 },
    { kind: "tree", x: 320, y: 1735, s: 0.85 },
    // bottom
    { kind: "tree", x: 180, y: 2040, s: 1.1 }, { kind: "tree", x: 330, y: 2265, s: 0.9 },
    { kind: "tree", x: 905, y: 2205, s: 1 }, { kind: "tree", x: 660, y: 2090, s: 0.85 },
    // houses + ponds
    { kind: "house", x: 1085, y: 1380, s: 1 }, { kind: "house", x: 235, y: 1560, s: 1 },
    { kind: "pond", x: 215, y: 330 }, { kind: "pond", x: 1130, y: 1700 },
];

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
            gsap.set(car, { x: PATH[0].x, y: PATH[0].y, rotation: 180, transformOrigin: "50% 50%" });
            gsap.set(".ap-travel", { strokeDasharray: 1000, strokeDashoffset: 1000 });
            gsap.set(sheetRef.current, { yPercent: 130, autoAlpha: 0 });

            // Camera = the SVG viewBox (animated, no group transform → no GSAP residual).
            // travelBox keeps the car centred and scrolls map→map across the strip;
            // focusBox pushes in on a checkpoint when the car arrives.
            const svgEl = mapRef.current?.querySelector("svg");
            const cam = { x: 0, y: 0, w: WIN_W, h: WIN_H };
            const applyCam = () => svgEl?.setAttribute("viewBox", `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
            const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
            // Travel: keep the car centred and follow the line wherever it goes.
            const travelBox = (cx: number, cy: number) => ({
                x: clamp(cx - WIN_W / 2, 0, CANVAS_W - WIN_W),
                y: clamp(cy - WIN_H / 2, 0, CANVAS_H - WIN_H),
                w: WIN_W, h: WIN_H,
            });
            // Focus: a tighter push-in on the checkpoint when the car arrives.
            const FW = 720;
            const FH = 405;
            const focusBox = (cx: number, cy: number) => ({
                x: clamp(cx - FW / 2, 0, CANVAS_W - FW),
                y: clamp(cy - FH / 2, 0, CANVAS_H - FH),
                w: FW, h: FH,
            });

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
            tl.from(".ap-decor", { opacity: 0, y: 14, duration: 0.5, stagger: { each: 0.02, from: "random" }, ease: "power2.out" }, "-=0.4");
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
                // The camera follows the line — down, then right, then down — keeping
                // the car centred as it travels toward the next checkpoint/map.
                tl.to(cam, { ...travelBox(node.x, node.y), duration: dur, ease: "power1.inOut", onUpdate: applyCam }, "<");

                if (node.stop !== undefined) {
                    const idx = node.stop;
                    const s = stops[idx];
                    // Arrived — push in on the checkpoint (this page's destination).
                    tl.to(cam, { ...focusBox(node.x, node.y), duration: 0.5, ease: "power2.inOut", onUpdate: applyCam });
                    tl.add(() => {
                        const pin = rootRef.current?.querySelector<SVGGElement>(`[data-pin="${idx}"]`);
                        if (pin) gsap.fromTo(pin, { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: "bounce.out" });
                        const burst = rootRef.current?.querySelector<SVGCircleElement>(`[data-burst="${idx}"]`);
                        if (burst) gsap.fromTo(burst, { scale: 0.4, opacity: 0.8 }, { scale: 2.4, opacity: 0, duration: 0.7, ease: "power2.out", transformOrigin: "50% 50%" });
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
                    tl.to({}, { duration: 2.0 });
                    if (idx < stops.length - 1) {
                        tl.to(sheetRef.current, { yPercent: 130, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
                        // Pull back to travel and follow the line to the next map.
                        tl.to(cam, { ...travelBox(node.x, node.y), duration: 0.45, ease: "power2.inOut", onUpdate: applyCam });
                    }
                }
            });

            // 6. Arrived — flag + finale.
            tl.fromTo(".ap-flag", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", transformOrigin: "520px 2100px" });
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
                    <p className="font-figtree font-black text-[clamp(38px,6.4vw,86px)] leading-[0.95] tracking-tight whitespace-nowrap">Where to from here?</p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">buckle up — I mapped it, {user.name}</p>
                </div>

                {/* Headline two */}
                <div ref={container2_Ref} style={{ visibility: "hidden", opacity: 0 }} className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center">
                    <p className="font-figtree font-black text-[clamp(38px,6.4vw,86px)] leading-[0.95] tracking-tight whitespace-nowrap">Five stops to a sharper you</p>
                </div>

                {/* ── The map ── */}
                <div ref={mapRef} style={{ visibility: "hidden", opacity: 0 }} className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" aria-hidden>
                        <defs>
                            <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* ── Map scenery (behind the road) ── */}
                        {SCENERY.map((d, i) => {
                            if (d.kind === "tree") {
                                const s = d.s ?? 1;
                                return (
                                    <g key={`sc${i}`} className="ap-decor">
                                        <rect x={d.x - 4 * s} y={d.y} width={8 * s} height={24 * s} fill="#0a2236" />
                                        <circle cx={d.x} cy={d.y - 4 * s} r={22 * s} fill="#2f7d5b" stroke="#0a2236" strokeWidth="3" />
                                        <circle cx={d.x - 10 * s} cy={d.y + 4 * s} r={14 * s} fill="#3a946a" stroke="#0a2236" strokeWidth="3" />
                                        <circle cx={d.x + 11 * s} cy={d.y + 3 * s} r={13 * s} fill="#3a946a" stroke="#0a2236" strokeWidth="3" />
                                    </g>
                                );
                            }
                            if (d.kind === "pond") {
                                return <ellipse key={`sc${i}`} className="ap-decor" cx={d.x} cy={d.y} rx="64" ry="36" fill="#1f6f9e" stroke="#0a2236" strokeWidth="3" opacity="0.85" />;
                            }
                            return (
                                <g key={`sc${i}`} className="ap-decor">
                                    <rect x={d.x - 30} y={d.y} width="60" height="50" fill="#0a2236" stroke="#f6fbff" strokeWidth="3" />
                                    <path d={`M ${d.x - 36} ${d.y} L ${d.x} ${d.y - 28} L ${d.x + 36} ${d.y} Z`} fill="#e23a2e" stroke="#0a2236" strokeWidth="3" />
                                    <rect x={d.x - 8} y={d.y + 22} width="16" height="28" fill="#f4a261" />
                                </g>
                            );
                        })}

                        {/* ── Landmark per checkpoint (its respective design, beside the line) ── */}
                        {CHECKPOINTS.map((p) => {
                            const side = SIDES[p.stop];
                            const bx = p.x + (side === "left" ? -224 : 224);
                            const by = p.y - 64;
                            const icon = stops[p.stop].icon;
                            return (
                                <g key={`bldg${p.stop}`} className="ap-decor">
                                    <rect x={bx - 47} y={by + 4} width="94" height="138" rx="8" fill="#0a2236" stroke="#f6fbff" strokeWidth="3.5" />
                                    {[0, 1, 2].map((r) =>
                                        [0, 1].map((c) => (
                                            <rect key={`${r}-${c}`} x={bx - 30 + c * 34} y={by + 40 + r * 30} width="24" height="18" rx="2" fill="#bfe3f5" />
                                        )),
                                    )}
                                    {/* marquee sign with the area's icon */}
                                    <rect x={bx - 34} y={by - 24} width="68" height="34" rx="7" fill="#f6fbff" stroke="#0a2236" strokeWidth="3" />
                                    <text x={bx} y={by + 2} textAnchor="middle" fontSize="24">{icon}</text>
                                </g>
                            );
                        })}

                        {/* ── Bus stop at each checkpoint ── */}
                        {CHECKPOINTS.map((p) => {
                            const side = SIDES[p.stop];
                            const sx = p.x + (side === "left" ? -58 : 58);
                            return (
                                <g key={`bus${p.stop}`} className="ap-decor">
                                    <rect x={sx - 2.5} y={p.y - 52} width="5" height="56" rx="2" fill="#0a2236" />
                                    <rect x={sx - 23} y={p.y - 88} width="46" height="36" rx="9" fill="#f6fbff" stroke="#0a2236" strokeWidth="3" />
                                    <rect x={sx - 15} y={p.y - 81} width="30" height="16" rx="3" fill="#0a2236" />
                                    <rect x={sx - 11} y={p.y - 78} width="8" height="6" rx="1" fill="#bfe3f5" />
                                    <rect x={sx + 2} y={p.y - 78} width="8" height="6" rx="1" fill="#bfe3f5" />
                                    <circle cx={sx - 7} cy={p.y - 64} r="3" fill="#0a2236" />
                                    <circle cx={sx + 8} cy={p.y - 64} r="3" fill="#0a2236" />
                                    <rect x={sx + 12} y={p.y - 86} width="9" height="9" rx="2" fill="#e23a2e" />
                                </g>
                            );
                        })}

                        {/* checkpoint guide-lines between maps (subtle) */}
                        {PATH.filter((p) => p.stop !== undefined).map((p) => (
                            <line key={`g${p.stop}`} x1={p.x - 70} y1={p.y} x2={p.x + 70} y2={p.y} stroke="#f6fbff" strokeWidth="2" strokeDasharray="6 14" opacity="0.16" />
                        ))}

                        {/* planned route ahead — faint dotted white */}
                        <polyline className="ap-plan" points={ROUTE_POINTS} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 18" opacity="0.45" />

                        {/* the road the car draws behind it — bold white + navy lane dashes */}
                        <polyline className="ap-travel" points={ROUTE_POINTS} pathLength={1000} fill="none" stroke="#f6fbff" strokeWidth="17" strokeLinejoin="round" strokeLinecap="round" />
                        <polyline className="ap-travel" points={ROUTE_POINTS} pathLength={1000} fill="none" stroke="#0a2236" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="3 16" opacity="0.4" />

                        {/* checkpoint collect-bursts (expand when reached) */}
                        {PATH.filter((p) => p.stop !== undefined).map((p) => (
                            <circle key={`burst-${p.stop}`} data-burst={p.stop} cx={p.x} cy={p.y} r="18" fill="none" stroke="#e23a2e" strokeWidth="4" opacity="0" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                        ))}

                        {/* checkpoint dots (red) */}
                        {PATH.filter((p) => p.stop !== undefined).map((p) => (
                            <g key={p.stop} data-pin={p.stop} style={{ visibility: "hidden" }}>
                                <circle className="ap-pulse" cx={p.x} cy={p.y} r="16" fill="none" stroke="#e23a2e" strokeWidth="3" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                                <circle cx={p.x} cy={p.y} r="17" fill="#e23a2e" stroke="#f6fbff" strokeWidth="4" />
                                <text x={p.x} y={p.y + 5} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="16" fill="#f6fbff">{(p.stop ?? 0) + 1}</text>
                            </g>
                        ))}

                        {/* finish flag at the last stop */}
                        <g className="ap-flag" style={{ transformOrigin: "520px 2100px" }} opacity="0">
                            <rect x="517" y="2090" width="4" height="52" fill="#0a2236" />
                            <path d="M 521 2092 L 578 2104 L 521 2118 Z" fill="#e23a2e" stroke="#0a2236" strokeWidth="2.5" />
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
