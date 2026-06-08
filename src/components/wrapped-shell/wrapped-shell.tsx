"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type Variant = "blue" | "navy" | "orange" | "cream";

type WrappedShellProps = {
    sceneNumber: string;
    sceneLabel: string;
    marqueeText?: string;
    variant?: Variant;
    children: ReactNode;
    art?: ReactNode;
};

const variants: Record<
    Variant,
    {
        background: string;
        ink: string;
        soft: string;
        accent: string;
        gridStroke: string;
        // Layered radial glows: a center "spotlight" behind the headline plus two
        // accent pools in opposite corners. Turns the flat gradient into a lit room.
        atmosphere: string;
    }
> = {
    blue: {
        background: "bg-[linear-gradient(135deg,_#08a0e9_0%,_#00c9ff_100%)]",
        ink: "#0a2236",
        soft: "#f2f2f2",
        accent: "#f4a261",
        gridStroke: "rgba(10,34,54,0.18)",
        atmosphere:
            "radial-gradient(56% 46% at 50% 40%, rgba(255,255,255,0.26), transparent 70%), radial-gradient(46% 42% at 84% 82%, rgba(244,162,97,0.24), transparent 72%), radial-gradient(42% 38% at 14% 16%, rgba(255,255,255,0.14), transparent 72%)",
    },
    navy: {
        background: "bg-[linear-gradient(150deg,_#2f4459_0%,_#1f2a3a_48%,_#121a26_100%)]",
        ink: "#f2f2f2",
        soft: "#08a0e9",
        accent: "#f4a261",
        gridStroke: "rgba(242,242,242,0.10)",
        atmosphere:
            "radial-gradient(56% 46% at 50% 40%, rgba(8,160,233,0.30), transparent 70%), radial-gradient(46% 42% at 84% 84%, rgba(244,162,97,0.20), transparent 72%), radial-gradient(42% 38% at 14% 16%, rgba(8,160,233,0.18), transparent 72%)",
    },
    orange: {
        background: "bg-[linear-gradient(135deg,_#f4a261_0%,_#e07a3b_100%)]",
        ink: "#1a2230",
        soft: "#0a2236",
        accent: "#08a0e9",
        gridStroke: "rgba(26,34,48,0.16)",
        atmosphere:
            "radial-gradient(52% 42% at 50% 40%, rgba(255,243,230,0.24), transparent 70%), radial-gradient(42% 38% at 16% 84%, rgba(8,160,233,0.16), transparent 72%)",
    },
    cream: {
        background: "bg-[linear-gradient(135deg,_#f4ead2_0%,_#e8dcb8_100%)]",
        ink: "#1a2230",
        soft: "#08a0e9",
        accent: "#f4a261",
        gridStroke: "rgba(26,34,48,0.14)",
        atmosphere:
            "radial-gradient(52% 42% at 50% 40%, rgba(255,255,255,0.32), transparent 70%), radial-gradient(42% 38% at 84% 18%, rgba(8,160,233,0.12), transparent 72%)",
    },
};

