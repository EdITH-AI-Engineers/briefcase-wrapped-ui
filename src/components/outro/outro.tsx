"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";

type WrappedOutroProps = {
    user: { name: string };
    onComplete?: () => void;
    active?: boolean;
};

// Same canvas + geometry as the intro loader, so the ending is literally its reverse.
const VB_W = 1600;
const VB_H = 900;
const CX = 800;
const CY = 500;
const HALF = 130;
const TOP_Y = CY - HALF;
const LEFT_X = CX - HALF;
const RIGHT_X = CX + HALF;
const UL_X = (CX + LEFT_X) / 2;
const UL_Y = (TOP_Y + CY) / 2;
const UR_X = (CX + RIGHT_X) / 2;
const UR_Y = (TOP_Y + CY) / 2;
const FLAP_LEN = 920;
const DOT_CY = TOP_Y - 100;

const LINES = [
    "So… that was your year.",
    "The wins, the gaps, the road ahead — all you.",
    "And you kept showing up. That’s the whole trick.",
    "See you in 2027.",
];

export function WrappedOutro({ active = true }: WrappedOutroProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<SVGGElement>(null);
    const flapLRef = useRef<SVGLineElement>(null);
    const flapRRef = useRef<SVGLineElement>(null);

    // Hide content before first paint so it never flashes during the slide-in.
    useIsoLayoutEffect(() => {
        if (rootRef.current) gsap.set(rootRef.current, { autoAlpha: 0 });
    }, []);

    useEffect(() => {
        if (!active || !rootRef.current) return;

        const ctx = gsap.context(() => {
            const flapL = flapLRef.current;
            const flapR = flapRRef.current;

            gsap.set(rootRef.current, { autoAlpha: 1 });
            gsap.set([".out-msg-1", ".out-msg-2", ".out-msg-3", ".out-msg-4"], { autoAlpha: 0 });
            gsap.set(lightRef.current, { autoAlpha: 1, scale: 1, transformOrigin: "50% 50%" });
            // the loader sits at 100% — it is revealed (not zoomed) as the app scales away
            gsap.set(stageRef.current, { autoAlpha: 0, scale: 1, scaleY: 1, y: 0, transformOrigin: "50% 50%" });
            gsap.set(".out-footer", { autoAlpha: 0 });
            gsap.set([flapL, flapR], { strokeDasharray: FLAP_LEN, strokeDashoffset: 0 }); // drawn = lid open
            gsap.set(dotRef.current, { y: 0 });

            const tl = gsap.timeline({ delay: 0.4 });
            const say = (sel: string, hold: number) => {
                tl.fromTo(sel, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.15");
                tl.to(sel, { autoAlpha: 0, y: -28, duration: 0.5, ease: "power2.in" }, `+=${hold}`);
            };

            // 1. the sign-off conversation (light blue)
            say(".out-msg-1", 1.2);
            say(".out-msg-2", 1.5);
            say(".out-msg-3", 1.5);
            say(".out-msg-4", 1.3); // "See you in 2027."

            // 2. the app scales down — revealing the loader at 100% (the loader itself is never scaled)
            tl.to(".wrapped-chrome", { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.1");
            tl.to(lightRef.current, { scale: 0, autoAlpha: 0, duration: 0.95, ease: "power2.in" }, "<");
            tl.to(stageRef.current, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, "-=0.78");
            tl.to(".out-footer", { autoAlpha: 1, duration: 0.5 }, "-=0.4");
            tl.to({}, { duration: 0.4 });

            // 3. REVERSE the open — the dot drops, the flaps retract into the case
            tl.to(dotRef.current, { y: 104, duration: 0.45, ease: "power2.in" });
            tl.to([flapL, flapR], { strokeDashoffset: FLAP_LEN, duration: 0.6, ease: "power3.inOut", stagger: 0.05 }, "-=0.3");

            // 4. the diamond + circle collapse, then drop
            tl.to(stageRef.current, { scaleY: 0.06, duration: 0.3, ease: "power2.in" }, "-=0.05");
            tl.to(stageRef.current, { y: 860, autoAlpha: 0, duration: 0.8, ease: "power2.in" });
        });

        return () => ctx.revert();
    }, [active]);

    return (
        <WrappedShell
            sceneNumber="07"
            sceneLabel="Wrap"
            marqueeText="that's a wrap  //  see you in 2027  //  briefcase wrapped 2026"
            variant="blue"
        >
            {/* NOTE: no overflow-hidden here — it would clip the full-bleed dark layer and
                leave the shell's light-blue padding ring showing. main already clips. */}
            <div ref={rootRef} className="relative w-full h-full">
                {/* dark loader base — overshoots well past the scene so no light blue remains */}
                <div className="absolute bg-[#0a2236]" style={{ inset: "-140px" }} />

                <div className="out-footer absolute top-7 left-9 right-9 flex items-center justify-between font-montserrat text-[11px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]">
                    <span>Briefcase Home</span>
                </div>
                <div className="out-footer absolute bottom-7 left-9 right-9 flex items-center justify-between font-montserrat text-[10px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]/70">
                    <span>See you in 2027</span>
                    <span>EdiTH &middot; FEU Institute of Tech</span>
                </div>

                {/* the loader stage (diamond + flaps + dot + mark) */}
                <div ref={stageRef} className="absolute inset-0">
                    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden>
                        <line ref={flapLRef} x1={UL_X} y1={UL_Y} x2="0" y2="0" stroke="#f2f2f2" strokeWidth="6" strokeLinecap="round" />
                        <line ref={flapRRef} x1={UR_X} y1={UR_Y} x2={VB_W} y2="0" stroke="#f2f2f2" strokeWidth="6" strokeLinecap="round" />

                        <g ref={dotRef}>
                            <circle cx={CX} cy={DOT_CY} r="22" fill="#08a0e9" stroke="#f2f2f2" strokeWidth="5" />
                        </g>

                        <rect
                            x={CX - HALF}
                            y={CY - HALF}
                            width={HALF * 2}
                            height={HALF * 2}
                            transform={`rotate(45 ${CX} ${CY})`}
                            fill="#08a0e9"
                            stroke="#f2f2f2"
                            strokeWidth="6"
                        />

                        <g transform={`translate(${CX - 64}, ${CY - 56}) scale(2)`}>
                            <path d="M22 20 V14 a3 3 0 0 1 3-3 h14 a3 3 0 0 1 3 3 V20" stroke="#f2f2f2" strokeWidth="4" fill="none" strokeLinecap="round" />
                            <rect x="6" y="20" width="52" height="34" rx="3" fill="#f2f2f2" />
                            <line x1="6" y1="32" x2="58" y2="32" stroke="#08a0e9" strokeWidth="2" opacity="0.7" />
                            <polygon points="27,20 32,26 37,20" fill="#08a0e9" />
                            <polygon points="27,26 37,26 39,46 32,52 25,46" fill="#08a0e9" />
                        </g>
                    </svg>
                </div>

                {/* light-blue conversation overlay — covers everything, then scales down into the loader */}
                <div
                    ref={lightRef}
                    className="absolute"
                    style={{
                        inset: "-140px",
                        backgroundImage:
                            "radial-gradient(60% 50% at 50% 42%, rgba(255,255,255,0.28), transparent 70%), linear-gradient(135deg, #08a0e9 0%, #00c9ff 100%)",
                    }}
                >
                    {LINES.map((line, i) => (
                        <div key={i} className={`out-msg-${i + 1} absolute inset-0 flex items-center justify-center text-center px-8 pointer-events-none`}>
                            <p className="font-figtree font-black text-[clamp(32px,5.4vw,76px)] leading-[1.04] tracking-tight text-[#0a2236] max-w-3xl">
                                {line}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </WrappedShell>
    );
}
