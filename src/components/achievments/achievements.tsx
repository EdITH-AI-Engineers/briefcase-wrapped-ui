"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { AchievementsArt } from "@/components/wrapped-shell/scene-art";
import achievementsData from "@/data/achievements.json";

gsap.registerPlugin(SplitText);

type WrappedAchievmentsProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

type BentoSize = "lg" | "md" | "sm";

// Dynamic bento sizing — always reads as a bento layout for any N items.
//
// Rule of thumb (for total ≥ 3):
//   • Index 0       → "lg" hero (2x2)
//   • Index % 3 === 1 → "md" wide (2x1)   — appears at 1, 4, 7, 10, …
//   • everything else → "sm" (1x1)
//
// With a 4-column grid this fills perfectly in chunks of three items:
//   row 1: [LG LG MD MD]
//   row 2: [LG LG SM SM]
//   row 3: [MD MD SM SM]   ← next three (md + 2 sm)
//   row 4: [MD MD SM SM]   ← and so on
//
// For very small counts (≤2) we switch to all-"md" so the page doesn't end up
// with one giant hero card hanging in empty space.
const buildSizeMap = (total: number): BentoSize[] => {
    if (total === 0) return [];
    if (total <= 2) return Array.from({ length: total }, () => "md" as BentoSize);
    return Array.from({ length: total }, (_, i) => {
        if (i === 0) return "lg";
        if (i % 3 === 1) return "md";
        return "sm";
    });
};

const spanClassFor = (size: BentoSize) =>
    size === "lg" ? "col-span-2 row-span-2"
        : size === "md" ? "col-span-2 row-span-1"
            : "col-span-1 row-span-1";

// On-brand card palette. The achievements.json ships generic pastels; here we
// override them with the Wrapped palette (orange / cream / cyan family) so the
// grid reads as the same brutalist-editorial world as every other scene.
// Navy ink (#0a2236) stays legible on every tone below.
const CARD_TONES = [
    "#f4a261", // orange   — hero
    "#f4ead2", // cream
    "#8fd0f0", // cyan
    "#f6b27f", // peach
    "#bfe3f7", // pale cyan
];
const toneFor = (i: number) => CARD_TONES[i % CARD_TONES.length];

