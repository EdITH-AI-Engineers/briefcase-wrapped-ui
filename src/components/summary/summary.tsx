"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useIsoLayoutEffect } from "@/lib/use-iso-layout-effect";
import { playTrack, fadeOutCurrent, playSfx, stopSfx } from "@/lib/audio";
import { WrappedShell } from "@/components/wrapped-shell/wrapped-shell";
import { SummaryArt } from "@/components/wrapped-shell/scene-art";
import type { ArchetypeData } from "@/lib/scene-data";

type WrappedSummaryProps = {
    user: { name: string };
    archetype: ArchetypeData;
    onComplete?: () => void;
    active?: boolean;
};

// Competency tier → archetype. The card art lives in /public.
const ARCHETYPES: Record<string, { name: string; image: string; aura: string; desc: string }> = {
    Advanced: {
        name: "Architect",
        image: "/Architect.png",
        aura: "#f4a261",
        desc: "They don't just see what is. They see what could be — and then they build it. Others bring problems; they leave with structures.",
    },
    Proficient: {
        name: "Scholar",
        image: "/Scholar.png",
        aura: "#5aa9e6",
        desc: "They live in the space between questions and answers. Depth is their instinct — they'd rather understand one thing fully than know a thousand things lightly.",
    },
    Developing: {
        name: "Apprentice",
        image: "/Apprentice.png",
        aura: "#e6b15a",
        desc: "They've found something worth staying for. Not yet sure of their place, but sure enough to keep showing up. There is a quiet fire in them that discipline hasn't touched yet.",
    },
    Emerging: {
        name: "Wanderer",
        image: "/Wanderer.png",
        aura: "#8fb6cf",
        desc: "Drawn to the unknown before they understood why. They learn by moving — restless, curious, and unafraid of being lost. The path finds them, not the other way around.",
    },
};
function archetypeFor(archetype: ArchetypeData) {
    const tier = archetype.tiers.find((t) => archetype.overall >= t.min) ?? archetype.tiers[archetype.tiers.length - 1];
    return ARCHETYPES[tier.label] ?? ARCHETYPES.Emerging;
}

// A single "?" face of the mystery card. Both faces of the spinner use this so the
// archetype is never glimpsed mid-spin.
function MysteryFace({ aura, flipped = false }: { aura: string; flipped?: boolean }) {
    return (
        <div
            className="absolute inset-0 rounded-[16px] overflow-hidden flex items-center justify-center"
            style={{
                backfaceVisibility: "hidden",
                transform: flipped ? "rotateY(180deg)" : undefined,
                background: "linear-gradient(160deg, #16203a 0%, #0a1022 60%, #070b16 100%)",
                border: `3px solid ${aura}`,
                boxShadow: `0 24px 50px rgba(0,0,0,0.6), 0 0 36px ${aura}55, inset 0 0 60px rgba(0,0,0,0.5)`,
            }}
        >
            <div className="absolute inset-[10px] rounded-[10px]" style={{ border: `2px solid ${aura}55` }} />
            {["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "left-3 bottom-3 border-l-2 border-b-2", "right-3 bottom-3 border-r-2 border-b-2"].map((c) => (
                <span key={c} className={`absolute h-5 w-5 ${c}`} style={{ borderColor: aura }} />
            ))}
            <span className="card-q font-figtree font-black leading-none" style={{ fontSize: "clamp(120px,22vh,200px)", color: aura, textShadow: `0 0 30px ${aura}, 0 0 60px ${aura}88` }}>
                ?
            </span>
            <span className="absolute bottom-6 font-montserrat font-black uppercase tracking-[0.4em] text-[11px]" style={{ color: `${aura}cc` }}>
                2026
            </span>
        </div>
    );
}

