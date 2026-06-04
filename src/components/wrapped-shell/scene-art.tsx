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
            // Hide all decorations initially. intro.tsx's timeline drives the entrance.
            gsap.set(".intro-pop", { scale: 0, opacity: 0, transformOrigin: "50% 50%" });

            // Continuous ambient motion — runs regardless of entrance state.
            gsap.to(".intro-blob", {
                rotate: 360, duration: 24, ease: "none", repeat: -1,
                transformOrigin: "50% 50%",
            });
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
            <g className="intro-blob intro-pop" style={{ transformOrigin: "120px 820px" }}>
                <circle cx="120" cy="820" r="180" fill="#f4a261" opacity="0.9" />
                <rect x="20" y="700" width="200" height="200" fill="none" stroke="#0a2236" strokeWidth="4" />
            </g>

            <g className="intro-floaty">
                <rect className="intro-pop" x="100" y="155" width="84" height="84" fill="#0a2236" />
            </g>

            <g className="intro-floaty">
                <path
                    className="intro-scribble intro-pop"
                    d="M 1400 180 C 1395 130 1445 100 1495 110 C 1555 122 1580 170 1565 215 C 1548 255 1485 265 1440 245 C 1405 228 1395 205 1400 180 Z"
                    fill="none"
                    stroke="#0a2236"
                    strokeWidth="6"
                    strokeDasharray="3 14"
                    strokeLinecap="round"
                />
            </g>

            <g className="intro-floaty">
                <polygon className="intro-pop" points="1480,710 1560,830 1400,830"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="5" />
            </g>

            <g className="intro-pop">
                <circle cx="1300" cy="690" r="40" fill="none" stroke="#0a2236" strokeWidth="5" strokeDasharray="6 8" />
                <circle cx="1300" cy="690" r="12" fill="#0a2236" />
            </g>

            <g className="intro-pop">
                <rect x="220" y="120" width="200" height="6" fill="#0a2236" />
                <rect x="220" y="138" width="120" height="4" fill="#0a2236" opacity="0.55" />
            </g>

            {/* Top sparkle (pulled in from the top edge) */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "520px 230px" }}>
                <polygon
                    points="520,200 528,222 550,230 528,238 520,260 512,238 490,230 512,222"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="3"
                />
            </g>

            {/* Top-mid plus sign (pulled in from the top edge) */}
            <g className="intro-pop" style={{ transformOrigin: "1050px 230px" }}>
                <rect x="1047" y="208" width="6" height="44" fill="#0a2236" />
                <rect x="1028" y="227" width="44" height="6" fill="#0a2236" />
            </g>

            {/* Right-side diamond outline */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "1400px 360px" }}>
                <polygon
                    points="1400,320 1436,360 1400,400 1364,360"
                    fill="none" stroke="#0a2236" strokeWidth="5"
                />
                <circle cx="1400" cy="360" r="6" fill="#f4a261" />
            </g>

            {/* Middle-left concentric circles */}
            <g className="intro-pop" style={{ transformOrigin: "120px 380px" }}>
                <circle cx="120" cy="380" r="34" fill="none" stroke="#0a2236" strokeWidth="3" />
                <circle cx="120" cy="380" r="22" fill="none" stroke="#0a2236" strokeWidth="3" />
                <circle cx="120" cy="380" r="10" fill="#f4a261" />
            </g>

            {/* Middle-left mini plus */}
            <g className="intro-pop" style={{ transformOrigin: "260px 500px" }}>
                <rect x="257" y="482" width="6" height="36" fill="#0a2236" />
                <rect x="242" y="497" width="36" height="6" fill="#0a2236" />
            </g>

            {/* Middle-right hash marks */}
            <g className="intro-pop" style={{ transformOrigin: "1340px 460px" }}>
                <line x1="1310" y1="448" x2="1370" y2="448" stroke="#0a2236" strokeWidth="4" strokeLinecap="round" />
                <line x1="1310" y1="472" x2="1370" y2="472" stroke="#0a2236" strokeWidth="4" strokeLinecap="round" />
                <line x1="1326" y1="432" x2="1326" y2="488" stroke="#0a2236" strokeWidth="4" strokeLinecap="round" />
                <line x1="1354" y1="432" x2="1354" y2="488" stroke="#0a2236" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Curvy arrow doodle on the right — points at the dotted target circle */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "1400px 600px" }}>
                <path
                    d="M 1430 540 Q 1400 600 1340 660"
                    fill="none" stroke="#0a2236" strokeWidth="4" strokeLinecap="round"
                />
                <polygon points="1340,660 1356,650 1352,666" fill="#0a2236" />
            </g>

            {/* Bottom wavy underline doodle (extended toward the dotted target circle) */}
            <path
                className="intro-pop"
                d="M 320 770 Q 350 750 380 770 T 440 770 T 500 770 T 560 770 T 620 770 T 680 770 T 740 770 T 800 770 T 860 770 T 920 770 T 980 770 T 1040 770 T 1100 770 T 1160 770 T 1220 770"
                fill="none" stroke="#f4a261" strokeWidth="5" strokeLinecap="round"
            />

            {/* Bottom-mid sparkle */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "920px 830px" }}>
                <polygon
                    points="920,810 925,825 940,830 925,835 920,850 915,835 900,830 915,825"
                    fill="#0a2236"
                />
            </g>

            {/* Above-squiggle small 4-point star */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "380px 700px" }}>
                <polygon
                    points="380,680 388,698 408,700 388,704 380,720 372,704 352,700 372,698"
                    fill="#0a2236"
                />
            </g>

            {/* Above-squiggle triangle outline */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "830px 705px" }}>
                <polygon
                    points="830,680 855,725 805,725"
                    fill="none" stroke="#0a2236" strokeWidth="4" strokeLinejoin="round"
                />
            </g>

            {/* X mark between squiggle end and dotted target */}
            <g className="intro-pop" style={{ transformOrigin: "1250px 745px" }}>
                <line x1="1235" y1="730" x2="1265" y2="760" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
                <line x1="1265" y1="730" x2="1235" y2="760" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Bottom-left peach square accent */}
            <g className="intro-pop intro-floaty" style={{ transformOrigin: "270px 820px" }}>
                <rect x="252" y="802" width="36" height="36" fill="#f4a261" stroke="#0a2236" strokeWidth="3" />
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
            gsap.fromTo(
                ".ach-doodle",
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2)",
                    stagger: { each: 0.05, from: "random" },
                    delay: 0.8, transformOrigin: "50% 50%",
                },
            );
            gsap.to(".ach-doodle", {
                y: "+=8", duration: 2.6, ease: "sine.inOut",
                repeat: -1, yoyo: true, stagger: 0.15, delay: 1.6,
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

            {/* Top-mid plus sign */}
            <g className="ach-doodle" style={{ transformOrigin: "700px 230px" }}>
                <rect x="697" y="210" width="6" height="40" fill="#f2f2f2" />
                <rect x="680" y="227" width="40" height="6" fill="#f2f2f2" />
            </g>

            {/* Top-mid 4-point star */}
            <g className="ach-doodle" style={{ transformOrigin: "900px 220px" }}>
                <polygon
                    points="900,196 908,214 928,222 908,230 900,250 892,230 872,222 892,214"
                    fill="#f4a261" stroke="#f2f2f2" strokeWidth="2"
                />
            </g>

            {/* Diamond outline upper-right */}
            <g className="ach-doodle" style={{ transformOrigin: "1080px 240px" }}>
                <polygon
                    points="1080,210 1112,240 1080,270 1048,240"
                    fill="none" stroke="#08a0e9" strokeWidth="4"
                />
                <circle cx="1080" cy="240" r="5" fill="#f4a261" />
            </g>

            {/* Concentric circles middle-right */}
            <g className="ach-doodle" style={{ transformOrigin: "1380px 380px" }}>
                <circle cx="1380" cy="380" r="28" fill="none" stroke="#f2f2f2" strokeWidth="3" />
                <circle cx="1380" cy="380" r="18" fill="none" stroke="#f2f2f2" strokeWidth="3" />
                <circle cx="1380" cy="380" r="8" fill="#f4a261" />
            </g>

            {/* Curvy arrow pointing at the NASA stamp */}
            <g className="ach-doodle" style={{ transformOrigin: "1150px 270px" }}>
                <path
                    d="M 1110 300 Q 1150 270 1200 230"
                    fill="none" stroke="#f2f2f2" strokeWidth="4" strokeLinecap="round"
                />
                <polygon points="1200,230 1188,242 1184,228" fill="#f2f2f2" />
            </g>

            {/* Bottom wavy line — orange */}
            <path
                className="ach-doodle"
                d="M 420 770 Q 450 750 480 770 T 540 770 T 600 770 T 660 770 T 720 770 T 780 770 T 840 770 T 900 770 T 960 770 T 1020 770 T 1080 770 T 1140 770"
                fill="none" stroke="#f4a261" strokeWidth="5" strokeLinecap="round"
            />

            {/* Plus sign bottom-left */}
            <g className="ach-doodle" style={{ transformOrigin: "400px 800px" }}>
                <rect x="397" y="780" width="6" height="40" fill="#f2f2f2" />
                <rect x="380" y="797" width="40" height="6" fill="#f2f2f2" />
            </g>

            {/* Small cyan star bottom-mid */}
            <g className="ach-doodle" style={{ transformOrigin: "920px 820px" }}>
                <polygon
                    points="920,800 926,816 942,820 926,824 920,840 914,824 898,820 914,816"
                    fill="#08a0e9"
                />
            </g>

            {/* "+1" achievement badge — small circle with text */}
            <g className="ach-doodle" style={{ transformOrigin: "1290px 800px" }}>
                <circle cx="1290" cy="800" r="34" fill="#f4a261" stroke="#f2f2f2" strokeWidth="4" />
                <text x="1290" y="811" textAnchor="middle"
                    fontFamily="Figtree, sans-serif" fontWeight="900" fontSize="28" fill="#0a2236"
                >+1</text>
            </g>

            {/* Burst / starburst shape — middle-left */}
            <g className="ach-doodle" style={{ transformOrigin: "180px 400px" }}>
                <polygon
                    points="180,360 192,388 222,392 198,410 208,440 180,422 152,440 162,410 138,392 168,388"
                    fill="none" stroke="#f4a261" strokeWidth="4" strokeLinejoin="round"
                />
                <circle cx="180" cy="400" r="6" fill="#08a0e9" />
            </g>

            {/* Squiggle accent — far upper-left, above the cyan starburst sparkle */}
            <path
                className="ach-doodle"
                d="M 60 280 Q 90 264 120 280 T 180 280 T 240 280"
                fill="none" stroke="#08a0e9" strokeWidth="4" strokeLinecap="round"
            />

            {/* Small orange sparkle — bottom-right between +1 badge and big square */}
            <g className="ach-doodle" style={{ transformOrigin: "1400px 700px" }}>
                <polygon
                    points="1400,680 1406,696 1422,700 1406,704 1400,720 1394,704 1378,700 1394,696"
                    fill="#f4a261"
                />
            </g>

            {/* Three-dot cluster — far-left mid (color punctuation near rays) */}
            <g className="ach-doodle">
                <circle cx="80" cy="430" r="5" fill="#f2f2f2" />
                <circle cx="98" cy="446" r="4" fill="#f4a261" />
                <circle cx="68" cy="450" r="3" fill="#08a0e9" />
            </g>
        </svg>
    );
}

