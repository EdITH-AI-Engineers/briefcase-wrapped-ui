"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { CompetenciesArt } from "@/components/wrapped-shell/scene-art";
import competenciesData from "@/data/competencies.json";

gsap.registerPlugin(SplitText);

type WrappedCompetenciesProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

const { domains, overall, tiers } = competenciesData;

// ── Radar geometry (SVG viewBox is 0..100; the web lives inside it) ───────────
const N = domains.length;
const C = 50; // center
const MAXR = 36; // outer web radius
const NODER = 47; // domain-node ring radius, as % of the square stage
const RING_FRACS = [0.25, 0.5, 0.75, 1];

const angRad = (i: number) => ((-90 + (360 / N) * i) * Math.PI) / 180;
const angDeg = (i: number) => (360 / N) * i; // 0 == straight up (domain 0)

const pt = (r: number, i: number): [number, number] => [
    C + r * Math.cos(angRad(i)),
    C + r * Math.sin(angRad(i)),
];

// ── Camera (spotlight zoom) ───────────────────────────────────────────────────
// When a domain is in focus we push the whole web with a translate+scale so the
// focused node lands dead-center of the stage (both axes) and grows. Because C is
// the box center, a node's offset from center is purely the NODER component.
const ZOOM = 1.34; // how far we dolly in on the focused competency
const camOffset = (i: number) => ({
    ox: (NODER * Math.cos(angRad(i))) / 100, // fraction of box width
    oy: (NODER * Math.sin(angRad(i))) / 100, // fraction of box height
});

// Octagonal "spider web" ring at a given fraction of MAXR.
const ringPoints = (frac: number) =>
    domains.map((_, i) => pt(frac * MAXR, i).join(",")).join(" ");

// The proficiency polygon (your actual levels).
const skillPoints = domains
    .map((d, i) => pt((d.level / 100) * MAXR, i).join(","))
    .join(" ");

const tierFor = (level: number) =>
    tiers.find((t) => level >= t.min) ?? tiers[tiers.length - 1];

