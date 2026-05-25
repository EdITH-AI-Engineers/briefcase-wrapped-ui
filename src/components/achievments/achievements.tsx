"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

gsap.registerPlugin(SplitText);

type WrappedAchievmentsProps = {
    user: { name: string };
    onComplete?: () => void;
};

export function WrappedAchievments({ user, onComplete }: WrappedAchievmentsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const readyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
            stagger: 2,
        });

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
    }, [onComplete, user.name]);

    return (
        <div
            className="relative w-full h-screen bg-linear-to-r from-[#334454] to-[#282f3f]"
            style={{ perspective: "800px" }}
        >
            <div
                ref={containerRef}
                className="absolute inset-0 flex flex-col justify-center text-[#f2f2f2] text-center"
            >
                <p className="font-figtree font-extrabold text-7xl h-19">
                    3rd year looks like a blast!
                </p>
                <p className="font-figtree font-medium text-3xl">
                    you have been active, i guess
                </p>
            </div>

            <div
                ref={readyRef}
                className="absolute inset-0 flex flex-col justify-center text-[#f2f2f2] text-center"
            >
                <p className="font-figtree font-extrabold text-7xl h-19">
                    Did you did well this year?
                </p>
                <p className="font-figtree font-medium text-3xl">
                    Let&apos;s find out
                </p>
            </div>
        </div>
    );
}