// Competency intro art — scribbles & doodles in the margins, framing the headline
// (same playbook as IntroArt: `.comp-pop` scales in/out, blob rotates, floaties bob,
// scribbles draw on a dashed loop). No text — just hand-drawn marks.
export function CompetenciesArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            // Pop the doodles in from nothing (set→to mirrors IntroArt and avoids the
            // residual-translate GSAP leaves when you *fromTo*-scale SVG groups).
            gsap.set(".comp-pop", { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
            gsap.to(".comp-pop", {
                scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2.2)",
                stagger: { each: 0.05, from: "random" }, delay: 0.4, transformOrigin: "50% 50%",
            });
            // Continuous life.
            gsap.to(".comp-blob", {
                rotate: 360, duration: 26, ease: "none", repeat: -1, transformOrigin: "50% 50%",
            });
            gsap.to(".comp-float", {
                y: -14, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.4,
            });
            gsap.to(".comp-scrib", {
                strokeDashoffset: -32, duration: 1.4, ease: "none", repeat: -1,
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
            {/* Anchor blob — bottom-left (slow spin) */}
            <g className="comp-pop comp-blob" style={{ transformOrigin: "200px 760px" }}>
                <circle cx="200" cy="760" r="150" fill="#f4a261" opacity="0.92" />
                <rect x="120" y="660" width="170" height="170" fill="none" stroke="#0a2236" strokeWidth="4" />
            </g>

            {/* Floaty navy square, top-left */}
            <g className="comp-float">
                <rect className="comp-pop" x="120" y="150" width="78" height="78" fill="#0a2236" />
            </g>

            {/* Scribble loop, top-right (draws on a dashed loop) */}
            <g className="comp-float">
                <path className="comp-pop comp-scrib"
                    d="M 1400 170 C 1392 122 1444 96 1496 108 C 1556 122 1580 172 1562 216 C 1544 256 1480 264 1438 242 C 1404 224 1396 200 1400 170 Z"
                    fill="none" stroke="#0a2236" strokeWidth="6" strokeDasharray="3 14" strokeLinecap="round" />
            </g>

            {/* Triangle, bottom-right */}
            <g className="comp-float">
                <polygon className="comp-pop" points="1470,700 1556,830 1384,830"
                    fill="#08a0e9" stroke="#0a2236" strokeWidth="5" />
            </g>

            {/* Dotted target circle, mid-right */}
            <g className="comp-pop">
                <circle cx="1330" cy="500" r="42" fill="none" stroke="#0a2236" strokeWidth="5" strokeDasharray="6 9" />
                <circle cx="1330" cy="500" r="12" fill="#f4a261" stroke="#0a2236" strokeWidth="3" />
            </g>

            {/* Two bars, top-left */}
            <g className="comp-pop">
                <rect x="240" y="120" width="190" height="7" fill="#0a2236" />
                <rect x="240" y="140" width="120" height="5" fill="#0a2236" opacity="0.55" />
            </g>

            {/* Sparkle, top-mid-left */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "520px 220px" }}>
                <polygon points="520,186 530,212 556,222 530,232 520,258 510,232 484,222 510,212"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="3" />
            </g>

            {/* Plus, top-mid */}
            <g className="comp-pop" style={{ transformOrigin: "1040px 215px" }}>
                <rect x="1037" y="194" width="6" height="44" fill="#0a2236" />
                <rect x="1018" y="213" width="44" height="6" fill="#0a2236" />
            </g>

            {/* Diamond outline, right */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "1420px 330px" }}>
                <polygon points="1420,288 1462,330 1420,372 1378,330" fill="none" stroke="#0a2236" strokeWidth="5" />
                <circle cx="1420" cy="330" r="6" fill="#08a0e9" />
            </g>

            {/* Concentric circles, mid-left */}
            <g className="comp-pop" style={{ transformOrigin: "150px 390px" }}>
                <circle cx="150" cy="390" r="36" fill="none" stroke="#0a2236" strokeWidth="4" />
                <circle cx="150" cy="390" r="22" fill="none" stroke="#0a2236" strokeWidth="4" />
                <circle cx="150" cy="390" r="9" fill="#f4a261" />
            </g>

            {/* Hash marks, mid-right */}
            <g className="comp-pop">
                <line x1="1300" y1="660" x2="1366" y2="660" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
                <line x1="1300" y1="684" x2="1340" y2="684" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
                <line x1="1300" y1="708" x2="1366" y2="708" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Curvy arrow doodle, left-low pointing up-right */}
            <g className="comp-pop comp-float">
                <path d="M 250 560 Q 300 500 380 470" fill="none" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
                <polygon points="380,470 360,470 372,488" fill="#0a2236" />
            </g>

            {/* Bottom wavy underline (peach) */}
            <path className="comp-pop"
                d="M 470 800 Q 502 778 534 800 T 598 800 T 662 800 T 726 800 T 790 800 T 854 800 T 918 800 T 982 800 T 1046 800 T 1110 800"
                fill="none" stroke="#f4a261" strokeWidth="6" strokeLinecap="round" />

            {/* Bottom-mid sparkle (navy) */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "790px 760px" }}>
                <polygon points="790,734 798,754 818,762 798,770 790,790 782,770 762,762 782,754" fill="#0a2236" />
            </g>

            {/* 4-point star, lower-left */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "560px 730px" }}>
                <polygon points="560,708 569,726 588,730 569,734 560,752 551,734 532,730 551,726" fill="#0a2236" />
            </g>

            {/* Triangle outline, lower-mid */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "1010px 740px" }}>
                <polygon points="1010,714 1036,760 984,760" fill="none" stroke="#0a2236" strokeWidth="4" strokeLinejoin="round" />
            </g>

            {/* X mark, right-low */}
            <g className="comp-pop" style={{ transformOrigin: "1240px 760px" }}>
                <line x1="1224" y1="744" x2="1256" y2="776" stroke="#0a2236" strokeWidth="6" strokeLinecap="round" />
                <line x1="1256" y1="744" x2="1224" y2="776" stroke="#0a2236" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Peach square accent, bottom-left near blob */}
            <g className="comp-pop comp-float" style={{ transformOrigin: "360px 800px" }}>
                <rect x="338" y="778" width="44" height="44" fill="#f4a261" stroke="#0a2236" strokeWidth="3" />
            </g>
        </svg>
    );
}

