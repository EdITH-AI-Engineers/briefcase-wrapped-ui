"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

// viewBox is 1600x900 (xMidYMid slice).
// Safe text zone: roughly x 400..1200, y 250..650.
// Decorations live in the surrounding margins.

export function IntroArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.to(".intro-blob", {
                rotate: 360, duration: 24, ease: "none", repeat: -1,
                transformOrigin: "50% 50%",
            });
            gsap.fromTo(
                ".intro-pop",
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2.2)",
                    stagger: 0.15, delay: 0.3, transformOrigin: "50% 50%",
                },
            );
            gsap.to(".intro-floaty", {
                y: -14, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.4,
            });
            gsap.to(".intro-scribble", {
                strokeDashoffset: -32,
                duration: 1.4,
                ease: "none",
                repeat: -1,
            });
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <g className="intro-blob" style={{ transformOrigin: "120px 820px" }}>
                <circle cx="120" cy="820" r="180" fill="#f4a261" opacity="0.9" />
                <rect x="20" y="700" width="200" height="200" fill="none" stroke="#0a2236" strokeWidth="4" />
            </g>

            <g className="intro-floaty">
                <rect className="intro-pop" x="100" y="110" width="84" height="84" fill="#0a2236" />
                <text
                    x="142" y="170" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="42" fill="#f4a261"
                >01</text>
            </g>

            <g className="intro-floaty">
                <path
                    className="intro-scribble"
                    d="M 1400 180 C 1395 130 1445 100 1495 110 C 1555 122 1580 170 1565 215 C 1548 255 1485 265 1440 245 C 1405 228 1395 205 1400 180 Z"
                    fill="none"
                    stroke="#0a2236"
                    strokeWidth="6"
                    strokeDasharray="3 14"
                    strokeLinecap="round"
                />
            </g>

            <g className="intro-floaty">
                <polygon className="intro-pop" points="1480,780 1560,860 1400,860"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="5" />
            </g>

            <g className="intro-pop">
                <circle cx="1300" cy="780" r="40" fill="none" stroke="#0a2236" strokeWidth="5" strokeDasharray="6 8" />
                <circle cx="1300" cy="780" r="12" fill="#0a2236" />
            </g>

            <g className="intro-pop">
                <rect x="220" y="120" width="200" height="6" fill="#0a2236" />
                <rect x="220" y="138" width="120" height="4" fill="#0a2236" opacity="0.55" />
            </g>
        </svg>
    );
}

export function AchievementsArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".ach-medal",
                { scale: 0, rotate: -30, opacity: 0 },
                {
                    scale: 1, rotate: 0, opacity: 1,
                    duration: 1, ease: "back.out(2)", delay: 0.4, transformOrigin: "50% 50%",
                },
            );
            gsap.to(".ach-rays", {
                rotate: 360, duration: 30, ease: "none", repeat: -1, transformOrigin: "50% 50%",
            });
            gsap.fromTo(
                ".ach-spark",
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.6,
                    ease: "back.out(2)", transformOrigin: "50% 50%",
                },
            );
            gsap.to(".ach-spark", {
                y: -10, duration: 1.8, ease: "sine.inOut",
                repeat: -1, yoyo: true, stagger: 0.2, delay: 1.4,
            });
            gsap.fromTo(
                ".ach-stamp",
                { scale: 0.5, opacity: 0, rotate: -16 },
                {
                    scale: 1, opacity: 1, rotate: -8, duration: 0.7,
                    ease: "back.out(2.5)", delay: 1, transformOrigin: "50% 50%",
                },
            );
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <g className="ach-rays" style={{ transformOrigin: "200px 700px" }}>
                {Array.from({ length: 14 }).map((_, i) => (
                    <rect
                        key={i}
                        x="198" y="540" width="4" height="60"
                        fill="#08a0e9" opacity="0.55"
                        transform={`rotate(${(360 / 14) * i} 200 700)`}
                    />
                ))}
            </g>
            <g className="ach-medal" style={{ transformOrigin: "200px 700px" }}>
                <polygon points="200,620 222,640 254,644 232,664 240,696 200,680 160,696 168,664 146,644 178,640"
                    fill="#f4a261" stroke="#08a0e9" strokeWidth="4" />
                <circle cx="200" cy="730" r="58" fill="#08a0e9" stroke="#f2f2f2" strokeWidth="5" />
                <circle cx="200" cy="730" r="40" fill="#f4a261" stroke="#f2f2f2" strokeWidth="2" />
                <text x="200" y="744" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="36" fill="#0a2236"
                >1ST</text>
            </g>

            <g className="ach-spark">
                <polygon points="1380,170 1393,200 1424,205 1400,225 1408,254 1380,238 1352,254 1360,225 1336,205 1367,200"
                    fill="#f4a261" />
            </g>
            <g className="ach-spark">
                <polygon points="120,180 130,200 152,204 134,218 138,238 120,228 102,238 106,218 88,204 110,200"
                    fill="#08a0e9" />
            </g>
            <g className="ach-spark">
                <rect x="1460" y="780" width="44" height="44" fill="#f4a261" stroke="#f2f2f2" strokeWidth="3" />
            </g>
            <g className="ach-spark">
                <circle cx="1480" cy="500" r="22" fill="none" stroke="#08a0e9" strokeWidth="5" />
                <circle cx="1480" cy="500" r="8" fill="#f4a261" />
            </g>
            <g className="ach-spark">
                <polygon points="100,820 120,800 140,820 120,840" fill="#08a0e9" />
            </g>

            <g className="ach-stamp" style={{ transformOrigin: "1320px 160px" }}>
                <rect x="1200" y="110" width="240" height="100" fill="none" stroke="#f4a261" strokeWidth="4" />
                <rect x="1210" y="120" width="220" height="80" fill="none" stroke="#f4a261" strokeWidth="1.5" />
                <text x="1320" y="150" textAnchor="middle"
                    fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="18"
                    letterSpacing="5" fill="#f4a261"
                >NASA &middot; 2024</text>
                <text x="1320" y="184" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="22" fill="#f2f2f2"
                >Project NATURE</text>
            </g>
        </svg>
    );
}

