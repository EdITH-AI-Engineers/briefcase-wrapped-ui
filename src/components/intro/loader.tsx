"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

type BriefcaseLoaderProps = {
    onComplete: () => void;
};

// Fullscreen SVG canvas. viewBox is 1600x900 so flap lines reach the actual screen corners.
const VB_W = 1600;
const VB_H = 900;
const DIAMOND_CX = 800;
const DIAMOND_CY = 500;
const DIAMOND_HALF = 130;

const DIAMOND_TOP_Y = DIAMOND_CY - DIAMOND_HALF;
const DIAMOND_LEFT_X = DIAMOND_CX - DIAMOND_HALF;
const DIAMOND_RIGHT_X = DIAMOND_CX + DIAMOND_HALF;

// Midpoints of the two upper diamond edges — where the flap lines anchor.
const UPPER_LEFT_X = (DIAMOND_CX + DIAMOND_LEFT_X) / 2;
const UPPER_LEFT_Y = (DIAMOND_TOP_Y + DIAMOND_CY) / 2;
const UPPER_RIGHT_X = (DIAMOND_CX + DIAMOND_RIGHT_X) / 2;
const UPPER_RIGHT_Y = (DIAMOND_TOP_Y + DIAMOND_CY) / 2;

export function BriefcaseLoader({ onComplete }: BriefcaseLoaderProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<SVGGElement>(null);
    const flapLeftRef = useRef<SVGLineElement>(null);
    const flapRightRef = useRef<SVGLineElement>(null);
    const diamondRef = useRef<SVGRectElement>(null);
    const logoRef = useRef<SVGGElement>(null);
    const stageRef = useRef<SVGGElement>(null);
    const counterRef = useRef<SVGTextElement>(null);
    const completedRef = useRef(false);

    useEffect(() => {
        if (!overlayRef.current) return;

        const flapL = flapLeftRef.current;
        const flapR = flapRightRef.current;
        const flapLength = 1100;

        if (flapL) gsap.set(flapL, { strokeDasharray: flapLength, strokeDashoffset: flapLength });
        if (flapR) gsap.set(flapR, { strokeDasharray: flapLength, strokeDashoffset: flapLength });

        gsap.set(diamondRef.current, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(logoRef.current, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(dotRef.current, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(counterRef.current, { opacity: 0 });

        const tl = gsap.timeline();

        tl.to(diamondRef.current, {
            scale: 1, opacity: 1,
            duration: 0.7, ease: "back.out(2.2)",
        });

        tl.to(counterRef.current, { opacity: 1, duration: 0.25 }, ">");
        const counter = { v: 0 };
        tl.to(counter, {
            v: 100,
            duration: 1.2,
            ease: "power1.inOut",
            onUpdate: () => {
                if (counterRef.current) {
                    counterRef.current.textContent = `${Math.floor(counter.v).toString()}`;
                }
            },
        }, "<");

        tl.to({}, { duration: 0.6 });

        tl.to(counterRef.current, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
        }, ">");

        tl.to(logoRef.current, {
            scale: 1, opacity: 1,
            duration: 0.5, ease: "back.out(2.4)",
        }, "-=0.15");

        tl.to([flapL, flapR], {
            strokeDashoffset: 0,
            duration: 0.9, ease: "expo.out",
            stagger: 0.04,
        }, "-=0.5");

        tl.to(dotRef.current, {
            scale: 1, opacity: 1,
            duration: 0.45, ease: "back.out(2.4)",
        }, "-=0.5");

        tl.to({}, { duration: 0.6 });

        tl.to(dotRef.current, {
            y: -120, opacity: 0,
            duration: 0.6, ease: "power2.in",
        });

        tl.to(logoRef.current, {
            scale: 1, opacity: 0,
            duration: 0.5, ease: "back.out(2.4)",
        }, "-=0.15");

        tl.to(stageRef.current, {
            scale: 5, opacity: 0,
            duration: 0.85, ease: "power3.in",
            transformOrigin: "50% 75%",
        }, "-=0.05");

        tl.to(overlayRef.current, {
            opacity: 0,
            duration: 0.5, ease: "power2.inOut",
            onComplete: () => {
                if (!completedRef.current) {
                    completedRef.current = true;
                    onComplete();
                }
            },
        }, "-=0.25");

        return () => {
            tl.kill();
        };
    }, [onComplete]);

    return (
        <div
            ref={overlayRef}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a2236] overflow-hidden"
        >
            <div className="absolute top-6 left-8 right-8 z-10 flex items-center justify-between font-montserrat text-[11px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]">
                <span>Briefcase Home</span>
            </div>
            <div className="absolute bottom-6 left-8 right-8 z-10 flex items-center justify-between font-montserrat text-[10px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]/70">
                <span>Loading wrapped 2026</span>
                <span>EdiTH &middot; FEU Institute of Tech</span>
            </div>

            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                aria-hidden
            >
                <g ref={stageRef}>
                    <line
                        ref={flapLeftRef}
                        x1={UPPER_LEFT_X} y1={UPPER_LEFT_Y}
                        x2="0" y2="0"
                        stroke="#f2f2f2" strokeWidth="6" strokeLinecap="round"
                    />
                    <line
                        ref={flapRightRef}
                        x1={UPPER_RIGHT_X} y1={UPPER_RIGHT_Y}
                        x2={VB_W} y2="0"
                        stroke="#f2f2f2" strokeWidth="6" strokeLinecap="round"
                    />

                    {/* "Dot of the i" — cyan disc with white outline, sitting just above the diamond */}
                    <g ref={dotRef}>
                        <circle
                            cx={DIAMOND_CX}
                            cy={DIAMOND_TOP_Y - 100}
                            r="22"
                            fill="#08a0e9"
                            stroke="#f2f2f2"
                            strokeWidth="5"
                        />
                    </g>

                    {/* Diamond */}
                    <rect
                        ref={diamondRef}
                        x={DIAMOND_CX - DIAMOND_HALF} y={DIAMOND_CY - DIAMOND_HALF}
                        width={DIAMOND_HALF * 2} height={DIAMOND_HALF * 2}
                        transform={`rotate(45 ${DIAMOND_CX} ${DIAMOND_CY})`}
                        fill="#08a0e9" stroke="#f2f2f2" strokeWidth="6"
                    />

                    {/* Percentage counter placed inside the diamond */}
                    <text
                        ref={counterRef}
                        x={DIAMOND_CX}
                        y={DIAMOND_CY + 16}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Figtree, sans-serif"
                        fontWeight="900"
                        fontSize="52"
                        letterSpacing="4"
                        fill="#f2f2f2"
                    >
                        000 %
                    </text>

                    {/* Brand logo inside the diamond: white briefcase silhouette, cyan tie blends with the diamond */}
                    <g
                        ref={logoRef}
                        transform={`translate(${DIAMOND_CX - 64}, ${DIAMOND_CY - 56}) scale(2)`}
                    >
                        <path
                            d="M22 20 V14 a3 3 0 0 1 3-3 h14 a3 3 0 0 1 3 3 V20"
                            stroke="#f2f2f2" strokeWidth="4" fill="none" strokeLinecap="round"
                        />
                        <rect x="6" y="20" width="52" height="34" rx="3" fill="#f2f2f2" />
                        <line x1="6" y1="32" x2="58" y2="32" stroke="#08a0e9" strokeWidth="2" opacity="0.7" />
                        <polygon points="27,20 32,26 37,20" fill="#08a0e9" />
                        <polygon points="27,26 37,26 39,46 32,52 25,46" fill="#08a0e9" />
                    </g>
                </g>
            </svg>
        </div>
    );
}
