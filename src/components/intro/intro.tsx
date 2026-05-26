"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { IntroArt } from "@/components/wrapped-shell/scene-art";
import { BriefcaseLoader } from "./loader";

gsap.registerPlugin(SplitText);

type WrappedIntroProps = {
    user: { name: string };
    onComplete?: () => void;
};

export function WrappedIntro({ user, onComplete }: WrappedIntroProps) {
    const [loaderDone, setLoaderDone] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loaderDone) return;
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

        tl.from(split.lines, {
            rotationX: -90,
            transformOrigin: "50% 0% -50px",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 1.2,
        });

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

        let completeDelay: gsap.core.Tween | null = null;

        tl.eventCallback("onComplete", () => {
            completeDelay = gsap.delayedCall(1.6, () => {
                onComplete?.();
            });
        });

        return () => {
            completeDelay?.kill();
            tl.kill();
            split.revert();
            split2.revert();
        };
    }, [onComplete, user.name, loaderDone]);

    return (
        <div className="relative w-full h-screen">
            <WrappedShell
                sceneNumber="01"
                sceneLabel="Intro"
                marqueeText="Hello there  //  briefcase wrapped 2026  //  let's go"
                variant="blue"
                art={<IntroArt />}
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
                            // 01 — Hello
                        </p>
                        <p className="font-figtree font-black text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-tight">
                            Hello {user.name.toLowerCase()}!
                        </p>
                        <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                            It&apos;s wrapped time!
                        </p>
                    </div>

                    <div
                        ref={readyRef}
                        className="absolute inset-0 flex flex-col justify-center items-center text-[#0a2236] text-center"
                    >
                        <p className="font-montserrat font-bold text-sm uppercase tracking-[0.4em] mb-3 opacity-70">
                            // 01 — Ready?
                        </p>
                        <p className="font-figtree font-black text-[clamp(48px,8vw,112px)] leading-[0.95] tracking-tight">
                            you ready?
                        </p>
                        <p className="font-figtree font-bold text-2xl md:text-3xl mt-5">
                            Let&apos;s start!
                        </p>
                    </div>
                </div>
            </WrappedShell>

            {!loaderDone && <BriefcaseLoader onComplete={() => setLoaderDone(true)} />}
        </div>
    );
}