export function CompetenciesArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".comp-bar",
                { scaleY: 0 },
                {
                    scaleY: 1, duration: 1.1, ease: "expo.out",
                    stagger: 0.12, delay: 0.4, transformOrigin: "50% 100%",
                },
            );
            gsap.fromTo(
                ".comp-hex",
                { scale: 0, rotate: -30, opacity: 0 },
                {
                    scale: 1, rotate: 0, opacity: 1,
                    duration: 0.8, ease: "back.out(2)", stagger: 0.1,
                    delay: 0.6, transformOrigin: "50% 50%",
                },
            );
            gsap.to(".comp-orbit", {
                rotate: 360, duration: 32, ease: "none", repeat: -1, transformOrigin: "50% 50%",
            });
            gsap.fromTo(
                ".comp-pct",
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 1.2, ease: "power3.out" },
            );
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    const bars = [
        { x: 60, h: 170, label: "PM", v: "65" },
        { x: 130, h: 220, label: "PR", v: "75" },
        { x: 200, h: 150, label: "PS", v: "60" },
        { x: 270, h: 200, label: "PY", v: "70" },
        { x: 340, h: 170, label: "JV", v: "65" },
    ];

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <g>
                <line x1="40" y1="760" x2="400" y2="760" stroke="#0a2236" strokeWidth="5" />
                {bars.map((b, i) => (
                    <g key={i}>
                        <rect className="comp-bar"
                            x={b.x} y={760 - b.h} width="44" height={b.h}
                            fill="#0a2236" stroke="#f2f2f2" strokeWidth="2.5"
                        />
                        <text className="comp-pct"
                            x={b.x + 22} y={760 - b.h - 10} textAnchor="middle"
                            fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="16" fill="#0a2236"
                        >{b.v}</text>
                        <text x={b.x + 22} y={784} textAnchor="middle"
                            fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="13"
                            letterSpacing="2" fill="#0a2236"
                        >{b.label}</text>
                    </g>
                ))}
            </g>

            <g className="comp-orbit" style={{ transformOrigin: "1400px 720px" }}>
                <circle cx="1400" cy="720" r="170" fill="none" stroke="#0a2236" strokeWidth="2" strokeDasharray="4 8" />
                <circle cx="1400" cy="550" r="10" fill="#f4a261" stroke="#0a2236" strokeWidth="3" />
                <circle cx="1570" cy="720" r="10" fill="#0a2236" />
                <circle cx="1400" cy="890" r="10" fill="#f2f2f2" stroke="#0a2236" strokeWidth="3" />
                <circle cx="1230" cy="720" r="10" fill="#f4a261" />
            </g>

            <g className="comp-hex" style={{ transformOrigin: "1400px 720px" }}>
                <polygon
                    points="1400,640 1470,680 1470,760 1400,800 1330,760 1330,680"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="5"
                />
                <text x="1400" y="718" textAnchor="middle"
                    fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="14"
                    letterSpacing="2" fill="#0a2236"
                >STRONG</text>
                <text x="1400" y="752" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="30" fill="#0a2236"
                >75%</text>
            </g>
        </svg>
    );
}

