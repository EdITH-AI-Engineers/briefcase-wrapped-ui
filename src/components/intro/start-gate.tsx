"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { unlockAudio } from "@/lib/audio";

type StartGateProps = {
    onStart: () => void; // mount the loader (unlock audio happens here)
    onClose: () => void; // remove the gate after it fades
};

// A deliberate "tap to begin" cover. Its single click is the user gesture that
// unlocks audio for the whole session, so the loader + every track play with no
// further interaction. Styled to match the loader so the hand-off is seamless.
export function StartGate({ onStart, onClose }: StartGateProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const doneRef = useRef(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".sg-rise", { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.15 });
            gsap.to(".sg-pulse", { scale: 1.9, opacity: 0, duration: 1.6, ease: "power1.out", repeat: -1, transformOrigin: "50% 50%" });
            gsap.to(".sg-dot", { opacity: 0.4, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.to(".sg-glow", { scale: 1.08, opacity: 0.9, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" });
        }, rootRef);
        return () => ctx.revert();
    }, []);

    const begin = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        unlockAudio(); // MUST be synchronous inside the gesture
        onStart(); // loader mounts behind the gate
        gsap.to(contentRef.current, { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" });
        gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut", delay: 0.15, onComplete: onClose });
    };

    return (
        <div
            ref={rootRef}
            onClick={begin}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && begin()}
            role="button"
            tabIndex={0}
            aria-label="Tap to begin Briefcase Wrapped 2026"
            className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0a2236] cursor-pointer select-none"
        >
            {/* ambient glow */}
            <div
                className="sg-glow absolute pointer-events-none"
                style={{
                    width: "min(120vmin, 1100px)",
                    height: "min(120vmin, 1100px)",
                    background: "radial-gradient(circle, rgba(8,160,233,0.30) 0%, rgba(8,160,233,0.08) 40%, transparent 70%)",
                    filter: "blur(6px)",
                }}
            />

            <div className="absolute top-7 left-9 right-9 flex items-center justify-between font-montserrat text-[11px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]">
                <span className="sg-rise">Briefcase Home</span>
            </div>
            <div className="absolute bottom-7 left-9 right-9 flex items-center justify-between font-montserrat text-[10px] font-bold uppercase tracking-[0.3em] text-[#08a0e9]/70">
                <span className="sg-rise">Wrapped &middot; 2026</span>
                <span className="sg-rise">EdiTH &middot; FEU Institute of Tech</span>
            </div>

            <div ref={contentRef} className="relative z-10 flex flex-col items-center text-center px-6">
                <p className="sg-rise font-montserrat font-black uppercase tracking-[0.42em] text-[12px] text-[#f4a261]">
                    Your year, sealed
                </p>
                <h1 className="sg-rise font-figtree font-black leading-[0.86] tracking-tight text-[#f2f2f2] mt-4 text-[clamp(58px,11vw,148px)]">
                    Briefcase
                    <br />
                    <span className="text-[#08a0e9]">Wrapped</span>
                </h1>

                <div className="sg-rise mt-9 flex items-center gap-3 text-[#f2f2f2]">
                    <span className="relative grid place-items-center" style={{ width: 44, height: 44 }}>
                        <span className="sg-pulse absolute inset-0 rounded-full" style={{ border: "2px solid #08a0e9" }} />
                        <span className="sg-dot grid place-items-center rounded-full text-base" style={{ width: 44, height: 44, backgroundColor: "#08a0e9", color: "#0a2236" }}>
                            ▶
                        </span>
                    </span>
                    <span className="font-figtree font-black text-xl tracking-tight">Tap anywhere to begin</span>
                </div>

                <p className="sg-rise font-hind text-[13px] tracking-wide text-[#f2f2f2]/55 mt-5">
                    🔊 best experienced with sound on
                </p>
            </div>
        </div>
    );
}
