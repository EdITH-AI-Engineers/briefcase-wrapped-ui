"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { AchievementsArt } from "@/components/wrapped-shell/scene-art";
import achievementsData from "@/data/achievements.json";

gsap.registerPlugin(SplitText);

type WrappedAchievmentsProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

export function WrappedAchievments({ user, onComplete, active = true }: WrappedAchievmentsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const sliderTrackRef = useRef<HTMLDivElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);
    const finaleBottomRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!active) return;
        if (
            !containerRef.current ||
            !readyRef.current ||
            !sliderRef.current ||
            !sliderTrackRef.current ||
            !finaleRef.current ||
            !finaleBottomRef.current
        ) return;

        gsap.set(readyRef.current, { autoAlpha: 0 });

        const split = SplitText.create(containerRef.current, {
            type: "lines, words",
            linesClass: "overflow-hidden",
        });

        const split2 = SplitText.create(readyRef.current, {
            type: "lines",
            linesClass: "overflow-hidden",
        });

        // Infinite horizontal scroll for the cards. Duplicate-and-wrap pattern:
        // the track contains two copies of the cards; we animate x by -halfWidth
        // and repeat. When the loop restarts, copy #2 is already in place so
        // there's no visual jump.
        const trackHalfWidth = sliderTrackRef.current.scrollWidth / 2;
        const scrollTween = gsap.to(sliderTrackRef.current, {
            x: -trackHalfWidth,
            duration: Math.max(20, trackHalfWidth / 60),
            ease: "none",
            repeat: -1,
            paused: true,
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

        // 6. Hide the marquee for the slider phase, then reveal the slider + cards
        tl.to(".wrapped-marquee", {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2.in",
        });
        tl.set(sliderRef.current, { autoAlpha: 1 });
        tl.from(".ach-card", {
            y: 100,
            opacity: 0,
            scale: 0.6,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.07,
        });

        // 7. Start the infinite scroll
        tl.call(() => scrollTween.play());

        // 8. Let the slider scroll for a while
        tl.to({}, { duration: 8 });

        // 9. Fade slider cards out
        tl.to(".ach-card", {
            opacity: 0,
            scale: 0.7,
            y: -30,
            duration: 0.45,
            stagger: { each: 0.04, from: "random" },
            ease: "power2.in",
        });
        tl.call(() => scrollTween.pause());
        tl.set(sliderRef.current, { autoAlpha: 0 });

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
            scrollTween.kill();
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
                        Did you did well this year?
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        Let&apos;s find out
                    </p>
                </div>

                {/* Achievements card slider — infinite horizontal scroll */}
                <div
                    ref={sliderRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                >
                    <div
                        ref={sliderTrackRef}
                        className="flex gap-8 will-change-transform"
                        style={{ width: "max-content" }}
                    >
                        {[...achievementsData.achievements, ...achievementsData.achievements].map((ach, i) => (
                            <div
                                key={`${ach.id}-${i}`}
                                className="ach-card shrink-0 flex flex-col items-center justify-center rounded-3xl p-6"
                                style={{
                                    backgroundColor: ach.color,
                                    width: 260,
                                    height: 320,
                                    boxShadow: "0 20px 50px -12px rgba(0,0,0,0.45)",
                                    transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                                }}
                            >
                                <div style={{ fontSize: 84, lineHeight: 1 }}>{ach.icon}</div>
                                <h3 className="font-figtree font-black text-xl text-[#0a2236] text-center mt-4 leading-tight">
                                    {ach.title}
                                </h3>
                                <p className="font-figtree font-medium text-sm text-[#0a2236]/70 text-center mt-2">
                                    {ach.description}
                                </p>
                                <span className="font-montserrat font-bold text-[10px] tracking-[0.25em] text-[#0a2236]/60 mt-4">
                                    {ach.year}
                                </span>
                            </div>
                        ))}
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
