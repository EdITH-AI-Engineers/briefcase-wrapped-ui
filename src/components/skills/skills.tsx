"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { SkillsArt } from "@/components/wrapped-shell/scene-art";
import skillsData from "@/data/skills.json";

gsap.registerPlugin(SplitText);

type WrappedSkillsProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

const { mastery, gaps } = skillsData;

// A 9-storey tower: top 4 mastery floors, an elided floor (···), then the 4 biggest
// skill gaps. Warm/bright at the top, cooling toward the base.
const TOP_MASTERY = mastery.slice(0, 4);
// The 4 biggest gaps (lowest levels) — the weakest skill is the ground floor.
const TOP_GAPS = gaps.slice(-4);
const MASTERY_FILL = ["#f4a261", "#f6b277", "#f8c590", "#f3dcae"];
const GAP_FILL = ["#b6ddf0", "#92cde9", "#5fbbe1", "#08a0e9"];

type Row =
    | { type: "floor"; floor: number; fill: string; name: string; icon: string; level: number; kind: "mastery" | "gap" }
    | { type: "gap-marker" };

const ROWS: Row[] = [
    ...TOP_MASTERY.map((s, i) => ({
        type: "floor" as const, floor: 9 - i, fill: MASTERY_FILL[i],
        name: s.name, icon: s.icon, level: s.level, kind: "mastery" as const,
    })),
    { type: "gap-marker" as const },
    ...TOP_GAPS.map((s, i) => ({
        type: "floor" as const, floor: 4 - i, fill: GAP_FILL[i],
        name: s.name, icon: s.icon, level: s.level, kind: "gap" as const,
    })),
];

