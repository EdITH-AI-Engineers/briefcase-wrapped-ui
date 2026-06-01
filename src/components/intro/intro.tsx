"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { IntroArt } from "@/components/wrapped-shell/scene-art";

gsap.registerPlugin(SplitText);

type WrappedIntroProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

export function WrappedIntro({ user, onComplete, active = true }: WrappedIntroProps) {
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

        const tl = gsap.timeline();

        // 1. Design pops IN first — fully complete before text starts.
        tl.to(".intro-pop", {
            scale: 1,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(2.2)",
            stagger: { each: 0.05, from: "random" },
            transformOrigin: "50% 50%",
        });

        // 2. Hello text in (small gap after design lands).
        tl.from(
            split.lines,
            {
                rotationX: -90,
                transformOrigin: "50% 0% -50px",
                opacity: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 1.2,
            },
            "+=0.2",
        );

        gsap.set(containerRef.current, { opacity: 1 });

        tl.to(containerRef.current, {
            opacity: 0,
            y: -40,
            duration: 0.6,
            ease: "power2.in",
            delay: 0.8,
        });

        tl.set(readyRef.current, { autoAlpha: 1 });

        tl.from(split2.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 1,
            delay: 0.6,
        });

        tl.to(readyRef.current, {
            opacity: 0,
            y: -40,
            duration: 0.6,
            ease: "power2.in",
            delay: 0.8,
        });

        // 3. Design pops OUT after text has fully exited — small gap, then staggered.
        tl.to(
            ".intro-pop",
            {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                stagger: { each: 0.05, from: "random" },
                ease: "back.in(1.7)",
                transformOrigin: "50% 50%",
            },
            "+=0.25",
        );

        let completeDelay: gsap.core.Tween | null = null;

        tl.eventCallback("onComplete", () => {
            completeDelay = gsap.delayedCall(0.1, () => {
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
        <div className="relative w-full h-screen">
            <WrappedShell
                sceneNumber="01"
                sceneLabel="Intro"
                marqueeText="Briefcase Wrapped 2026 // Are you ready? // Share this with your friends!"
                variant="blue"
                art={<IntroArt />}
            >
                <div
                    className="relative w-full h-full"
                    style={{ perspective: "800px" }}
                >
                    <div
                        ref={containerRef}
                        style={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                    >
                        <p className="font-figtree font-black text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-tight">
                            Hello {user.name.toLowerCase()}!
                        </p>
                        <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                            It&apos;s wrapped time!
                        </p>
                    </div>

                    <div
                        ref={readyRef}
                        style={{ visibility: "hidden", opacity: 0 }}
                        className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                    >
                        <p className="font-figtree font-black text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-tight">
                            you ready?
                        </p>
                        <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                            Let&apos;s start!
                        </p>
                    </div>
                </div>
            </WrappedShell>
        </div>
    );
}