export function SkillsArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".skill-tag",
                { scale: 0, opacity: 0, y: 20 },
                {
                    scale: 1, opacity: 1, y: 0,
                    duration: 0.7, ease: "back.out(2)", stagger: 0.1, delay: 0.4,
                    transformOrigin: "50% 50%",
                },
            );
            gsap.to(".skill-tag", {
                y: "+=6", duration: 2.4, ease: "sine.inOut",
                repeat: -1, yoyo: true, stagger: 0.15, delay: 1.2,
            });
            gsap.fromTo(
                ".skill-brace",
                { opacity: 0, x: (i: number) => (i === 0 ? -40 : 40) },
                { opacity: 0.85, x: 0, duration: 0.9, ease: "expo.out", delay: 0.2 },
            );
            gsap.to(".skill-cursor", {
                opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)",
            });
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    const tags = [
        { x: 60, y: 760, w: 220, label: "</> Python", fill: "#0a2236", color: "#f4ead2", rot: -3 },
        { x: 300, y: 760, w: 200, label: "{} Java", fill: "#f4ead2", color: "#0a2236", rot: 2 },
        { x: 1100, y: 760, w: 240, label: "// Problem-Solving", fill: "#f4ead2", color: "#0a2236", rot: -2 },
        { x: 1360, y: 760, w: 180, label: "* PM *", fill: "#0a2236", color: "#f4ead2", rot: 3 },
    ];

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <text
                className="skill-brace"
                x="20" y="500"
                fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="300" fill="#0a2236"
            >{"{"}</text>
            <text
                className="skill-brace"
                x="1490" y="500"
                fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="300" fill="#0a2236"
            >{"}"}</text>

            <g>
                <rect x="60" y="120" width="240" height="44" fill="#0a2236" stroke="#0a2236" strokeWidth="3" />
                <text x="180" y="150" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="22" fill="#f4ead2"
                >&lt; Programming /&gt;</text>
            </g>

            {tags.map((t, i) => (
                <g key={i} className="skill-tag" transform={`rotate(${t.rot} ${t.x + t.w / 2} ${t.y + 22})`}
                    style={{ transformOrigin: `${t.x + t.w / 2}px ${t.y + 22}px` }}>
                    <rect x={t.x} y={t.y} width={t.w} height="44" fill={t.fill} stroke="#0a2236" strokeWidth="3" />
                    <text x={t.x + t.w / 2} y={t.y + 30} textAnchor="middle"
                        fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="22" fill={t.color}
                    >{t.label}</text>
                </g>
            ))}

            <g>
                <text x="1240" y="160"
                    fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="18"
                    letterSpacing="5" fill="#0a2236"
                >YOUR.STACK</text>
                <rect className="skill-cursor" x="1418" y="146" width="14" height="20" fill="#0a2236" />
            </g>
        </svg>
    );
}

