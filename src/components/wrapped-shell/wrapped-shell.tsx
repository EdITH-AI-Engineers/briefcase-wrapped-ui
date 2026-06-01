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
    }
> = {
    blue: {
        background: "bg-[linear-gradient(135deg,_#08a0e9_0%,_#00c9ff_100%)]",
        ink: "#0a2236",
        soft: "#f2f2f2",
        accent: "#f4a261",
        gridStroke: "rgba(10,34,54,0.18)",
    },
    navy: {
        background: "bg-[linear-gradient(135deg,_#334454_0%,_#1a2230_100%)]",
        ink: "#f2f2f2",
        soft: "#08a0e9",
        accent: "#f4a261",
        gridStroke: "rgba(242,242,242,0.10)",
    },
    orange: {
        background: "bg-[linear-gradient(135deg,_#f4a261_0%,_#e07a3b_100%)]",
        ink: "#1a2230",
        soft: "#0a2236",
        accent: "#08a0e9",
        gridStroke: "rgba(26,34,48,0.16)",
    },
    cream: {
        background: "bg-[linear-gradient(135deg,_#f4ead2_0%,_#e8dcb8_100%)]",
        ink: "#1a2230",
        soft: "#08a0e9",
        accent: "#f4a261",
        gridStroke: "rgba(26,34,48,0.14)",
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

            <div
                ref={cornerTopRef}
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
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

            <div className="absolute inset-0 z-10 flex items-center justify-center px-8 py-32">
                {children}
            </div>

            <div
                ref={cornerBottomRef}
                className="absolute bottom-0 left-0 right-0 z-20"
                style={{ color: palette.ink }}
            >
                <div
                    ref={stripRef}
                    className="h-1.5 w-full"
                    style={{ backgroundColor: palette.ink }}
                />
                {repeatedMarquee ? (
                    <div
                        className="wrapped-marquee overflow-hidden border-t-2 border-b-2"
                        style={{ borderColor: palette.ink, backgroundColor: palette.ink }}
                    >
                        <div
                            ref={marqueeRef}
                            className="whitespace-nowrap font-figtree font-black text-2xl py-1"
                            style={{ color: palette.soft }}
                        >
                            <span className="mr-8">{repeatedMarquee}</span>
                            <span className="mr-8">{repeatedMarquee}</span>
                        </div>
                    </div>
                ) : null}
                <div
                    className="flex items-center justify-between px-8 py-10 font-montserrat text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: palette.ink }}
                >
                    {/* <span>{`>>> scene ${sceneNumber} / ${sceneLabel.toLowerCase()}`}</span>
                    <span>EdiTH &middot; FEU Institute of Tech</span> */}
                </div>
            </div>

            <CornerTicks color={palette.ink} />
        </div>
    );
}

function GridPattern({ stroke }: { stroke: string }) {
    return (
        <svg
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <defs>
                <pattern id="brut-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                    <path d="M 64 0 L 0 0 0 64" fill="none" stroke={stroke} strokeWidth="1.5" />
                </pattern>
                <pattern id="brut-grid-fine" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brut-grid-fine)" />
            <rect width="100%" height="100%" fill="url(#brut-grid)" />
        </svg>
    );
}

function CornerTicks({ color }: { color: string }) {
    const tick = "h-4 w-4 border-2";
    return (
        <>
            <div
                className={`absolute top-20 left-6 ${tick}`}
                style={{ borderColor: color, borderRight: "none", borderBottom: "none" }}
            />
            <div
                className={`absolute top-20 right-6 ${tick}`}
                style={{ borderColor: color, borderLeft: "none", borderBottom: "none" }}
            />
            <div
                className={`absolute bottom-28 left-6 ${tick}`}
                style={{ borderColor: color, borderRight: "none", borderTop: "none" }}
            />
            <div
                className={`absolute bottom-28 right-6 ${tick}`}
                style={{ borderColor: color, borderLeft: "none", borderTop: "none" }}
            />
        </>
    );
}