export function WrappedCompetencies({ user, onComplete, active = true }: WrappedCompetenciesProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const container2_Ref = useRef<HTMLDivElement>(null);
    const radarRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const radBoxRef = useRef<HTMLDivElement>(null);
    const mblurRef = useRef<SVGFEGaussianBlurElement>(null);
    const overallRef = useRef<HTMLSpanElement>(null);
    const sweepRef = useRef<SVGGElement>(null);
    const capRef = useRef<HTMLDivElement>(null);
    const capIconRef = useRef<HTMLSpanElement>(null);
    const capTitleRef = useRef<HTMLSpanElement>(null);
    const capTierRef = useRef<HTMLSpanElement>(null);
    const capLevelRef = useRef<HTMLSpanElement>(null);
    const capFillRef = useRef<HTMLDivElement>(null);
    const capBlurbRef = useRef<HTMLParagraphElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);
    const finaleBottomRef = useRef<SVGSVGElement>(null);

    // Hide content before first paint so it never flashes during the slide-in.
    useIsoLayoutEffect(() => {
        if (rootRef.current) gsap.set(rootRef.current, { autoAlpha: 0 });
    }, []);

    useEffect(() => {
        if (!active) return;
        if (
            !rootRef.current ||
            !containerRef.current ||
            !container2_Ref.current ||
            !radarRef.current ||
            !finaleRef.current ||
            !finaleBottomRef.current
        )
            return;

        gsap.set(rootRef.current, { autoAlpha: 1 });
        const finaleEl = finaleRef.current; // guarded non-null above

        // Global selectors on purpose: the marquee/strip and CompetenciesArt are
        // rendered by WrappedShell *outside* this component's subtree, so scoping
        // to a local root would make those selectors match nothing.
        {
            gsap.set(container2_Ref.current, { autoAlpha: 0 });

            const split = SplitText.create(containerRef.current, {
                type: "lines, words",
                linesClass: "overflow-hidden",
            });
            const split2 = SplitText.create(container2_Ref.current, {
                type: "lines",
                linesClass: "overflow-hidden",
            });

            const tl = gsap.timeline({ delay: 0.5 });

            // 1. Headline one — the "how good are you now?" line follows close behind.
            tl.from(split.lines, {
                rotationX: -90,
                transformOrigin: "50% 0% -50px",
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.55,
            });
            gsap.set(containerRef.current, { opacity: 1 });
            tl.to(containerRef.current, {
                opacity: 0,
                y: -40,
                duration: 0.6,
                ease: "power2.in",
                delay: 1.2,
            });

            // 2. Headline two
            tl.set(container2_Ref.current, { autoAlpha: 1 });
            tl.from(split2.lines, {
                rotationX: -90,
                transformOrigin: "50% 0% -50px",
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 1.2,
                delay: 1,
            });
            tl.to(container2_Ref.current, {
                opacity: 0,
                y: -40,
                duration: 0.7,
                ease: "power2.in",
                delay: 0.6,
            });

            // 3. Clear the stage: pop the ambient art + hide chrome
            tl.to(
                [".comp-pop"],
                {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    stagger: { each: 0.04, from: "random" },
                    ease: "back.in(1.6)",
                    transformOrigin: "50% 50%",
                },
                "+=0.1",
            );
            tl.to([".wrapped-marquee", ".wrapped-strip"], {
                autoAlpha: 0,
                duration: 0.4,
                ease: "power2.in",
            });

            // 4. The web draws itself in — rings, spokes, then your polygon.
            tl.set(radarRef.current, { autoAlpha: 1 });

            tl.from(".rad-ring", {
                scale: 0,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.08,
                transformOrigin: "50% 50%",
            });

            // Spokes: classic draw-on via stroke-dashoffset.
            tl.add(() => {
                rootRef.current
                    ?.querySelectorAll<SVGLineElement>(".rad-spoke")
                    .forEach((line) => {
                        const len = line.getTotalLength();
                        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
                        gsap.to(line, {
                            strokeDashoffset: 0,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                    });
            });
            tl.to({}, { duration: 0.4 });

            // Your proficiency polygon scales up from the core + fades its fill.
            tl.from(
                ".rad-skill",
                {
                    scale: 0,
                    opacity: 0,
                    duration: 0.8,
                    ease: "back.out(1.5)",
                    transformOrigin: "50% 50%",
                },
                "-=0.1",
            );
            tl.from(
                ".rad-vertex",
                {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(2.2)",
                    stagger: { each: 0.05, from: "start" },
                    transformOrigin: "50% 50%",
                },
                "-=0.5",
            );

            // 5. Core disc + count-up
            tl.from(
                ".rad-core",
                {
                    scale: 0,
                    opacity: 0,
                    duration: 0.6,
                    ease: "back.out(2)",
                    transformOrigin: "50% 50%",
                },
                "-=0.3",
            );
            const counter = { v: 0 };
            tl.to(
                counter,
                {
                    v: overall,
                    duration: 1,
                    ease: "power1.out",
                    onUpdate: () => {
                        if (overallRef.current)
                            overallRef.current.textContent = String(Math.round(counter.v));
                    },
                },
                "<",
            );

            // 6. Domain nodes snap into orbit
            tl.from(
                ".rad-node",
                {
                    scale: 0,
                    opacity: 0,
                    y: 12,
                    duration: 0.55,
                    ease: "back.out(1.9)",
                    stagger: { each: 0.07, from: "random" },
                    transformOrigin: "50% 50%",
                },
                "-=0.6",
            );
            tl.set(sweepRef.current, { autoAlpha: 1 });
            // The info window stays hidden here — it now rises in per competency,
            // only while that competency holds the spotlight (see the sweep below).

            // Ambient life (starts once everything has landed): inner pulse + orbit drift.
            tl.add(() => {
                gsap.to(".rad-node-inner", {
                    scale: 1.06,
                    duration: 2.2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    stagger: { each: 0.18, from: "random" },
                });
                gsap.to(".rad-orbit", {
                    rotation: 360,
                    duration: 60,
                    ease: "none",
                    repeat: -1,
                    svgOrigin: "50 50",
                });
            });

            // 7. Guided radar sweep — one domain in focus at a time (ADHD-calm).
            //    The camera now dollies in on the focused competency, recentering
            //    it to the middle of the stage with a slip of directional motion blur.
            tl.to({}, { duration: 0.5 });

            const nodes = () =>
                Array.from(
                    rootRef.current?.querySelectorAll<HTMLDivElement>(".rad-node") ?? [],
                );
            const verts = () =>
                Array.from(
                    rootRef.current?.querySelectorAll<SVGCircleElement>(".rad-vertex") ?? [],
                );

            // Arm the motion-blur filter for the whole sweep (0 deviation = invisible)
            // and feather the stage edges so the dollied web recedes softly. The clip
            // (overflow + mask) is only engaged here — at rest the full octagon must
            // breathe past the stage box, so the stage stays unclipped until now.
            const EDGE_MASK =
                "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)";
            tl.add(() => {
                if (radBoxRef.current) radBoxRef.current.style.filter = "url(#comp-mblur)";
                if (stageRef.current) {
                    stageRef.current.style.overflow = "hidden";
                    stageRef.current.style.maskImage = EDGE_MASK;
                    stageRef.current.style.webkitMaskImage = EDGE_MASK;
                }
            });

            // Fire a short directional blur pulse along the camera's travel vector.
            const prevOff = { ox: 0, oy: 0 };
            const pulseBlur = (dx: number, dy: number) => {
                const mag = Math.hypot(dx, dy);
                if (mag < 1e-3) return;
                const peak = Math.min(7, mag * 13); // px, scaled by distance travelled
                const bx = (peak * Math.abs(dx)) / mag;
                const by = (peak * Math.abs(dy)) / mag;
                const o = { b: 0 };
                const apply = () =>
                    mblurRef.current?.setAttribute(
                        "stdDeviation",
                        `${(bx * o.b).toFixed(2)} ${(by * o.b).toFixed(2)}`,
                    );
                gsap
                    .timeline()
                    .to(o, { b: 1, duration: 0.22, ease: "power2.in", onUpdate: apply })
                    .to(o, { b: 0, duration: 0.4, ease: "power2.out", onUpdate: apply });
            };

            domains.forEach((d, idx) => {
                tl.add(() => {
                    // Dolly the camera: bring this node to the stage center (x & y) and
                    // scale up. Pan vector drives the motion-blur direction.
                    const { ox, oy } = camOffset(idx);
                    pulseBlur(ox - prevOff.ox, oy - prevOff.oy);
                    prevOff.ox = ox;
                    prevOff.oy = oy;
                    gsap.to(radBoxRef.current, {
                        xPercent: -ZOOM * ox * 100,
                        yPercent: -ZOOM * oy * 100,
                        scale: ZOOM,
                        duration: 0.6,
                        ease: "power3.inOut",
                        transformOrigin: "50% 50%",
                    });
                    // Rotate the sweep to point at this domain.
                    gsap.to(sweepRef.current, {
                        rotation: angDeg(idx),
                        duration: 0.45,
                        ease: "power3.inOut",
                        svgOrigin: "50 50",
                    });
                    // Lift the focused node, fade the rest right back so nothing
                    // crowds the spotlit competency.
                    nodes().forEach((node, i) => {
                        const on = i === idx;
                        gsap.set(node, { zIndex: on ? 60 : 1 });
                        gsap.to(node, {
                            scale: on ? 1.12 : 0.86,
                            opacity: on ? 1 : 0.16,
                            duration: 0.4,
                            ease: "power2.out",
                        });
                    });
                    verts().forEach((v, i) => {
                        gsap.to(v, {
                            scale: i === idx ? 1.9 : 1,
                            duration: 0.4,
                            ease: "back.out(2)",
                            transformOrigin: "50% 50%",
                        });
                    });
                    // The info window only lives while this competency holds the
                    // spotlight: dismiss the previous card, swap in this domain's
                    // data, then rise the window back in beneath the centered node.
                    const tier = tierFor(d.level);
                    const setCardContent = () => {
                        if (capIconRef.current) capIconRef.current.textContent = d.icon;
                        if (capTitleRef.current) capTitleRef.current.textContent = d.label;
                        if (capTierRef.current) {
                            capTierRef.current.textContent = tier.label;
                            capTierRef.current.style.backgroundColor = tier.color;
                        }
                        if (capLevelRef.current)
                            capLevelRef.current.textContent = `${d.level}%`;
                        if (capBlurbRef.current) capBlurbRef.current.textContent = d.blurb;
                    };
                    gsap
                        .timeline()
                        .to(capRef.current, {
                            autoAlpha: 0,
                            y: 14,
                            duration: 0.22,
                            ease: "power2.in",
                        })
                        .add(setCardContent)
                        .fromTo(
                            capRef.current,
                            { y: 26 },
                            { autoAlpha: 1, y: 0, duration: 0.46, ease: "power3.out" },
                        )
                        .fromTo(
                            capFillRef.current,
                            { width: "0%" },
                            { width: `${d.level}%`, duration: 0.6, ease: "power2.out" },
                            "<",
                        );
                });
                tl.to({}, { duration: 1.15 });
            });

            // 8. Restore the full web, settle — pull the camera back out. The info
            //    window is dismissed here, right after the last competency's spotlight.
            tl.add(() => {
                gsap.to(capRef.current, {
                    autoAlpha: 0, y: 16, duration: 0.4, ease: "power2.in",
                });
                gsap.to(radBoxRef.current, {
                    xPercent: 0,
                    yPercent: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power2.inOut",
                    transformOrigin: "50% 50%",
                    onComplete: () => {
                        if (radBoxRef.current) radBoxRef.current.style.filter = "none";
                        if (stageRef.current) {
                            stageRef.current.style.overflow = "visible";
                            stageRef.current.style.maskImage = "none";
                            stageRef.current.style.webkitMaskImage = "none";
                        }
                    },
                });
                nodes().forEach((node) => {
                    gsap.set(node, { zIndex: 1 });
                    gsap.to(node, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
                });
                verts().forEach((v) => {
                    gsap.to(v, { scale: 1, duration: 0.4, ease: "power2.out" });
                });
                gsap.to(sweepRef.current, {
                    rotation: angDeg(0),
                    duration: 0.5,
                    ease: "power2.inOut",
                    svgOrigin: "50 50",
                });
            });
            tl.to({}, { duration: 0.8 });

            // 9. Radar + caption out
            tl.to([radarRef.current, capRef.current], {
                opacity: 0,
                scale: 0.92,
                y: -20,
                duration: 0.6,
                ease: "power2.in",
                transformOrigin: "50% 50%",
            });
            tl.set([radarRef.current, capRef.current], { autoAlpha: 0 });

            // 10. Finale doodle + line
            tl.set(finaleBottomRef.current, { autoAlpha: 1 });
            tl.from(".comp-finale-doodle", {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                ease: "back.out(2)",
                stagger: { each: 0.05, from: "random" },
                transformOrigin: "50% 50%",
            });
            tl.set(finaleEl, { autoAlpha: 1 });
            tl.from(finaleEl.querySelectorAll("p"), {
                y: 40,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.15,
            });

            tl.to(
                [finaleRef.current, ".comp-finale-doodle"],
                {
                    opacity: 0,
                    y: -20,
                    duration: 0.6,
                    ease: "power2.in",
                },
                "+=2.4",
            );

            let completeDelay: gsap.core.Tween | null = null;
            tl.eventCallback("onComplete", () => {
                completeDelay = gsap.delayedCall(0.3, () => onComplete?.());
            });

            return () => {
                completeDelay?.kill();
                tl.kill();
                split.revert();
                split2.revert();
                gsap.killTweensOf([
                    ".rad-node-inner",
                    ".rad-orbit",
                    ".rad-node",
                    ".rad-vertex",
                ]);
                if (sweepRef.current) gsap.killTweensOf(sweepRef.current);
                if (radBoxRef.current) {
                    gsap.killTweensOf(radBoxRef.current);
                    radBoxRef.current.style.filter = "none";
                }
            };
        }
    }, [onComplete, user.name, active]);

    return (
        <WrappedShell
            sceneNumber="03"
            sceneLabel="Competencies"
            variant="blue"
            art={<CompetenciesArt />}
        >
            <div ref={rootRef} className="relative w-full h-full" style={{ perspective: "800px" }}>
                {/* Headline one */}
                <div
                    ref={containerRef}
                    style={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                >
                    <HeadlineScrim />
                    <p className="relative font-figtree font-black text-[clamp(26px,4.2vw,62px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Have you ever wondered
                    </p>
                    <p className="relative font-figtree font-bold text-2xl md:text-3xl mt-5">
                        how good are you now?
                    </p>
                </div>

                {/* Headline two */}
                <div
                    ref={container2_Ref}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                >
                    <HeadlineScrim />
                    <p className="relative font-figtree font-black text-[clamp(26px,4.2vw,62px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Here are your
                    </p>
                    <p className="relative font-figtree font-bold text-2xl md:text-3xl mt-5">
                        * strong points *
                    </p>
                </div>

                {/* Radar stage */}
                <div
                    ref={radarRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0"
                >
                    {/* Web centered in the space above the fixed caption. At rest the
                        stage is unclipped so the full octagon (nodes included) can
                        breathe; clipping + the soft edge mask are toggled on stageRef
                        only during the spotlight sweep, where the dollied-in web would
                        otherwise spill onto the caption. */}
                    <div
                        ref={stageRef}
                        className="absolute inset-x-0 top-[40px] bottom-[150px] flex items-center justify-center"
                    >
                        {/* Motion-blur filter, armed only during the spotlight sweep */}
                        <svg className="absolute w-0 h-0" aria-hidden>
                            <defs>
                                <filter
                                    id="comp-mblur"
                                    x="-30%"
                                    y="-30%"
                                    width="160%"
                                    height="160%"
                                    colorInterpolationFilters="sRGB"
                                >
                                    <feGaussianBlur
                                        ref={mblurRef}
                                        in="SourceGraphic"
                                        stdDeviation="0 0"
                                    />
                                </filter>
                            </defs>
                        </svg>
                        <div
                            ref={radBoxRef}
                            className="rad-box relative"
                            style={{
                                width: "min(78vmin, 660px)",
                                height: "min(78vmin, 660px)",
                                willChange: "transform, filter",
                            }}
                        >
                            <svg
                                className="absolute inset-0 w-full h-full overflow-visible"
                                viewBox="0 0 100 100"
                                aria-hidden
                            >
                                {/* Web rings (octagonal) */}
                                {RING_FRACS.map((f) => (
                                    <polygon
                                        key={f}
                                        className="rad-ring"
                                        points={ringPoints(f)}
                                        fill="none"
                                        stroke="#0a2236"
                                        strokeWidth={f === 1 ? 0.8 : 0.4}
                                        strokeOpacity={f === 1 ? 0.85 : 0.32}
                                        style={{ transformOrigin: "50px 50px" }}
                                    />
                                ))}

                                {/* Spokes */}
                                {domains.map((d, i) => {
                                    const [x, y] = pt(MAXR, i);
                                    return (
                                        <line
                                            key={`spoke-${d.id}`}
                                            className="rad-spoke"
                                            x1={C}
                                            y1={C}
                                            x2={x}
                                            y2={y}
                                            stroke="#0a2236"
                                            strokeWidth="0.4"
                                            strokeOpacity="0.32"
                                        />
                                    );
                                })}

                                {/* Decorative orbit ring (slow rotation) */}
                                <circle
                                    className="rad-orbit"
                                    cx={C}
                                    cy={C}
                                    r={MAXR + 7}
                                    fill="none"
                                    stroke="#0a2236"
                                    strokeWidth="0.3"
                                    strokeOpacity="0.3"
                                    strokeDasharray="0.6 3"
                                    style={{ transformOrigin: "50px 50px" }}
                                />

                                {/* Radar sweep pointer (points up = domain 0 by default) */}
                                <g
                                    ref={sweepRef}
                                    style={{ visibility: "hidden", opacity: 0, transformOrigin: "50px 50px" }}
                                >
                                    <polygon
                                        points={`${C},${C} ${C - 3.4},${C - MAXR} ${C + 3.4},${C - MAXR}`}
                                        fill="#f4a261"
                                        fillOpacity="0.22"
                                    />
                                    <line
                                        x1={C}
                                        y1={C}
                                        x2={C}
                                        y2={C - MAXR}
                                        stroke="#f4a261"
                                        strokeWidth="0.9"
                                        strokeLinecap="round"
                                    />
                                </g>

                                {/* Your proficiency polygon */}
                                <polygon
                                    className="rad-skill"
                                    points={skillPoints}
                                    fill="#f4a261"
                                    fillOpacity="0.34"
                                    stroke="#f4a261"
                                    strokeWidth="1.1"
                                    strokeLinejoin="round"
                                    style={{ transformOrigin: "50px 50px" }}
                                />

                                {/* Vertex dots */}
                                {domains.map((d, i) => {
                                    const [x, y] = pt((d.level / 100) * MAXR, i);
                                    return (
                                        <circle
                                            key={`v-${d.id}`}
                                            className="rad-vertex"
                                            cx={x}
                                            cy={y}
                                            r="1.4"
                                            fill="#0a2236"
                                            stroke="#fff"
                                            strokeWidth="0.5"
                                            style={{ transformOrigin: `${x}px ${y}px` }}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Core disc */}
                            <div
                                className="rad-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center"
                                style={{
                                    width: "30%",
                                    height: "30%",
                                    backgroundColor: "#0a2236",
                                    border: "2.5px solid #f2f2f2",
                                    boxShadow: "3px 3px 0 0 rgba(10,34,54,0.45)",
                                }}
                            >
                                <span
                                    ref={overallRef}
                                    className="font-figtree font-black leading-none text-[#f4a261]"
                                    style={{ fontSize: "clamp(20px,3.4vmin,34px)" }}
                                >
                                    0
                                </span>
                                <span className="font-montserrat font-bold uppercase tracking-[0.2em] text-[#f2f2f2]/80 text-[8px] mt-0.5">
                                    Overall
                                </span>
                            </div>

                            {/* Domain nodes in orbit */}
                            {domains.map((d, i) => {
                                const left = C + NODER * Math.cos(angRad(i));
                                const top = C + NODER * Math.sin(angRad(i));
                                const tier = tierFor(d.level);
                                return (
                                    <div
                                        key={`node-${d.id}`}
                                        className="rad-node absolute"
                                        style={{
                                            left: `${left}%`,
                                            top: `${top}%`,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                    >
                                        <div
                                            className="rad-node-inner flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1"
                                            style={{
                                                backgroundColor: tier.color,
                                                border: "2px solid #0a2236",
                                                boxShadow: "2.5px 2.5px 0 0 #0a2236",
                                            }}
                                        >
                                            <span
                                                className="grid place-items-center rounded-full shrink-0"
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    backgroundColor: "#fff",
                                                    border: "1.5px solid #0a2236",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {d.icon}
                                            </span>
                                            <span className="flex flex-col leading-none">
                                                <span className="font-figtree font-black text-[11px] text-[#0a2236] whitespace-nowrap">
                                                    {d.short}
                                                </span>
                                                <span className="font-montserrat font-bold text-[9px] text-[#0a2236]/65 tracking-wide">
                                                    {d.level}%
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    {/* Spotlight caption — fixed size & position so nothing
                        reflows or nudges the web as you move between domains */}
                    <div
                        ref={capRef}
                        style={{ visibility: "hidden", opacity: 0 }}
                        className="absolute inset-x-0 bottom-[64px] flex justify-center px-6"
                    >
                        <div
                            className="w-full max-w-2xl h-[112px] flex flex-col justify-center rounded-xl px-6"
                            style={{
                                backgroundColor: "rgba(10,34,54,0.92)",
                                border: "2px solid #0a2236",
                                boxShadow: "4px 4px 0 0 rgba(10,34,54,0.4)",
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <span ref={capIconRef} style={{ fontSize: 22 }}>
                                    {domains[0].icon}
                                </span>
                                <span
                                    ref={capTitleRef}
                                    className="font-figtree font-black text-[15px] text-[#f2f2f2] leading-tight flex-1 truncate"
                                >
                                    {domains[0].label}
                                </span>
                                <span
                                    ref={capTierRef}
                                    className="font-montserrat font-black uppercase tracking-[0.12em] text-[9px] text-[#0a2236] px-2 py-0.5 rounded-sm shrink-0"
                                    style={{ backgroundColor: tiers[0].color }}
                                >
                                    {tierFor(domains[0].level).label}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="relative h-1.5 flex-1 rounded-full overflow-hidden bg-[#f2f2f2]/15">
                                    <div
                                        ref={capFillRef}
                                        className="absolute inset-y-0 left-0 rounded-full"
                                        style={{ width: "0%", backgroundColor: "#f4a261" }}
                                    />
                                </div>
                                <span
                                    ref={capLevelRef}
                                    className="font-figtree font-black text-[12px] text-[#f4a261] tabular-nums w-9 text-right"
                                >
                                    {domains[0].level}%
                                </span>
                            </div>
                            <p
                                ref={capBlurbRef}
                                className="font-hind text-[14px] text-[#f2f2f2]/80 leading-snug mt-2 line-clamp-2"
                            >
                                {domains[0].blurb}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Finale bottom doodle */}
                <svg
                    ref={finaleBottomRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1600 900"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ visibility: "hidden", opacity: 0 }}
                    aria-hidden
                >
                    <path
                        className="comp-finale-doodle"
                        d="M 120 770 Q 150 750 180 770 T 240 770 T 300 770 T 360 770 T 420 770 T 480 770 T 540 770 T 600 770 T 660 770 T 720 770 T 780 770 T 840 770 T 900 770 T 960 770 T 1020 770 T 1080 770 T 1140 770 T 1200 770 T 1260 770 T 1320 770 T 1380 770 T 1440 770 T 1480 770"
                        fill="none"
                        stroke="#0a2236"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    <g className="comp-finale-doodle">
                        <polygon
                            points="280,820 288,838 308,842 288,846 280,866 272,846 252,842 272,838"
                            fill="#f4a261"
                            stroke="#0a2236"
                            strokeWidth="2"
                        />
                    </g>
                    <g className="comp-finale-doodle">
                        <rect x="797" y="806" width="6" height="40" fill="#0a2236" />
                        <rect x="780" y="823" width="40" height="6" fill="#0a2236" />
                    </g>
                    <g className="comp-finale-doodle">
                        <polygon points="1320,824 1344,848 1320,872 1296,848" fill="#0a2236" />
                    </g>
                    <g className="comp-finale-doodle">
                        <circle cx="140" cy="830" r="6" fill="#0a2236" />
                        <circle cx="158" cy="848" r="4" fill="#f4a261" />
                    </g>
                </svg>

                {/* Finale text */}
                <div
                    ref={finaleRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                >
                    <p className="relative font-figtree font-black text-[clamp(26px,4.2vw,62px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Sharper than you think.
                    </p>
                    <p className="relative font-figtree font-bold text-xl md:text-2xl mt-5 opacity-80">
                        strong points, logged.
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}

// A soft radial wash that sits behind the centered headline text — lifts the words
// off the busy ambient art so they never read as "overlapping" the graph.
function HeadlineScrim() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
                width: "min(118%, 1120px)",
                height: "62%",
                background:
                    "radial-gradient(60% 58% at 50% 50%, rgba(228,244,253,0.92) 0%, rgba(228,244,253,0.66) 42%, rgba(228,244,253,0) 78%)",
                filter: "blur(6px)",
            }}
        />
    );
}
