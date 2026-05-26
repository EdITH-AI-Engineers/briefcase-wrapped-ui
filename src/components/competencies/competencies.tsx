"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { CompetenciesArt } from "@/components/wrapped-shell/scene-art";

gsap.registerPlugin(SplitText);

type WrappedCompetenciesProps = {
    user: { name: string };
    onComplete?: () => void;
};

export function WrappedCompetencies({ user, onComplete }: WrappedCompetenciesProps) {
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
            sceneNumber="03"
            sceneLabel="Competencies"
            marqueeText="strong points  //  measured  //  receipts attached"
            variant="blue"
            art={<CompetenciesArt />}
        >
            <div
                className="relative w-full h-full"
                style={{ perspective: "800px" }}
            >
                <div
                    ref={containerRef}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 opacity-70">
                        // 03 — Self check
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        Have you ever wondered
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        how good are you now?
                    </p>
                </div>

                <div
                    ref={container2_Ref}
                    className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 opacity-70">
                        // 03 — Result
                    </p>
                    <p className="font-figtree font-black text-[clamp(40px,6.5vw,88px)] leading-[0.95] tracking-tight max-w-4xl">
                        Here are your
                    </p>
                    <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                        * strong points *
                    </p>
                </div>
            </div>
        </WrappedShell>
    );
}