export function WrappedSummary({ user, archetype, onComplete, active = true }: WrappedSummaryProps) {
    const ARCHE = archetypeFor(archetype);
    const rootRef = useRef<HTMLDivElement>(null);
    const m1Ref = useRef<HTMLDivElement>(null);
    const m2Ref = useRef<HTMLDivElement>(null);
    const m3Ref = useRef<HTMLDivElement>(null);
    const mbRef = useRef<HTMLDivElement>(null);
    const qRef = useRef<HTMLDivElement>(null); // mystic line 1
    const q2Ref = useRef<HTMLDivElement>(null); // mystic line 2
    const blackRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const archeRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLButtonElement>(null);
    const flipRef = useRef<HTMLDivElement>(null);
    const scholarRef = useRef<HTMLDivElement>(null);
    const whiteRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<HTMLDivElement>(null);
    const revealRef = useRef<HTMLDivElement>(null);
    const kickerRef = useRef<HTMLParagraphElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const fallbackRef = useRef<gsap.core.Tween | null>(null);
    const flippedRef = useRef(false);
    const armedRef = useRef(false);
    const [armed, setArmed] = useState(false); // card is tappable (UI/cursor only)

    const flip = () => {
        if (flippedRef.current || !armedRef.current) return;
        flippedRef.current = true;
        armedRef.current = false;
        setArmed(false);
        fallbackRef.current?.kill();
        tlRef.current?.play();
    };

    // Horizontal delta to bring the card's centre to the scene centre (the "middle").
    const dxToCenter = () => {
        const c = cardRef.current?.getBoundingClientRect();
        const r = rootRef.current?.getBoundingClientRect();
        if (!c || !r) return 0;
        return r.left + r.width / 2 - (c.left + c.width / 2);
    };

    // Hide all content before first paint so it never flashes during the slide-in.
    useIsoLayoutEffect(() => {
        if (rootRef.current) gsap.set(rootRef.current, { autoAlpha: 0 });
    }, []);

    useEffect(() => {
        if (!active) return;
        const r = rootRef.current;
        if (!r || !blackRef.current || !archeRef.current || !cardRef.current || !flipRef.current) return;

        const ctx = gsap.context(() => {
            gsap.set(r, { autoAlpha: 1 }); // reveal the wrapper; children stay hidden below
            gsap.set([m2Ref.current, m3Ref.current, mbRef.current, qRef.current, q2Ref.current], { autoAlpha: 0 });
            gsap.set([blackRef.current, glowRef.current], { autoAlpha: 0 });
            gsap.set([archeRef.current, cardRef.current], { autoAlpha: 0 });
            gsap.set(revealRef.current, { autoAlpha: 0 });
            gsap.set([scholarRef.current, whiteRef.current], { autoAlpha: 0 });
            gsap.set(flipRef.current, { rotationY: 0 });

            const tl = gsap.timeline({ delay: 0.5 });
            tlRef.current = tl;
            const say = (el: Element | null, hold: number) => {
                tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.15");
                tl.to(el, { autoAlpha: 0, y: -28, duration: 0.5, ease: "power2.in" }, `+=${hold}`);
            };

            // 1. The little exchange.
            say(m1Ref.current, 1.3);
            say(m2Ref.current, 1.3);
            // the light-switch sfx has ~1.5s of lead-in, so fire it as the "turn off
            // the lights" line appears — its click lands as the room goes dark.
            tl.add(() => playSfx("/sfx-switch.m4a", { volume: 0.85 }));
            tl.fromTo(m3Ref.current, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.15");
            tl.to({}, { duration: 1.2 });

            // 2. Lights off — overview-1 bows out with the lights, flicker, black, chrome fades.
            tl.add(() => fadeOutCurrent());
            tl.to(blackRef.current, { autoAlpha: 0.55, duration: 0.08 });
            tl.to(blackRef.current, { autoAlpha: 0.1, duration: 0.09 });
            tl.to(blackRef.current, { autoAlpha: 0.7, duration: 0.07 });
            tl.to(blackRef.current, { autoAlpha: 1, duration: 0.5, ease: "power2.in" });
            tl.to(".wrapped-chrome", { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "<");
            tl.to(m3Ref.current, { autoAlpha: 0, duration: 0.4 }, "<");
            // soft ambient bed fills the dark, from lights-off until the flashbang.
            tl.add(() => playSfx("/sfx-ambient.m4a", { volume: 0.24, loop: true, fadeInMs: 1100 }));

            // 3. "Much better." then the oracle starts whispering.
            tl.fromTo(mbRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.35");
            tl.to(mbRef.current, { autoAlpha: 0, y: -18, duration: 0.5, ease: "power2.in" }, "+=1.2");
            say(qRef.current, 1.4);
            say(q2Ref.current, 1.4);

            // 4. The mystery card materialises.
            tl.set(archeRef.current, { autoAlpha: 1 });
            tl.to(glowRef.current, { autoAlpha: 1, duration: 1.1, ease: "power2.out" });
            tl.fromTo(cardRef.current, { autoAlpha: 0, y: 70, scale: 0.88 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)" }, "-=0.55");
            tl.fromTo(promptRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.25");

            // Suspense loops (run while we wait for the user).
            tl.add(() => {
                gsap.to(cardRef.current, { y: "+=12", duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
                gsap.to(glowRef.current, { scale: 1.12, opacity: 0.9, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true, transformOrigin: "50% 50%" });
                gsap.to(".card-q", { scale: 1.08, opacity: 0.72, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true, transformOrigin: "50% 50%" });
                gsap.to(".tap-ring", { scale: 1.7, opacity: 0, duration: 1.5, ease: "power1.out", repeat: -1, transformOrigin: "50% 50%" });
                gsap.to(".ov-ember", { y: -46, opacity: 0, duration: 3.2, ease: "none", repeat: -1, stagger: { each: 0.35, from: "random" } });
                armedRef.current = true; // now tappable
                setArmed(true);
            });

            // 5. PAUSE — wait for the user (auto-reveal after a while as a fallback).
            tl.addPause(undefined, () => {
                fallbackRef.current = gsap.delayedCall(9, () => {
                    if (!flippedRef.current) flip();
                });
            });

            // --- resumed by the tap ---
            tl.to(promptRef.current, { autoAlpha: 0, duration: 0.3 });
            // 1. card glides to the MIDDLE of the screen
            tl.to(cardRef.current, { x: () => dxToCenter(), scale: 1.08, duration: 0.6, ease: "power3.inOut" });
            // 2. it SPINS — long, slow at first, accelerating into a blur (still only "?")
            tl.add(() => playSfx("/sfx-spinning.m4a", { volume: 0.5 }));
            tl.to(flipRef.current, { rotationY: 2880, duration: 3.6, ease: "power2.in" });
            // 3. FLASHBANG — the whole screen snaps to white at the peak
            tl.to(whiteRef.current, { autoAlpha: 1, duration: 0.09, ease: "power1.in" }, "-=0.08");
            // 4. blinded — swap the mystery for the archetype behind the white, kill the
            //    dark-phase sfx, and bring in overview-2 as the card is revealed.
            tl.add(() => {
                gsap.set(flipRef.current, { autoAlpha: 0 });
                gsap.set(scholarRef.current, { autoAlpha: 1 });
                stopSfx("/sfx-ambient.m4a", { fadeMs: 250 });
                stopSfx("/sfx-spinning.m4a", { fadeMs: 200 });
                playTrack("/f-overview-2.m4a");
            });
            tl.to({}, { duration: 0.3 }); // held white
            // 5. CS2 recovery — the white drains away slowly, revealing the card
            tl.to(whiteRef.current, { autoAlpha: 0, duration: 1.6, ease: "power2.out" });
            tl.to({}, { duration: 0.35 }); // hold the moment at centre
            // 6. card returns to its original place
            tl.to(cardRef.current, { x: 0, scale: 1, duration: 0.78, ease: "power3.inOut" });
            // 7. the name + description arrive at the side
            tl.set(revealRef.current, { autoAlpha: 1 });
            tl.fromTo([kickerRef.current, nameRef.current], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.35");
            tl.fromTo(descRef.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.25");

            tl.to({}, { duration: 3.4 });

            let completeDelay: gsap.core.Tween | null = null;
            tl.eventCallback("onComplete", () => {
                completeDelay = gsap.delayedCall(0.4, () => onComplete?.());
            });
            return () => {
                completeDelay?.kill();
                fallbackRef.current?.kill();
            };
            // No scope: .wrapped-chrome lives OUTSIDE rootRef, fade must be global.
        });

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onComplete, user.name, active]);

    const msgClass = "absolute inset-0 flex flex-col justify-center items-center text-[#f2f2f2] text-center px-8";

    return (
        <WrappedShell
            sceneNumber="06"
            sceneLabel="Overview"
            marqueeText="one more  //  lights off  //  who did you become?"
            variant="navy"
            art={<SummaryArt />}
        >
            <div ref={rootRef} className="relative w-full h-full" style={{ perspective: "1200px" }}>
                {/* Lights-off blackout — covers the whole scene */}
                <div
                    ref={blackRef}
                    className="absolute -inset-x-6 -inset-y-12"
                    style={{ background: "radial-gradient(125% 95% at 50% 44%, #0c0f17 0%, #06080d 55%, #000 100%)" }}
                />

                {/* messages */}
                <div ref={m1Ref} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(34px,5.6vw,76px)] leading-[1.0] tracking-tight">Thought this was the end.</p>
                </div>
                <div ref={m2Ref} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(34px,5.6vw,76px)] leading-[1.0] tracking-tight">I&apos;ve got one more in me.</p>
                </div>
                <div ref={m3Ref} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(32px,5vw,68px)] leading-[1.05] tracking-tight max-w-3xl">
                        But before that&hellip; let&apos;s turn off the lights.
                    </p>
                </div>
                <div ref={mbRef} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(40px,6.4vw,88px)] leading-[1.0] tracking-tight" style={{ color: "#f4ead2" }}>
                        Much better.
                    </p>
                </div>
                <div ref={qRef} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(34px,5.4vw,74px)] leading-[1.04] tracking-tight max-w-3xl">
                        I&apos;ve been reading you all year.
                    </p>
                </div>
                <div ref={q2Ref} className={msgClass}>
                    <p className="font-figtree font-black text-[clamp(34px,5.4vw,74px)] leading-[1.04] tracking-tight max-w-3xl">
                        And I already know what you are.
                    </p>
                </div>

                {/* archetype reveal */}
                <div ref={archeRef} className="absolute inset-0 flex items-center justify-center">
                    <div
                        ref={glowRef}
                        className="absolute pointer-events-none"
                        style={{
                            width: "min(120vmin, 1100px)",
                            height: "min(120vmin, 1100px)",
                            background: `radial-gradient(circle, ${ARCHE.aura}40 0%, ${ARCHE.aura}14 38%, transparent 68%)`,
                            filter: "blur(8px)",
                        }}
                    />

                    {Array.from({ length: 12 }).map((_, i) => (
                        <span
                            key={i}
                            className="ov-ember absolute rounded-full pointer-events-none"
                            style={{
                                left: `${12 + ((i * 37) % 76)}%`,
                                top: `${28 + ((i * 53) % 50)}%`,
                                width: i % 3 === 0 ? 5 : 3,
                                height: i % 3 === 0 ? 5 : 3,
                                background: ARCHE.aura,
                                opacity: 0.5,
                                boxShadow: `0 0 8px ${ARCHE.aura}`,
                            }}
                        />
                    ))}

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 px-[7%] w-full">
                        {/* the flip card */}
                        <button
                            ref={cardRef}
                            type="button"
                            onClick={flip}
                            aria-label="Reveal your archetype"
                            className={`relative shrink-0 select-none bg-transparent border-0 p-0 ${armed ? "cursor-pointer" : "cursor-default"}`}
                            style={{ perspective: "1400px", height: "min(72vh, 560px)", aspectRatio: "389 / 600" }}
                        >
                            {/* the spinning mystery — BOTH faces are "?", so the archetype never shows while it spins */}
                            <div ref={flipRef} className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                                <MysteryFace aura={ARCHE.aura} />
                                <MysteryFace aura={ARCHE.aura} flipped />
                            </div>
                            {/* the archetype card — hidden until the flashbang clears */}
                            <div
                                ref={scholarRef}
                                className="absolute inset-0 rounded-[16px] overflow-hidden"
                                style={{ opacity: 0, boxShadow: `0 24px 50px rgba(0,0,0,0.6), 0 0 40px ${ARCHE.aura}66` }}
                            >
                                <Image src={ARCHE.image} alt={ARCHE.name} fill priority sizes="40vw" style={{ objectFit: "cover" }} />
                            </div>
                        </button>

                        {/* right column — prompt (suspense) overlaid on the read-out (reveal) */}
                        <div className="relative max-w-md w-full md:w-auto text-center md:text-left">
                            {/* the read-out (in flow, sizes the column) */}
                            <div ref={revealRef} className="text-[#f2f2f2]">
                                <p ref={kickerRef} className="font-montserrat font-bold uppercase tracking-[0.4em] text-[12px]" style={{ color: ARCHE.aura }}>
                                    {user.name.split(" ")[0]}, your 2026 archetype
                                </p>
                                <h2 ref={nameRef} className="font-figtree font-black text-[clamp(52px,8vw,104px)] leading-[0.92] tracking-tight mt-2">
                                    {ARCHE.name}
                                </h2>
                                <p ref={descRef} className="font-hind text-[clamp(15px,1.5vw,18px)] leading-relaxed mt-6 text-[#f2f2f2]/82">
                                    {ARCHE.desc}
                                </p>
                            </div>

                            {/* the suspense prompt — mystic, never says "click" outright */}
                            <div ref={promptRef} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-[#f2f2f2]">
                                <p className="font-figtree font-black text-[clamp(26px,3.4vw,46px)] leading-[1.06] tracking-tight max-w-sm">
                                    It already knows your name.
                                </p>
                                <p className="font-hind text-[clamp(14px,1.4vw,17px)] leading-relaxed mt-4 max-w-xs text-[#f2f2f2]/72">
                                    I won&apos;t be the one to say it. Some truths you have to turn over yourself.
                                </p>
                                <button
                                    type="button"
                                    onClick={flip}
                                    className="tap-ring-host relative mt-7 flex items-center gap-3 bg-transparent border-0 p-0 cursor-pointer text-[#f2f2f2] group"
                                >
                                    <span className="relative grid place-items-center" style={{ width: 40, height: 40 }}>
                                        <span className="tap-ring absolute inset-0 rounded-full" style={{ border: `1.5px solid ${ARCHE.aura}` }} />
                                        <span className="block rounded-full" style={{ width: 9, height: 9, backgroundColor: ARCHE.aura, boxShadow: `0 0 12px ${ARCHE.aura}` }} />
                                    </span>
                                    <span className="font-figtree font-black italic text-lg tracking-tight" style={{ color: `${ARCHE.aura}` }}>
                                        turn it over&hellip;
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CS2-style flashbang — must sit ABOVE the card (whose flex wrapper is
                    z-10 in this stacking context), so the whiteout fully hides the swap. */}
                <div
                    ref={whiteRef}
                    className="absolute -inset-x-6 -inset-y-12 z-[60] pointer-events-none"
                    style={{ backgroundColor: "#ffffff" }}
                />
            </div>
        </WrappedShell>
    );
}