// Skills intro art — a construction site (the building gets built): tower crane,
// hazard tape, hard hat, girder, ladder, cone, brick wall. `.con-pop` scales in/out,
// `.con-float` bobs. No code/programming motifs.
export function SkillsArt() {
    const wrapRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {
            gsap.set(".con-pop", { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
            gsap.to(".con-pop", {
                scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)",
                stagger: { each: 0.05, from: "random" }, delay: 0.4, transformOrigin: "50% 50%",
            });
            gsap.to(".con-float", {
                y: -12, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.3,
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
            <defs>
                <pattern id="con-hazard" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="30" height="30" fill="#f4a261" />
                    <rect width="15" height="30" fill="#0a2236" />
                </pattern>
            </defs>

            {/* TOWER CRANE — left anchor, lifting a block (building the tower) */}
            <g className="con-pop" style={{ transformOrigin: "320px 460px" }}>
                <rect x="92" y="148" width="62" height="46" fill="#0a2236" />
                <line x1="150" y1="171" x2="200" y2="171" stroke="#0a2236" strokeWidth="6" />
                <rect x="186" y="172" width="34" height="600" fill="none" stroke="#0a2236" strokeWidth="6" />
                <line x1="188" y1="180" x2="218" y2="320" stroke="#0a2236" strokeWidth="3" />
                <line x1="218" y1="180" x2="188" y2="320" stroke="#0a2236" strokeWidth="3" />
                <line x1="188" y1="480" x2="218" y2="620" stroke="#0a2236" strokeWidth="3" />
                <line x1="218" y1="480" x2="188" y2="620" stroke="#0a2236" strokeWidth="3" />
                <rect x="182" y="176" width="42" height="34" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                <polygon points="222,160 520,168 520,184 222,186" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                <line x1="270" y1="168" x2="300" y2="184" stroke="#0a2236" strokeWidth="2" />
                <line x1="340" y1="168" x2="370" y2="184" stroke="#0a2236" strokeWidth="2" />
                <line x1="410" y1="168" x2="440" y2="184" stroke="#0a2236" strokeWidth="2" />
                <line x1="500" y1="186" x2="500" y2="252" stroke="#0a2236" strokeWidth="3" />
                <g className="con-float">
                    <rect x="474" y="254" width="52" height="36" rx="3" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                </g>
            </g>

            {/* HAZARD TAPE BAR — top-left (where the code tag used to be) */}
            <g className="con-pop">
                <rect x="60" y="112" width="250" height="34" fill="url(#con-hazard)" stroke="#0a2236" strokeWidth="4" />
            </g>

            {/* SPIRIT LEVEL — top-centre, above the headline */}
            <g className="con-pop">
                <rect x="690" y="150" width="220" height="30" rx="7" fill="#f4ead2" stroke="#0a2236" strokeWidth="4" />
                <rect x="788" y="156" width="24" height="18" rx="9" fill="none" stroke="#0a2236" strokeWidth="3" />
                <circle cx="800" cy="165" r="5" fill="#08a0e9" />
                <line x1="734" y1="152" x2="734" y2="178" stroke="#0a2236" strokeWidth="2" />
                <line x1="866" y1="152" x2="866" y2="178" stroke="#0a2236" strokeWidth="2" />
            </g>

            {/* HARD HAT — top-right */}
            <g className="con-pop con-float">
                <path d="M 1358 202 A 52 52 0 0 1 1462 202 Z" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                <rect x="1342" y="198" width="136" height="13" rx="6" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                <line x1="1410" y1="152" x2="1410" y2="200" stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* I-BEAM (H girder) — right-mid */}
            <g className="con-pop con-float">
                <rect x="1432" y="384" width="92" height="14" fill="#0a2236" />
                <rect x="1470" y="384" width="16" height="112" fill="#0a2236" />
                <rect x="1432" y="482" width="92" height="14" fill="#0a2236" />
            </g>

            {/* LADDER — right */}
            <g className="con-pop">
                <line x1="1378" y1="520" x2="1378" y2="700" stroke="#0a2236" strokeWidth="6" strokeLinecap="round" />
                <line x1="1424" y1="520" x2="1424" y2="700" stroke="#0a2236" strokeWidth="6" strokeLinecap="round" />
                {[540, 568, 596, 624, 652, 680].map((y) => (
                    <line key={y} x1="1378" y1={y} x2="1424" y2={y} stroke="#0a2236" strokeWidth="5" strokeLinecap="round" />
                ))}
            </g>

            {/* TRAFFIC CONE — bottom-right, lifted clear of the footer ticker */}
            <g className="con-pop con-float">
                {/* base slab */}
                <rect x="1298" y="794" width="124" height="18" rx="6" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                <rect x="1310" y="786" width="100" height="12" rx="4" fill="#f4a261" stroke="#0a2236" strokeWidth="4" />
                {/* cone body */}
                <path d="M 1360 702 L 1406 788 Q 1360 798 1314 788 Z"
                    fill="#f4a261" stroke="#0a2236" strokeWidth="4" strokeLinejoin="round" />
                {/* lower reflective band */}
                <polygon points="1328,762 1392,762 1400,778 1320,778" fill="#f4ead2" stroke="#0a2236" strokeWidth="2.5" />
                {/* upper reflective band */}
                <polygon points="1345,730 1375,730 1382,744 1338,744" fill="#f4ead2" stroke="#0a2236" strokeWidth="2.5" />
                {/* tip cap */}
                <rect x="1351" y="696" width="18" height="13" rx="5" fill="#0a2236" />
            </g>

            {/* BRICK WALL — bottom-left */}
            <g className="con-pop">
                {[0, 1, 2].map((row) =>
                    [0, 1, 2, 3, 4].map((col) => {
                        const y = 742 + row * 26;
                        const off = row % 2 === 1 ? 27 : 0;
                        const x = 70 + off + col * 54;
                        return (
                            <rect key={`${row}-${col}`} x={x} y={y} width="50" height="22"
                                fill={(row + col) % 2 === 0 ? "#f4a261" : "#f4ead2"}
                                stroke="#0a2236" strokeWidth="3" />
                        );
                    }),
                )}
            </g>

            {/* BOLTS (hex nuts) */}
            <g className="con-pop con-float">
                <polygon points="1284,236 1306,248 1306,272 1284,284 1262,272 1262,248"
                    fill="none" stroke="#0a2236" strokeWidth="4" />
                <circle cx="1284" cy="260" r="6" fill="#0a2236" />
            </g>
            <g className="con-pop con-float">
                <polygon points="630,188 648,198 648,218 630,228 612,218 612,198"
                    fill="#0a2236" />
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
