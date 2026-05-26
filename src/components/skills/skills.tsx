"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { SkillsArt } from "@/components/wrapped-shell/scene-art";

gsap.registerPlugin(SplitText);

type WrappedSkillsProps = {
    user: { name: string };
    onComplete?: () => void;
};

export function WrappedSkills({ user, onComplete }: WrappedSkillsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const container2_Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !container2_Ref.current) return;

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

        tl.from(split.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 2,
        });

        tl.to(containerRef.current, {
            opacity: 0,
            y: -40,
            duration: 0.6,
            ease: "power2.in",
            delay: 1.2,
        });

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
    }, [onComplete, user.name]);

    return (
        <WrappedShell
            sceneNumber="04"
            sceneLabel="Skills"
            marqueeText="365 days of growth  //  your stack  //  shipped"
            variant="cream"
            art={<SkillsArt />}
        >
            <div
                className="relative w-full h-full"
                style={{ perspective: "800px" }}
            >
                <div
                    ref={containerRef}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#1a2230] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 opacity-70">
                        // 04 — The Stack
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        You have learned a lot this year
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        You have spent 365 days improving yourself
                    </p>
                </div>

                <div
                    ref={container2_Ref}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#1a2230] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 opacity-70">
                        // 04 — Inventory
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        What did you built into your stack?
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}
