"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { AchievementsArt } from "@/components/wrapped-shell/scene-art";

gsap.registerPlugin(SplitText);

type WrappedAchievmentsProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

export function WrappedAchievments({ user, onComplete, active = true }: WrappedAchievmentsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;
        if (!containerRef.current || !readyRef.current) return;

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

        tl.from(split.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 2,
        });

        gsap.set(containerRef.current, { opacity: 1 });

        tl.to(containerRef.current, {
            opacity: 0,
            y: -40,
            duration: 0.6,
            ease: "power2.in",
            delay: 1.2,
        });

        tl.set(readyRef.current, { autoAlpha: 1 });

        tl.from(split2.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 1.2,
            delay: 1,
        });

        tl.to(readyRef.current, {
            opacity: 0,
            y: -40,
            duration: 1,
            ease: "power2.in",
            delay: 0.8,
        });

        let completeDelay: gsap.core.Tween | null = null;

        tl.eventCallback("onComplete", () => {
            completeDelay = gsap.delayedCall(1, () => {
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
                className="relative w-full h-full"
                style={{ perspective: "800px" }}
            >
                <div
                    ref={containerRef}
                    style={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 text-[#08a0e9]">
                        // 02 — Receipts
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        3rd year looks like a blast!
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        you have been active, i guess
                    </p>
                </div>

                <div
                    ref={readyRef}
                    style={{ visibility: "hidden", opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 text-[#08a0e9]">
                        // 02 — Verdict
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        Did you did well this year?
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        Let&apos;s find out
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}