export function ActionPlanArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            const path = wrapRef.current?.querySelector(".plan-road") as SVGPathElement | null;
            if (path) {
                const length = path.getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(path, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", delay: 0.3 });
            }
            gsap.fromTo(
                ".plan-node",
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2.4)",
                    stagger: 0.3, delay: 0.8, transformOrigin: "50% 50%",
                },
            );
            gsap.fromTo(
                ".plan-label",
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.3, delay: 1, ease: "power3.out" },
            );
            gsap.fromTo(
                ".plan-arrow",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "expo.out", delay: 2 },
            );
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    const nodes = [
        { x: 200, y: 800, label: "01 LEARN", color: "#f4a261" },
        { x: 560, y: 760, label: "02 BUILD", color: "#f2f2f2" },
        { x: 920, y: 800, label: "03 SHIP", color: "#f4a261" },
        { x: 1300, y: 740, label: "04 LEVEL UP", color: "#f2f2f2" },
    ];

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <path
                className="plan-road"
                d="M 80 800 Q 380 800 560 760 T 920 800 T 1380 740"
                fill="none" stroke="#0a2236" strokeWidth="8" strokeLinecap="round"
            />
            <path
                className="plan-road"
                d="M 80 800 Q 380 800 560 760 T 920 800 T 1380 740"
                fill="none" stroke="#f2f2f2" strokeWidth="2" strokeDasharray="12 14" strokeLinecap="round"
            />

            {nodes.map((n, i) => (
                <g key={i}>
                    <g className="plan-node" style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
                        <rect x={n.x - 30} y={n.y - 30} width="60" height="60" fill={n.color} stroke="#0a2236" strokeWidth="5" />
                        <text x={n.x} y={n.y + 10} textAnchor="middle"
                            fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="28" fill="#0a2236"
                        >{i + 1}</text>
                    </g>
                    <g className="plan-label">
                        <rect x={n.x - 68} y={n.y + 42} width="136" height="26" fill="#0a2236" />
                        <text x={n.x} y={n.y + 60} textAnchor="middle"
                            fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="12"
                            letterSpacing="3" fill="#f4a261"
                        >{n.label}</text>
                    </g>
                </g>
            ))}

            <g className="plan-arrow">
                <polygon points="1410,720 1480,758 1410,796 1410,772 1360,772 1360,744 1410,744"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
            </g>
        </svg>
    );
}

export function SummaryArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".sum-stamp",
                { scale: 0.6, opacity: 0, rotate: 12 },
                { scale: 1, opacity: 1, rotate: -6, duration: 0.9, ease: "back.out(2.3)", delay: 0.5, transformOrigin: "50% 50%" },
            );
            gsap.fromTo(
                ".sum-ring",
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.4, ease: "expo.out", delay: 0.2, transformOrigin: "50% 50%" },
            );
            gsap.to(".sum-ring", {
                rotate: 360, duration: 38, ease: "none", repeat: -1, transformOrigin: "50% 50%",
            });

            const sig = wrapRef.current?.querySelector(".sum-signature") as SVGPathElement | null;
            if (sig) {
                const length = sig.getTotalLength();
                gsap.set(sig, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(sig, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", delay: 0.6 });
            }
            gsap.fromTo(
                ".sum-dot",
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, delay: 1.4, ease: "back.out(2)", transformOrigin: "50% 50%" },
            );
        }, wrapRef);
        return () => ctx.revert();
    }, []);

    return (
        <svg
            ref={wrapRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
        >
            <g className="sum-ring" style={{ transformOrigin: "200px 720px" }}>
                <circle cx="200" cy="720" r="180" fill="none" stroke="#08a0e9" strokeWidth="2" strokeDasharray="2 8" />
                <circle cx="200" cy="720" r="138" fill="none" stroke="#f4a261" strokeWidth="2" strokeDasharray="16 8" />
                <circle cx="200" cy="720" r="98" fill="none" stroke="#f2f2f2" strokeWidth="1.5" />
            </g>

            <g className="sum-stamp" style={{ transformOrigin: "200px 720px" }}>
                <rect x="90" y="650" width="220" height="140" fill="none" stroke="#f4a261" strokeWidth="5" />
                <rect x="100" y="660" width="200" height="120" fill="none" stroke="#f4a261" strokeWidth="1.5" />
                <text x="200" y="700" textAnchor="middle"
                    fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="16"
                    letterSpacing="5" fill="#08a0e9"
                >CERTIFIED</text>
                <text x="200" y="744" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="32" fill="#f2f2f2"
                >BLUEPRINT</text>
                <text x="200" y="770" textAnchor="middle"
                    fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="11"
                    letterSpacing="3" fill="#f4a261"
                >Briefcase 2026</text>
            </g>

            <g>
                <path
                    className="sum-signature"
                    d="M 1180 800 C 1220 760 1260 840 1300 780 S 1380 740 1420 800 S 1500 760 1540 800"
                    fill="none" stroke="#f4a261" strokeWidth="5" strokeLinecap="round"
                />
                <text x="1180" y="840"
                    fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="11"
                    letterSpacing="3" fill="#f2f2f2"
                >— SIGNED BY YOU, 2026 —</text>
            </g>

            {Array.from({ length: 14 }).map((_, i) => (
                <circle
                    key={i}
                    className="sum-dot"
                    cx={1180 + (i % 7) * 56}
                    cy={i < 7 ? 130 : 180}
                    r="5"
                    fill={i % 3 === 0 ? "#f4a261" : "#08a0e9"}
                />
            ))}
        </svg>
    );
}