export function WrappedShell({
    sceneNumber,
    sceneLabel,
    marqueeText,
    variant = "blue",
    children,
    art,
}: WrappedShellProps) {
    const palette = variants[variant];
    const shellRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const sceneNumberRef = useRef<HTMLDivElement>(null);
    const cornerTopRef = useRef<HTMLDivElement>(null);
    const cornerBottomRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!shellRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cornerTopRef.current,
                { yPercent: -100, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
            );
            gsap.fromTo(
                cornerBottomRef.current,
                { yPercent: 100, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 },
            );
            gsap.fromTo(
                sceneNumberRef.current,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.25 },
            );
            gsap.fromTo(
                stripRef.current,
                { scaleX: 0, transformOrigin: "0% 50%" },
                { scaleX: 1, duration: 0.8, ease: "expo.out", delay: 0.35 },
            );

            if (marqueeRef.current) {
                const distance = marqueeRef.current.scrollWidth / 2;
                if (distance > 0) {
                    gsap.fromTo(
                        marqueeRef.current,
                        { x: 0 },
                        {
                            x: -distance,
                            duration: distance / 60,
                            ease: "none",
                            repeat: -1,
                        },
                    );
                }
            }
        }, shellRef);

        return () => ctx.revert();
    }, []);

    const repeatedMarquee = marqueeText
        ? Array.from({ length: 8 }).map((_, i) => marqueeText).join("  //  ")
        : null;

    return (
        <div ref={shellRef} className={`relative w-full h-screen overflow-hidden ${palette.background}`}>
            <GridPattern stroke={palette.gridStroke} />

            {/* Atmosphere: colored light pools + a center spotlight behind the headline */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ background: palette.atmosphere }}
            />

            {/* Bottom scrim: grounds the ticker and lets low-lying art recede instead
                of crowding it */}
            <div
                className="absolute inset-x-0 bottom-0 h-[24%] z-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(to top, rgba(8,16,26,0.55) 0%, rgba(8,16,26,0.22) 45%, transparent 100%)",
                }}
            />

            {/* Depth: a soft vignette pulls focus toward the center stage */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(125% 115% at 50% 38%, transparent 42%, rgba(10,34,54,0.30) 100%)",
                }}
            />

            {/* Texture: fine film grain keeps the flat gradient from reading as plastic */}
            <svg
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                style={{ opacity: 0.4, mixBlendMode: "soft-light" }}
                aria-hidden
            >
                <filter id="wrapped-grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.82"
                        numOctaves="2"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#wrapped-grain)" />
            </svg>

            {/* Editorial viewfinder frame */}
            <div
                className="wrapped-chrome absolute inset-[14px] z-20 pointer-events-none"
                style={{ border: `1.5px solid ${palette.ink}`, opacity: 0.16 }}
            />

            <div
                ref={cornerTopRef}
                className="wrapped-chrome absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
                style={{ color: palette.ink }}
            >
                <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 bg-white flex items-center justify-center">
                        <Image src="/briefcase-logo.svg" alt="Briefcase" width={34} height={34} />
                    </div>
                    <span className="font-figtree font-black text-xl tracking-tight">
                        Briefcase
                    </span>
                    <span
                        className="font-montserrat text-[11px] font-bold uppercase tracking-[0.25em] px-2 py-1 border-2"
                        style={{ borderColor: palette.ink }}
                    >
                        Wrapped &middot; 2026
                    </span> */}
                </div>
                {/* <div
                    ref={sceneNumberRef}
                    className="flex items-stretch font-montserrat text-[11px] font-bold uppercase tracking-[0.25em]"
                >
                    <span
                        className="px-2 py-1 border-2 border-r-0 flex items-center"
                        style={{ borderColor: palette.ink, color: palette.ink }}
                    >
                        {sceneLabel}
                    </span>
                    <span
                        className="px-3 py-1 border-2 font-figtree font-black text-base tracking-tight"
                        style={{ borderColor: palette.ink, backgroundColor: palette.ink, color: palette.soft }}
                    >
                        {sceneNumber}/06
                    </span>
                </div> */}
            </div>

            {art ? (
                <div className="absolute inset-0 z-0 pointer-events-none">{art}</div>
            ) : null}

            <div className="absolute inset-0 z-10 flex items-center justify-center px-6 py-12">
                {children}
            </div>

            <div
                ref={cornerBottomRef}
                className="wrapped-chrome absolute bottom-0 left-0 right-0 z-20"
                style={{ color: palette.ink }}
            >
                <div
                    ref={stripRef}
                    className="wrapped-strip h-[3px] w-full"
                    style={{ backgroundColor: palette.accent }}
                />
                {repeatedMarquee ? (
                    <div
                        className="wrapped-marquee overflow-hidden"
                        style={{ backgroundColor: palette.ink }}
                    >
                        <div
                            ref={marqueeRef}
                            className="whitespace-nowrap font-montserrat font-semibold uppercase tracking-[0.42em] text-[10px] py-[7px]"
                            style={{ color: palette.soft, opacity: 0.82 }}
                        >
                            <span className="mr-10">{repeatedMarquee}</span>
                            <span className="mr-10">{repeatedMarquee}</span>
                        </div>
                    </div>
                ) : null}
                {/* slim zone so the floating nav dots never sit on the ticker */}
                <div className="h-20" />
            </div>

            <CornerTicks color={palette.ink} />
        </div>
    );
}

function GridPattern({ stroke }: { stroke: string }) {
    // A single airy blueprint grid that fades toward the center stage — present at
    // the edges for structure, near-invisible where the content lives. The radial
    // mask trades the flat "graph paper" look for atmospheric depth.
    const fade =
        "radial-gradient(120% 95% at 50% 40%, rgba(0,0,0,0.32) 16%, rgba(0,0,0,0.72) 58%, #000 100%)";
    return (
        <svg
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maskImage: fade, WebkitMaskImage: fade }}
            aria-hidden
        >
            <defs>
                <pattern id="brut-grid" width="72" height="72" patternUnits="userSpaceOnUse">
                    <path d="M 72 0 L 0 0 0 72" fill="none" stroke={stroke} strokeWidth="1.25" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brut-grid)" />
        </svg>
    );
}

function CornerTicks({ color }: { color: string }) {
    const tick = "wrapped-chrome h-6 w-6 border-[3px] z-20 pointer-events-none";
    return (
        <>
            <div
                className={`absolute top-[10px] left-[10px] ${tick}`}
                style={{ borderColor: color, borderRight: "none", borderBottom: "none" }}
            />
            <div
                className={`absolute top-[10px] right-[10px] ${tick}`}
                style={{ borderColor: color, borderLeft: "none", borderBottom: "none" }}
            />
            <div
                className={`absolute bottom-[10px] left-[10px] ${tick}`}
                style={{ borderColor: color, borderRight: "none", borderTop: "none" }}
            />
            <div
                className={`absolute bottom-[10px] right-[10px] ${tick}`}
                style={{ borderColor: color, borderLeft: "none", borderTop: "none" }}
            />
        </>
    );
}