export function WrappedAchievments({ user, onComplete, active = true }: WrappedAchievmentsProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);
    const bentoRef = useRef<HTMLDivElement>(null);
    const countRef = useRef<HTMLSpanElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);
    const finaleBottomRef = useRef<SVGSVGElement>(null);

    const achievements = achievementsData.achievements;
    const achievementSizes = buildSizeMap(achievements.length);
    const bentoCols = achievements.length <= 2 ? 2 : 4;

    // Hide content before first paint so it never flashes during the slide-in.
    useIsoLayoutEffect(() => {
        if (rootRef.current) gsap.set(rootRef.current, { autoAlpha: 0 });
    }, []);

    useEffect(() => {
        if (!active) return;
        if (
            !containerRef.current ||
            !readyRef.current ||
            !bentoRef.current ||
            !finaleRef.current ||
            !finaleBottomRef.current
        ) return;

        gsap.set(rootRef.current, { autoAlpha: 1 });
        gsap.set(readyRef.current, { autoAlpha: 0 });

        const split = SplitText.create(containerRef.current, {
            type: "lines, words",
            linesClass: "overflow-hidden",
        });

        const split2 = SplitText.create(readyRef.current, {
            type: "lines",
            linesClass: "overflow-hidden",
        });

        const tl = gsap.timeline({ delay: 0.5 });

        // 1. First headline in
        tl.from(split.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 2,
        });

        gsap.set(containerRef.current, { opacity: 1 });

        // 2. First headline out
        tl.to(containerRef.current, {
            opacity: 0,
            y: -40,
            duration: 0.6,
            ease: "power2.in",
            delay: 1.2,
        });

        tl.set(readyRef.current, { autoAlpha: 1 });

        // 3. Second headline in
        tl.from(split2.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 1.2,
            delay: 1,
        });

        // 4. Second headline out
        tl.to(readyRef.current, {
            opacity: 0,
            y: -40,
            duration: 1,
            ease: "power2.in",
            delay: 0.8,
        });

        // 5. Existing scene art pops off (random stagger)
        tl.to(
            [".ach-doodle", ".ach-medal", ".ach-rays", ".ach-spark", ".ach-stamp"],
            {
                scale: 0,
                opacity: 0,
                duration: 0.55,
                stagger: { each: 0.04, from: "random" },
                ease: "back.in(1.7)",
                transformOrigin: "50% 50%",
            },
            "+=0.1",
        );

        // 6. Hide the marquee + bottom strip while the bento is on screen
        tl.to([".wrapped-marquee", ".wrapped-strip"], {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2.in",
        });

        // 7. Header anchor reveals — a single concrete "you unlocked N" line.
        //    Giving the brain one clear, countable reward up front beats making
        //    it infer progress from a wall of cards.
        tl.set(bentoRef.current, { autoAlpha: 1 });
        tl.from(".bento-header", {
            y: -22,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
        });

        // Count-up runs concurrently with the grid snapping in (starts with step 8).
        const counter = { v: 0 };
        tl.to(
            counter,
            {
                v: achievements.length,
                duration: 0.9,
                ease: "power1.out",
                onUpdate: () => {
                    if (countRef.current) {
                        countRef.current.textContent = String(
                            Math.round(counter.v),
                        ).padStart(2, "0");
                    }
                },
            },
            ">-0.1",
        );

        // 8. Bento grid reveals — random staggered pop-in for that "everything snapping into place" feel
        tl.from(
            ".bento-card",
            {
                scale: 0.4,
                opacity: 0,
                y: 30,
                duration: 0.55,
                ease: "back.out(1.7)",
                stagger: { each: 0.06, from: "random" },
                transformOrigin: "50% 50%",
            },
            "<",
        );

        // 9. Spotlight scan — highlight one card at a time IN PLACE.
        //    Cards never fly around the screen: the active card lifts a touch
        //    while the rest dim back. One unambiguous focal point at any moment
        //    keeps the sequence calm and easy to track.
        const allCards = (): HTMLDivElement[] =>
            bentoRef.current
                ? Array.from(
                    bentoRef.current.querySelectorAll<HTMLDivElement>(".bento-card"),
                )
                : [];

        const SPOT_IN = 0.32;
        const SPOT_HOLD = 0.5;

        tl.to({}, { duration: 0.5 }); // let the grid settle first

        achievementSizes.forEach((_, idx) => {
            tl.call(() => {
                allCards().forEach((c, i) => {
                    const focused = i === idx;
                    gsap.set(c, { zIndex: focused ? 50 : 1 });
                    gsap.to(c, {
                        opacity: focused ? 1 : 0.24,
                        scale: focused ? 1.06 : 0.97,
                        duration: SPOT_IN,
                        ease: "power2.out",
                    });
                });
            });
            tl.to({}, { duration: SPOT_IN + SPOT_HOLD });
        });

        // 10. Restore the full grid, brief hold, then exit with reverse stagger
        tl.call(() => {
            allCards().forEach((c) => {
                gsap.set(c, { zIndex: 1 });
                gsap.to(c, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
            });
        });
        tl.to({}, { duration: 0.8 });
        tl.to(".bento-card", {
            scale: 0.4,
            opacity: 0,
            y: -20,
            duration: 0.45,
            ease: "back.in(1.5)",
            stagger: { each: 0.05, from: "random" },
            transformOrigin: "50% 50%",
        });
        tl.set(bentoRef.current, { autoAlpha: 0 });

        // 10. Bottom-only finale design pops in
        tl.set(finaleBottomRef.current, { autoAlpha: 1 });
        tl.from(".ach-finale-doodle", {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(2)",
            stagger: { each: 0.05, from: "random" },
            transformOrigin: "50% 50%",
        });

        // 11. Finale text reveals
        tl.set(finaleRef.current, { autoAlpha: 1 });
        tl.from(finaleRef.current.querySelectorAll("p"), {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.15,
        });

        // 12. Hold, then fade finale text + bottom design out together
        tl.to(
            [finaleRef.current, ".ach-finale-doodle"],
            {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power2.in",
            },
            "+=2.5",
        );

        let completeDelay: gsap.core.Tween | null = null;

        tl.eventCallback("onComplete", () => {
            completeDelay = gsap.delayedCall(0.3, () => {
                onComplete?.();
            });
        });

        return () => {
            completeDelay?.kill();
            tl.kill();
            split.revert();
            split2.revert();
        };
    }, [onComplete, user.name, active]);

    return (
        <WrappedShell
            sceneNumber="02"
            sceneLabel="Achievements"
            marqueeText="3rd year flex  //  badges unlocked  //  trophies +1"
            variant="navy"
            art={<AchievementsArt />}
        >
            <div
                ref={rootRef}
                className="relative w-full h-full"
                style={{ perspective: "800px" }}
            >
                {/* First headline */}
                <div
                    ref={containerRef}
                    style={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(28px,4.6vw,72px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        3rd year looks like a blast!
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        you have been active, i guess
                    </p>
                </div>

                {/* Second headline */}
                <div
                    ref={readyRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(28px,4.6vw,72px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        Did you do well this year?
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        Let&apos;s find out
                    </p>
                </div>

                {/* Bento achievements grid */}
                <div
                    ref={bentoRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6"
                >
                    {/* Count anchor — one concrete, countable reward */}
                    <div className="bento-header flex items-center gap-3">
                        <span
                            className="inline-block h-2 w-2 rotate-45"
                            style={{ backgroundColor: "#f4a261" }}
                        />
                        <span className="font-montserrat text-[11px] font-bold uppercase tracking-[0.34em] text-[#f2f2f2]/70">
                            Achievements Unlocked
                        </span>
                        <span
                            ref={countRef}
                            className="font-figtree font-black text-3xl leading-none tabular-nums"
                            style={{ color: "#f4a261" }}
                        >
                            00
                        </span>
                        <span
                            className="inline-block h-2 w-2 rotate-45"
                            style={{ backgroundColor: "#f4a261" }}
                        />
                    </div>

                    <div
                        className="grid gap-4 w-full max-w-6xl"
                        style={{
                            gridTemplateColumns: `repeat(${bentoCols}, minmax(0, 1fr))`,
                            gridAutoRows: "minmax(140px, 1fr)",
                            gridAutoFlow: "dense",
                            maxHeight: "calc(100vh - 15rem)",
                        }}
                    >
                        {achievements.map((ach, i) => {
                            const size = achievementSizes[i];
                            const spanClass = spanClassFor(size);
                            const emojiSize = size === "lg" ? 120 : size === "md" ? 64 : 52;
                            const plateSize = size === "lg" ? 168 : size === "md" ? 96 : 80;
                            return (
                                <div
                                    key={ach.id}
                                    className={`bento-card relative ${spanClass} rounded-[14px] overflow-hidden p-5`}
                                    style={{
                                        backgroundColor: toneFor(i),
                                        border: "2.5px solid #0a2236",
                                        boxShadow: "5px 5px 0 0 #0a2236",
                                    }}
                                >
                                    {/* Decorative tape strip */}
                                    <div
                                        className="absolute -top-2 left-1/2 w-20 h-5"
                                        style={{
                                            background:
                                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0 6px, rgba(255,255,255,0.3) 6px 12px)",
                                            transform: "translateX(-50%) rotate(-4deg)",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                        }}
                                    />

                                    {/* Index — top-left */}
                                    <div
                                        className="absolute top-3 left-4 font-figtree font-black text-xs"
                                        style={{ color: "rgba(10,34,54,0.4)" }}
                                    >
                                        №{String(ach.id).padStart(2, "0")}
                                    </div>

                                    {/* Year stamp — top-right */}
                                    <div
                                        className="absolute top-3 right-3 px-2 py-0.5 font-montserrat font-black text-[10px] tracking-[0.2em]"
                                        style={{
                                            backgroundColor: "#0a2236",
                                            color: "#f4a261",
                                            transform: "rotate(6deg)",
                                        }}
                                    >
                                        {ach.year}
                                    </div>

                                    {size === "md" ? (
                                        // Wide horizontal layout
                                        <div className="flex items-center gap-5 h-full px-2">
                                            <div
                                                className="shrink-0 rounded-full flex items-center justify-center"
                                                style={{
                                                    width: plateSize,
                                                    height: plateSize,
                                                    backgroundColor: "#ffffff",
                                                    border: "2.5px solid #0a2236",
                                                    boxShadow: "3px 3px 0 0 #0a2236",
                                                }}
                                            >
                                                <div style={{ fontSize: emojiSize, lineHeight: 1 }}>{ach.icon}</div>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-figtree font-black text-xl text-[#0a2236] leading-tight">
                                                    {ach.title}
                                                </h3>
                                                <p
                                                    className="font-figtree font-semibold text-sm mt-1 leading-snug"
                                                    style={{ color: "rgba(10,34,54,0.7)" }}
                                                >
                                                    {ach.description}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Vertical layout (default for lg + sm)
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div
                                                className="rounded-full flex items-center justify-center mt-4"
                                                style={{
                                                    width: plateSize,
                                                    height: plateSize,
                                                    backgroundColor: "#ffffff",
                                                    border: "2.5px solid #0a2236",
                                                    boxShadow: "3px 3px 0 0 #0a2236",
                                                }}
                                            >
                                                <div style={{ fontSize: emojiSize, lineHeight: 1 }}>{ach.icon}</div>
                                            </div>
                                            <h3
                                                className={`font-figtree font-black text-[#0a2236] text-center leading-tight px-3 ${size === "lg" ? "text-2xl mt-6" : "text-sm mt-3"
                                                    }`}
                                            >
                                                {ach.title}
                                            </h3>
                                            {size === "lg" && (
                                                <p
                                                    className="font-figtree font-semibold text-sm text-center mt-1.5 px-4 leading-snug"
                                                    style={{ color: "rgba(10,34,54,0.7)" }}
                                                >
                                                    {ach.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Finale bottom-only design */}
                <svg
                    ref={finaleBottomRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1600 900"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ visibility: "hidden", opacity: 0 }}
                    aria-hidden
                >
                    {/* Wavy underline across the bottom */}
                    <path
                        className="ach-finale-doodle"
                        d="M 80 770 Q 110 750 140 770 T 200 770 T 260 770 T 320 770 T 380 770 T 440 770 T 500 770 T 560 770 T 620 770 T 680 770 T 740 770 T 800 770 T 860 770 T 920 770 T 980 770 T 1040 770 T 1100 770 T 1160 770 T 1220 770 T 1280 770 T 1340 770 T 1400 770 T 1460 770 T 1520 770"
                        fill="none" stroke="#f4a261" strokeWidth="5" strokeLinecap="round"
                    />
                    {/* Cyan star */}
                    <g className="ach-finale-doodle">
                        <polygon
                            points="240,820 248,838 268,842 248,846 240,866 232,846 212,842 232,838"
                            fill="#08a0e9"
                        />
                    </g>
                    {/* White plus sign */}
                    <g className="ach-finale-doodle">
                        <rect x="497" y="800" width="6" height="40" fill="#f2f2f2" />
                        <rect x="480" y="817" width="40" height="6" fill="#f2f2f2" />
                    </g>
                    {/* Orange star */}
                    <g className="ach-finale-doodle">
                        <polygon
                            points="800,810 808,830 830,834 808,838 800,858 792,838 770,834 792,830"
                            fill="#f4a261" stroke="#f2f2f2" strokeWidth="2"
                        />
                    </g>
                    {/* White plus sign */}
                    <g className="ach-finale-doodle">
                        <rect x="1097" y="800" width="6" height="40" fill="#f2f2f2" />
                        <rect x="1080" y="817" width="40" height="6" fill="#f2f2f2" />
                    </g>
                    {/* Cyan diamond */}
                    <g className="ach-finale-doodle">
                        <polygon points="1340,820 1364,844 1340,868 1316,844" fill="#08a0e9" />
                    </g>
                    {/* Small dot accents */}
                    <g className="ach-finale-doodle">
                        <circle cx="80" cy="830" r="5" fill="#f4a261" />
                        <circle cx="96" cy="848" r="4" fill="#f2f2f2" />
                    </g>
                    <g className="ach-finale-doodle">
                        <circle cx="1520" cy="830" r="5" fill="#f4a261" />
                        <circle cx="1504" cy="848" r="4" fill="#f2f2f2" />
                    </g>
                </svg>

                {/* Finale text */}
                <div
                    ref={finaleRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-figtree font-black text-[clamp(36px,5.4vw,84px)] leading-[0.95] tracking-tight whitespace-nowrap">
                        You&apos;ve done good this year
                    </p>
                    <p className="font-figtree font-bold text-xl md:text-2xl mt-5 opacity-80">
                        keep going.
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}