export function WrappedSkills({ user, onComplete, active = true }: WrappedSkillsProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const container2_Ref = useRef<HTMLDivElement>(null);
    const buildingRef = useRef<HTMLDivElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;
        if (
            !rootRef.current ||
            !containerRef.current ||
            !container2_Ref.current ||
            !buildingRef.current ||
            !finaleRef.current
        )
            return;

        const finaleEl = finaleRef.current;

        const ctx = gsap.context(() => {
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

            // 1. Headline one
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
                delay: 1.1,
            });

            // 2. Headline two
            tl.set(container2_Ref.current, { autoAlpha: 1 });
            tl.from(split2.lines, {
                rotationX: -90,
                transformOrigin: "50% 0% -50px",
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.5,
                delay: 0.6,
            });
            tl.to(container2_Ref.current, {
                opacity: 0,
                y: -40,
                duration: 0.6,
                ease: "power2.in",
                delay: 0.7,
            });

            // 3. Clear the ambient art + chrome.
            tl.to(
                ".con-pop",
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

            // 4. Build it — crane swings in, foundation + lobby land, then floors
            //    stack up from the ground to the roof.
            tl.set(buildingRef.current, { autoAlpha: 1 });
            tl.from(".sk-crane", {
                x: -40,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            });
            tl.from(
                [".sk-ground", ".sk-base"],
                { y: 30, opacity: 0, duration: 0.5, ease: "back.out(1.6)", stagger: 0.1 },
                "-=0.2",
            );
            tl.from(
                ".sk-floor",
                {
                    yPercent: -40,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(1.5)",
                    stagger: { each: 0.1, from: "end" },
                },
                "-=0.1",
            );
            tl.from(
                ".sk-roof",
                { y: -50, opacity: 0, duration: 0.5, ease: "back.out(1.8)" },
                "-=0.2",
            );
            tl.from(
                ".sk-window",
                {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power1.out",
                    stagger: { each: 0.015, from: "random" },
                },
                "-=0.4",
            );
            tl.from(
                ".sk-side",
                {
                    x: 30,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    stagger: 0.12,
                },
                "-=0.5",
            );

            // Ambient life: antenna light blinks, the crane hook bobs.
            tl.add(() => {
                gsap.to(".sk-hook", {
                    y: 8, duration: 1.8, ease: "sine.inOut", repeat: -1, yoyo: true,
                });
            });
            tl.add(() => {
                gsap.to(".sk-beacon", {
                    opacity: 0.25,
                    scale: 0.7,
                    duration: 0.9,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    transformOrigin: "50% 50%",
                });
            });

            // 5. Hold on the finished tower.
            tl.to({}, { duration: 2.4 });

            // 6. Tower out.
            tl.to(buildingRef.current, {
                opacity: 0,
                y: -30,
                scale: 0.96,
                duration: 0.6,
                ease: "power2.in",
                transformOrigin: "50% 50%",
            });
            tl.set(buildingRef.current, { autoAlpha: 0 });

            // 7. Finale.
            tl.set(finaleEl, { autoAlpha: 1 });
            tl.from(finaleEl.querySelectorAll("p"), {
                y: 40,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.15,
            });
            tl.to(finaleEl, { opacity: 0, y: -20, duration: 0.6, ease: "power2.in" }, "+=2.2");

            let completeDelay: gsap.core.Tween | null = null;
            tl.eventCallback("onComplete", () => {
                completeDelay = gsap.delayedCall(0.3, () => onComplete?.());
            });

            return () => {
                completeDelay?.kill();
                split.revert();
                split2.revert();
            };
            // No scope arg: the ambient construction art (.con-pop) and chrome
            // (.wrapped-marquee) live OUTSIDE rootRef, so selectors must stay global.
        });

        return () => ctx.revert();
    }, [onComplete, user.name, active]);

    return (
        <WrappedShell
            sceneNumber="04"
            sceneLabel="Skills"
            marqueeText="your skill tower  //  mastery up top  //  room to grow"
            variant="cream"
            art={<SkillsArt />}
        >
            <div ref={rootRef} className="relative w-full h-full" style={{ perspective: "900px" }}>
                {/* Headline one */}
                <div
                    ref={containerRef}
                    style={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#1a2230] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(36px,6vw,84px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        You built a whole tower
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        floor by floor, all year
                    </p>
                </div>

                {/* Headline two */}
                <div
                    ref={container2_Ref}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#1a2230] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(36px,6vw,84px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Mastery up top.
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        room to grow below.
                    </p>
                </div>

                {/* The tower */}
                <div
                    ref={buildingRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="relative" style={{ width: "min(82vw, 520px)" }}>
                        {/* Tower crane — stands beside the building, lowering a block
                            onto the top. Signals: this is under construction. */}
                        <svg
                            className="sk-crane absolute pointer-events-none"
                            style={{ left: -64, top: -52, width: 360, height: 540 }}
                            viewBox="0 0 360 540"
                            aria-hidden
                        >
                            <rect x="6" y="44" width="40" height="34" fill="#1a2230" />
                            <line x1="40" y1="61" x2="78" y2="61" stroke="#1a2230" strokeWidth="5" />
                            <rect x="70" y="60" width="28" height="452" fill="none" stroke="#1a2230" strokeWidth="5" />
                            <line x1="72" y1="70" x2="96" y2="200" stroke="#1a2230" strokeWidth="2.5" />
                            <line x1="96" y1="70" x2="72" y2="200" stroke="#1a2230" strokeWidth="2.5" />
                            <line x1="72" y1="330" x2="96" y2="460" stroke="#1a2230" strokeWidth="2.5" />
                            <line x1="96" y1="330" x2="72" y2="460" stroke="#1a2230" strokeWidth="2.5" />
                            <rect x="68" y="62" width="32" height="26" fill="#f4a261" stroke="#1a2230" strokeWidth="3" />
                            <polygon points="98,54 340,60 340,74 98,76" fill="#f4a261" stroke="#1a2230" strokeWidth="3" />
                            <line x1="150" y1="60" x2="180" y2="76" stroke="#1a2230" strokeWidth="2" />
                            <line x1="220" y1="60" x2="250" y2="76" stroke="#1a2230" strokeWidth="2" />
                            <g className="sk-hook">
                                <line x1="300" y1="76" x2="300" y2="156" stroke="#1a2230" strokeWidth="3" />
                                <rect x="274" y="156" width="52" height="34" rx="3" fill="#f4a261" stroke="#1a2230" strokeWidth="4" />
                            </g>
                        </svg>

                        {/* Side labels */}
                        <div
                            className="sk-side absolute -right-3 top-[12%] translate-x-full hidden lg:flex items-center gap-2"
                            style={{ color: "#1a2230" }}
                        >
                            <span className="text-lg leading-none">▲</span>
                            <span className="font-montserrat font-black uppercase tracking-[0.2em] text-[11px] whitespace-nowrap">
                                Mastery
                            </span>
                        </div>
                        <div
                            className="sk-side absolute -right-3 bottom-[16%] translate-x-full hidden lg:flex items-center gap-2"
                            style={{ color: "#1a2230" }}
                        >
                            <span className="text-lg leading-none">▽</span>
                            <span className="font-montserrat font-black uppercase tracking-[0.2em] text-[11px] whitespace-nowrap">
                                Room to grow
                            </span>
                        </div>

                        {/* Roof — pitched cap + antenna beacon */}
                        <div className="sk-roof relative flex flex-col items-center">
                            <div className="flex items-end gap-1.5 mb-[-2px]">
                                <div className="w-[3px] h-8 bg-[#1a2230]" />
                                <span
                                    className="sk-beacon block rounded-full"
                                    style={{ width: 12, height: 12, backgroundColor: "#f4a261", border: "2px solid #1a2230", marginBottom: 24 }}
                                />
                            </div>
                            <div
                                className="w-0 h-0"
                                style={{
                                    borderLeft: "62px solid transparent",
                                    borderRight: "62px solid transparent",
                                    borderBottom: "26px solid #1a2230",
                                }}
                            />
                            <div className="h-3" style={{ width: "62%", backgroundColor: "#1a2230" }} />
                        </div>

                        {/* Floors (storeys) */}
                        <div className="flex flex-col items-center gap-[4px]">
                            {ROWS.map((r, i) => {
                                if (r.type === "gap-marker") {
                                    return (
                                        <div
                                            key="gap-marker"
                                            className="sk-floor flex items-center justify-center"
                                            style={{ width: "58%", height: 28 }}
                                        >
                                            <div
                                                className="flex items-center justify-center gap-[7px] w-full h-full"
                                                style={{ borderLeft: "3px solid #1a2230", borderRight: "3px solid #1a2230" }}
                                            >
                                                {[0, 1, 2].map((d) => (
                                                    <span key={d} className="block rounded-full"
                                                        style={{ width: 6, height: 6, backgroundColor: "#1a2230" }} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                const lit = Math.max(1, Math.round((r.level / 100) * 4));
                                return (
                                    <div
                                        key={r.name}
                                        className="sk-floor relative flex items-center gap-2.5 px-3"
                                        style={{
                                            width: `${80 + (i / 8) * 18}%`,
                                            height: r.kind === "mastery" ? 48 : 44,
                                            backgroundColor: r.fill,
                                            border: "3px solid #1a2230",
                                            boxShadow: "5px 5px 0 0 #1a2230",
                                        }}
                                    >
                                        <span className="text-[15px] leading-none shrink-0">{r.icon}</span>
                                        <span className="font-figtree font-black text-[14px] text-[#1a2230] leading-none truncate">
                                            {r.name}
                                        </span>
                                        <span className="ml-auto flex items-center gap-3 shrink-0">
                                            <span className="flex items-center gap-[3px]">
                                                {[0, 1, 2, 3].map((w) => (
                                                    <span key={w} className="sk-window block"
                                                        style={{
                                                            width: 9, height: 12,
                                                            backgroundColor: w < lit ? "#fff8e6" : "rgba(26,34,48,0.22)",
                                                            border: "1.5px solid #1a2230",
                                                        }} />
                                                ))}
                                            </span>
                                            <span className="font-figtree font-black text-[13px] text-[#1a2230] tabular-nums w-9 text-right">
                                                {r.level}%
                                            </span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Ground-floor lobby — wider base with a doorway */}
                        <div
                            className="sk-base relative flex items-end justify-center mt-[4px]"
                            style={{
                                width: "102%", height: 52, backgroundColor: "#1a2230",
                                boxShadow: "5px 5px 0 0 rgba(26,34,48,0.4)",
                            }}
                        >
                            <span className="absolute left-6 bottom-[10px] flex gap-2">
                                <span style={{ width: 16, height: 16, backgroundColor: "#fff8e6", border: "2px solid #f4ead2" }} />
                                <span style={{ width: 16, height: 16, backgroundColor: "#fff8e6", border: "2px solid #f4ead2" }} />
                            </span>
                            <span
                                style={{
                                    width: 34, height: 40, backgroundColor: "#f4a261",
                                    borderTopLeftRadius: 16, borderTopRightRadius: 16, border: "3px solid #f4ead2",
                                }}
                            />
                            <span className="absolute right-6 bottom-[10px] flex gap-2">
                                <span style={{ width: 16, height: 16, backgroundColor: "#fff8e6", border: "2px solid #f4ead2" }} />
                                <span style={{ width: 16, height: 16, backgroundColor: "#fff8e6", border: "2px solid #f4ead2" }} />
                            </span>
                        </div>

                        {/* Ground line */}
                        <div className="sk-ground flex flex-col items-center">
                            <div className="h-[5px] w-[112%] rounded-full" style={{ backgroundColor: "#1a2230" }} />
                            <div className="flex w-[112%] justify-between px-2 mt-1">
                                {Array.from({ length: 11 }).map((_, i) => (
                                    <span key={i} className="w-[2px] h-2.5" style={{ backgroundColor: "#1a2230", opacity: 0.45 }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Finale */}
                <div
                    ref={finaleRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#1a2230] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(36px,6vw,84px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Built different.
                    </p>
                    <p className="font-figtree font-bold text-xl md:text-2xl mt-5 opacity-80">
                        keep building, floor by floor.
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}
