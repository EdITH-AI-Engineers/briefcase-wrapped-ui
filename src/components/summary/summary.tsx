"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { SummaryArt } from "@/components/wrapped-shell/scene-art";

gsap.registerPlugin(SplitText);

type WrappedSummaryProps = {
    user: { name: string };
    onComplete?: () => void;
};

export function WrappedSummary({ user, onComplete }: WrappedSummaryProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const container2_Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !container2_Ref.current) return;

        const split = SplitText.create(containerRef.current, {
            type: "lines, words",
            linesClass: "overflow-hidden",
        });

        const tl = gsap.timeline({ delay: 0.5 });

        gsap.set(container2_Ref.current, { autoAlpha: 0 });

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
        };
    }, [onComplete, user.name]);

    return (
        <WrappedShell
            sceneNumber="06"
            sceneLabel="Summary"
            marqueeText="signed  //  sealed  //  delivered  //  briefcase 2026"
            variant="navy"
            art={<SummaryArt />}
        >
            <div
                className="relative w-full h-full"
                style={{ perspective: "800px" }}
            >
                <div
                    ref={containerRef}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 text-[#f4a261]">
                        // 06 — Signed off
                    </p>
                    <p className="font-figtree font-black text-[clamp(32px,4.5vw,60px)] leading-[1.05] tracking-tight max-w-3xl">
                        The way you learned this year makes you more than a learner
                    </p>
                    <p className="font-figtree font-bold text-xl md:text-2xl mt-5 max-w-2xl">
                        Or should I say... someone becoming their own blueprint?
                    </p>
                </div>

                <div
                    ref={container2_Ref}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center"
                />
            </div>
        </WrappedShell>
    );
}
