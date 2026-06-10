"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dashboard } from "@/lib/get-dashboard";

// ── Briefcase brand system (per Brand Guidelines sheet) ──────────────────────
//    Charcoal #334454 · Celestial Blue #08A0E9 · White Smoke #F2F2F2 · Raisin #282828
//    Type: Montserrat (display) · Hind Madurai (body) · Lora (accent).
//    Data viz stays inside the brand family — a celestial-blue → charcoal scale.
const INK = "#334454"; // Charcoal
const BLUE = "#08A0E9"; // Celestial Blue
const DEEP = "#0E5A86"; // deep celestial (derived)
const SKY = "#7FC4EE"; // light celestial (derived)
const STEEL = "#56788F"; // charcoal-blue (derived)
const RAISIN = "#282828"; // Raisin Black
const BG = "#F2F2F2"; // White Smoke
const LINE = "#33445418";

const LEVEL: Record<string, { color: string; bg: string }> = {
    Advanced: { color: DEEP, bg: "#d9e9f6" },
    Proficient: { color: BLUE, bg: "#e2f3fd" },
    Developing: { color: "#5FA3CE", bg: "#eaf4fb" },
    Emerging: { color: STEEL, bg: "#e8edf0" },
};
const levelOf = (l: string) => LEVEL[l] ?? { color: INK, bg: "#33445414" };

const STATUS: Record<string, { label: string; c: string; bg: string }> = {
    missing: { label: "Missing", c: STEEL, bg: "#e8edf0" },
    "needs-work": { label: "Needs work", c: "#5FA3CE", bg: "#eaf4fb" },
    met: { label: "Met", c: BLUE, bg: "#e2f3fd" },
};

const ROAD: Record<string, { label: string; icon: string; color: string }> = {
    gap: { label: "Gap", icon: "🎯", color: INK },
    course: { label: "Learn", icon: "📘", color: BLUE },
    project: { label: "Build", icon: "🛠️", color: DEEP },
    evidence: { label: "Document", icon: "🧾", color: STEEL },
};

const PALETTE = [BLUE, DEEP, INK, "#5FA3CE", "#1C6FA5", STEEL, "#0B3E5C", "#86B9DC", "#22566F"];
const compColor = (name: string) => PALETTE[Math.abs([...(name || "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) % PALETTE.length];
const safeUrl = (u?: string) => (typeof u === "string" && /^https?:\/\//i.test(u) ? u : "#");

type Comp = Dashboard["competencies"][number];
type IdealSkill = Dashboard["learningMap"]["idealSkills"][number];

// ── widgets ──────────────────────────────────────────────────────────────────
function Card({ id, title, subtitle, right, span = 1, children }: { id?: string; title?: string; subtitle?: string; right?: ReactNode; span?: 1 | 2 | 3; children: ReactNode }) {
    const cls = span === 3 ? "lg:col-span-3" : span === 2 ? "lg:col-span-2" : "lg:col-span-1";
    return (
        <section id={id} className={`dash-card ${cls} rounded-2xl bg-white border`} style={{ borderColor: LINE, boxShadow: "0 6px 22px rgba(51,68,84,0.05)" }}>
            {title && (
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b" style={{ borderColor: LINE }}>
                    <div>
                        <h2 className="font-montserrat font-black text-[17px] tracking-tight" style={{ color: INK }}>{title}</h2>
                        {subtitle && <p className="font-lora italic text-[13.5px] mt-0.5" style={{ color: "#33445499" }}>{subtitle}</p>}
                    </div>
                    {right}
                </div>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

function StatCard({ icon, value, label, sub, color }: { icon: string; value: ReactNode; label: string; sub?: string; color: string }) {
    return (
        <div className="stat-card dash-card rounded-2xl bg-white border p-5" style={{ borderColor: LINE, boxShadow: "0 6px 22px rgba(51,68,84,0.05)" }}>
            <div className="grid place-items-center w-11 h-11 rounded-xl text-[20px]" style={{ background: `${color}1a` }}>{icon}</div>
            <div className="font-montserrat font-black text-[30px] leading-none mt-3.5 tabular-nums" style={{ color: INK }}>{value}</div>
            <div className="font-montserrat font-bold uppercase tracking-[0.12em] text-[11px] mt-1.5" style={{ color: "#33445499" }}>{label}</div>
            {sub && <div className="font-hind text-[12.5px] mt-0.5" style={{ color }}>{sub}</div>}
        </div>
    );
}

function Bar({ value, ideal, color }: { value: number; ideal?: number; color: string }) {
    return (
        <div className="relative h-2 w-full rounded-full overflow-visible" style={{ backgroundColor: "#33445410" }}>
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
            {ideal != null && <div className="absolute top-[-2px] bottom-[-2px] w-[2px] rounded" style={{ left: `${ideal}%`, backgroundColor: INK, opacity: 0.4 }} />}
        </div>
    );
}

function LevelBadge({ level }: { level: string }) {
    const c = levelOf(level);
    return <span className="font-montserrat font-black uppercase tracking-[0.12em] text-[10px] px-2 py-0.5 rounded-full" style={{ color: c.color, backgroundColor: c.bg }}>{level}</span>;
}

function ScoreRing({ score, ideal }: { score: number; ideal: number }) {
    const R = 52;
    const C = 2 * Math.PI * R;
    return (
        <div className="relative grid place-items-center" style={{ width: 150, height: 150 }}>
            <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
                <circle cx="65" cy="65" r={R} fill="none" stroke="#33445410" strokeWidth="11" />
                <circle cx="65" cy="65" r={R} fill="none" stroke={BLUE} strokeWidth="11" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} />
                <circle cx="65" cy="65" r={R} fill="none" stroke={INK} strokeWidth="2" strokeDasharray={`1 ${C / 100 - 1}`} strokeDashoffset={C * (1 - ideal / 100)} opacity="0.4" />
            </svg>
            <div className="absolute text-center">
                <div className="font-montserrat font-black text-[42px] leading-none" style={{ color: INK }}>{score}</div>
                <div className="font-montserrat font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: "#33445499" }}>/ {ideal} ideal</div>
            </div>
        </div>
    );
}

// Greedily wrap a label into lines of ≤ max chars so the FULL competency title
// shows on the web graph (never truncated).
function wrapLabel(name: string, max = 14): string[] {
    const lines: string[] = [];
    let cur = "";
    for (const w of (name || "").split(/\s+/)) {
        if (!cur) cur = w;
        else if ((cur + " " + w).length <= max) cur += " " + w;
        else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
}

function Radar({ comps }: { comps: Comp[] }) {
    const N = Math.max(comps.length, 3);
    const C = 50;
    const R = 35;
    const ang = (i: number) => ((-90 + (360 / N) * i) * Math.PI) / 180;
    const pt = (r: number, i: number) => [C + r * Math.cos(ang(i)), C + r * Math.sin(ang(i))];
    const poly = (vals: number[]) => vals.map((v, i) => pt((v / 100) * R, i).join(",")).join(" ");
    const LH = 3.1; // label line-height in viewBox units
    return (
        <svg viewBox="-34 -24 168 148" className="w-full h-auto" style={{ maxWidth: 520 }}>
            {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={comps.map((_, i) => pt(f * R, i).join(",")).join(" ")} fill="none" stroke="#33445422" strokeWidth="0.4" />)}
            {comps.map((_, i) => { const [x, y] = pt(R, i); return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#33445422" strokeWidth="0.4" />; })}
            <polygon points={poly(comps.map((c) => c.idealScore))} fill="none" stroke={INK} strokeWidth="0.7" strokeDasharray="2 1.6" opacity="0.5" />
            <polygon points={poly(comps.map((c) => c.score))} fill={`${BLUE}33`} stroke={BLUE} strokeWidth="1.1" />
            {comps.map((c, i) => <circle key={i} cx={pt((c.score / 100) * R, i)[0]} cy={pt((c.score / 100) * R, i)[1]} r="1.5" fill={BLUE} />)}
            {comps.map((c, i) => {
                const [x, y] = pt(R + 6.5, i);
                const anchor = Math.abs(x - C) < 5 ? "middle" : x < C ? "end" : "start";
                const lines = wrapLabel(c.name);
                const y0 = y - ((lines.length - 1) / 2) * LH; // vertically center the block
                return (
                    <text key={i} x={x} y={y0} textAnchor={anchor} dominantBaseline="middle" className="font-montserrat" fontSize="2.7" fontWeight="800" fill={INK}>
                        {lines.map((ln, j) => <tspan key={j} x={x} dy={j === 0 ? 0 : LH}>{ln}</tspan>)}
                    </text>
                );
            })}
        </svg>
    );
}

function CourseCard({ title, url, competency, reason }: { title: string; url: string; competency: string; reason?: string }) {
    const c = compColor(competency);
    return (
        <a href={safeUrl(url)} target="_blank" rel="noopener noreferrer" className="course-card group block rounded-xl overflow-hidden border bg-white no-underline" style={{ borderColor: LINE }}>
            <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${c} 0%, ${INK} 110%)` }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "13px 13px" }} />
                <div className="absolute left-3.5 top-3 font-montserrat font-black text-white/90 text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <span className="inline-grid place-items-center w-4 h-4 rounded-[3px] bg-white text-[#0a66c2] text-[10px] font-black">in</span> LinkedIn Learning
                </div>
                <div className="absolute left-3.5 bottom-2.5 right-3.5 font-montserrat font-black text-white leading-[1.05] text-[15px]">{title}</div>
                <span className="absolute right-3 bottom-2.5 grid place-items-center w-7 h-7 rounded-full bg-white text-[#334454] text-[13px] group-hover:scale-110 transition-transform">▶</span>
            </div>
            <div className="px-3.5 py-2.5">
                <div className="font-montserrat font-black uppercase tracking-[0.12em] text-[9px]" style={{ color: c }}>{competency}</div>
                {reason && <p className="font-hind text-[12px] leading-snug mt-1" style={{ color: "#334454aa" }}>{reason.length > 110 ? reason.slice(0, 108) + "…" : reason}</p>}
            </div>
        </a>
    );
}

function LearningRow({ s }: { s: IdealSkill }) {
    const st = STATUS[s.status] ?? STATUS.missing;
    const cur = s.currentRating ?? 0;
    const accent = compColor(s.name);
    return (
        <div className="border-t py-3 flex flex-col md:flex-row md:items-center gap-x-5 gap-y-2" style={{ borderColor: "#3344540e" }}>
            <div className="flex-1 min-w-0">
                <h3 className="font-montserrat font-black text-[14.5px] leading-tight" style={{ color: INK }}>{s.courseTitle}</h3>
                <p className="font-hind text-[12.5px] mt-0.5" style={{ color: "#33445499" }}>
                    <b style={{ color: INK }}>{s.name}</b> is {s.status} · <span className="font-mono">{s.courseCode}</span> · {s.year} {s.trimester}
                </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap md:flex-nowrap">
                <span className="font-montserrat font-black uppercase text-[10px] tracking-[0.12em] px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.c }}>{st.label}</span>
                <div className="flex items-center gap-2 min-w-[140px]">
                    <div className="relative h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "#33445410" }}>
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${cur}%`, background: accent }} />
                        <div className="absolute top-[-2px] bottom-[-2px] w-[2px]" style={{ left: `${s.targetRating}%`, background: INK, opacity: 0.4 }} />
                    </div>
                    <span className="font-montserrat font-black text-[11.5px] tabular-nums shrink-0" style={{ color: INK }}>{cur}% / {s.targetRating}%</span>
                </div>
                <a href={safeUrl(s.coursewareUrl)} target="_blank" rel="noopener noreferrer" className="font-montserrat font-bold text-[10px] uppercase tracking-wide px-2 py-1 rounded-md border" style={{ color: BLUE, borderColor: "#08a0e944" }}>Courseware</a>
                <a href={safeUrl(s.linkedinLearningUrl)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid place-items-center w-7 h-7 rounded-md font-black text-white text-[12px] shrink-0" style={{ background: "#0a66c2" }}>in</a>
            </div>
        </div>
    );
}

function Narrative({ md }: { md: string }) {
    const body = (md || "").split(/\n---\n/)[0];
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const inline = (s: string) =>
        esc(s)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#08a0e9">$1</a>')
            .replace(/\[([a-z0-9-]+:[^\]]+)\]/gi, '<sup style="color:#33445499;font-size:0.7em"> [$1]</sup>');
    return (
        <div className="space-y-3 max-w-3xl">
            {body.split(/\n\n+/).filter(Boolean).map((b, i) =>
                b.startsWith("## ") ? (
                    <h3 key={i} className="font-montserrat font-black text-[17px] mt-4" style={{ color: INK }}>{b.replace(/^##\s*/, "")}</h3>
                ) : (
                    <p key={i} className="font-hind text-[14.5px] leading-relaxed" style={{ color: "#334454d9" }} dangerouslySetInnerHTML={{ __html: inline(b) }} />
                ),
            )}
        </div>
    );
}

// ── sidebar + topbar ─────────────────────────────────────────────────────────
const NAV = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "competencies", icon: "🕸️", label: "Competencies" },
    { id: "skills", icon: "🧰", label: "Skills" },
    { id: "strengths", icon: "⭐", label: "Strengths" },
    { id: "gaps", icon: "🎯", label: "Focus areas" },
    { id: "roadmap", icon: "🧭", label: "Action roadmap" },
    { id: "learning", icon: "🎓", label: "Learning map" },
    { id: "recs", icon: "📚", label: "Courses" },
    { id: "narrative", icon: "📝", label: "Assessment" },
    { id: "references", icon: "🔖", label: "References" },
];

// Compact line icons (inherit currentColor) for the icon rail.
function NavIcon({ name }: { name: string }) {
    const p: Record<string, ReactNode> = {
        overview: (<><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></>),
        competencies: (<><path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6z" /><circle cx="12" cy="12" r="2.6" /></>),
        skills: (<><line x1="6" y1="20" x2="6" y2="11" /><line x1="12" y1="20" x2="12" y2="5" /><line x1="18" y1="20" x2="18" y2="14" /></>),
        strengths: (<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.5l6-.8z" />),
        gaps: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1" /></>),
        roadmap: (<polygon points="3 11 21 3 13 21 11 13 3 11" />),
        learning: (<><path d="M2.5 8.5L12 4l9.5 4.5L12 13z" /><path d="M6 10.6V16c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-5.4" /></>),
        recs: (<><path d="M4 4.6A1.6 1.6 0 015.6 3H20v15.4H5.6A1.6 1.6 0 014 16.8z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="13" y2="12" /></>),
        narrative: (<><path d="M6 2.6h7l5 5V21H6z" /><line x1="9.5" y1="13" x2="14.5" y2="13" /><line x1="9.5" y1="16.5" x2="14.5" y2="16.5" /></>),
        references: (<path d="M6.5 3h11v18l-5.5-3.8L6.5 21z" />),
    };
    return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{p[name] ?? p.overview}</svg>
    );
}

function Sidebar({ d, active }: { d: Dashboard; active: string }) {
    // Collapsed icon rail that widens on hover to reveal labels (overlays content).
    const label = "whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200";
    return (
        <aside
            className="dash-sidebar no-print group fixed left-0 top-0 bottom-0 w-[76px] hover:w-[248px] flex flex-col overflow-hidden z-40 transition-[width] duration-300 ease-out hover:shadow-[12px_0_44px_rgba(40,40,40,0.30)]"
            style={{ background: INK }}
        >
            {/* logo */}
            <div className="h-[68px] flex items-center gap-3 pl-[18px] shrink-0 border-b border-white/10">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-white p-1.5 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/briefcase-logo.svg" alt="Briefcase" className="w-full h-full object-contain" />
                </span>
                <span className={`font-montserrat font-black text-white text-[19px] tracking-tight ${label} delay-[40ms]`}>Briefcase</span>
            </div>

            {/* nav */}
            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                <p className={`pl-[27px] mb-2 h-3 font-montserrat font-black uppercase tracking-[0.22em] text-[9px] ${label}`} style={{ color: "#ffffff55" }}>Report</p>
                <div className="flex flex-col gap-1 px-3">
                    {NAV.map((n) => {
                        const on = active === n.id;
                        return (
                            <a
                                key={n.id}
                                href={`#${n.id}`}
                                aria-label={n.label}
                                className={`flex items-center gap-3 h-11 pl-[15px] pr-2 rounded-xl overflow-hidden transition-colors ${on ? "text-white" : "text-white/50 hover:text-white hover:bg-white/[0.06]"}`}
                                style={on ? { background: BLUE } : undefined}
                            >
                                <span className="shrink-0"><NavIcon name={n.id} /></span>
                                <span className={`font-montserrat font-bold text-[14px] ${label}`}>{n.label}</span>
                            </a>
                        );
                    })}
                </div>
            </nav>

            {/* user */}
            <div className="shrink-0 border-t border-white/10 px-3 py-3">
                <div className="flex items-center gap-3 h-11 pl-[11px] pr-2 rounded-xl overflow-hidden">
                    <span className="shrink-0 grid place-items-center w-[26px] h-[26px] rounded-full font-montserrat font-black text-white text-[11px]" style={{ background: BLUE }}>{d.student.firstName[0]}{d.student.lastName[0]}</span>
                    <div className={`min-w-0 ${label}`}>
                        <div className="font-montserrat font-black text-white text-[13px] leading-tight truncate">{d.student.firstName} {d.student.lastName}</div>
                        <div className="font-hind text-[11px] leading-tight truncate" style={{ color: "#ffffff88" }}>Year {d.student.yearLevel} · {d.overview.ratingLabel}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function WrappedBanner({ firstName }: { firstName: string }) {
    return (
        <Link href="/wrapped" className="dash-card no-print group relative block overflow-hidden rounded-2xl no-underline" style={{ background: `linear-gradient(115deg, ${INK} 0%, #0e3a57 48%, ${BLUE} 100%)` }}>
            <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
            <div className="absolute -right-6 -top-10 w-44 h-44 rounded-full blur-2xl opacity-40" style={{ background: "#7FC4EE" }} />
            <div className="absolute right-32 top-6 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ background: BLUE }} />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 py-6">
                <div className="flex items-center gap-4">
                    <span className="grid place-items-center w-14 h-14 rounded-2xl shrink-0 shadow-lg bg-white p-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/briefcase-logo.svg" alt="Briefcase" className="w-full h-full object-contain" />
                    </span>
                    <div>
                        <p className="font-montserrat font-black uppercase tracking-[0.3em] text-[11px]" style={{ color: "#7FC4EE" }}>Briefcase Wrapped · 2026</p>
                        <h2 className="font-montserrat font-black text-white text-[clamp(20px,2.4vw,28px)] leading-tight mt-1">See {firstName}&apos;s year as a story</h2>
                        <p className="font-hind text-[13.5px] mt-1" style={{ color: "#ffffffcc" }}>Your competencies, wins and roadmap — replayed as an animated recap.</p>
                    </div>
                </div>
                <span className="flex items-center gap-2 rounded-full px-6 py-3 font-montserrat font-black text-[15px] shrink-0 transition-transform group-hover:scale-[1.04] shadow-lg" style={{ background: "#fff", color: INK }}>
                    <span style={{ color: BLUE }}>▶</span> Play Wrapped
                </span>
            </div>
        </Link>
    );
}

function Topbar({ d, onPrint }: { d: Dashboard; onPrint: () => void }) {
    return (
        <header className="dash-topbar no-print sticky top-0 z-20 h-[68px] flex items-center justify-between px-7 bg-white/90 backdrop-blur border-b" style={{ borderColor: LINE }}>
            <div>
                <h1 className="font-montserrat font-black text-[20px] tracking-tight leading-none" style={{ color: INK }}>Career Readiness Dashboard</h1>
                <p className="font-hind text-[13px] mt-0.5" style={{ color: "#33445488" }}>Briefcase · {d.student.firstName} {d.student.lastName} · {d.overview.ratingLabel}</p>
            </div>
            <button onClick={onPrint} className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-montserrat font-black text-white text-[14px] transition-transform hover:scale-[1.03]" style={{ background: BLUE }}>
                <span>⤓</span> Download PDF
            </button>
        </header>
    );
}

// ── report ───────────────────────────────────────────────────────────────────
export function Report({ data }: { data: Dashboard }) {
    const d = data;

    const roadmapTracks = useMemo(() => {
        const groups: Record<string, Dashboard["roadmap"]["nodes"]> = {};
        d.roadmap.nodes.forEach((n) => { (groups[n.competency] ??= []).push(n); });
        const order = ["gap", "course", "project", "evidence"];
        return Object.entries(groups).map(([competency, nodes]) => ({
            competency,
            nodes: [...nodes].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)),
            courses: d.recommendations.filter((r) => r.relatedCompetency === competency),
        }));
    }, [d]);

    const ev = d.student.evidenceCounts as unknown as Record<string, unknown[]>;
    const evTotal = Object.values(ev).reduce((a, v) => a + (Array.isArray(v) ? v.length : Number(v) || 0), 0);
    const lm = d.learningMap;
    const missing = lm?.idealSkills?.filter((s) => s.status === "missing").length ?? 0;
    const skillCount = d.skills.hard.length + d.skills.soft.length + d.skills.uncategorized.length;
    const levelMix = ["Advanced", "Proficient", "Developing", "Emerging"]
        .map((lv) => ({ lv, n: d.competencies.filter((c) => c.level === lv).length, ...levelOf(lv) }))
        .filter((x) => x.n > 0);
    const onPrint = () => window.print();

    // scrollspy — highlight the nav item for the section in view
    const [active, setActive] = useState("overview");
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (vis[0]?.target.id) setActive(vis[0].target.id);
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
        );
        NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
        return () => obs.disconnect();
    }, []);

    return (
        <div className="dash min-h-screen" style={{ background: BG, color: INK }}>
            <style>{`
                html { scroll-behavior: smooth; }
                .dash-card[id] { scroll-margin-top: 88px; }
                @media print {
                    .no-print { display: none !important; }
                    .dash-main { margin-left: 0 !important; }
                    .dash-card { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; }
                    .dash-grid { display: block !important; }
                    .dash-grid > * { margin-bottom: 14px; }
                    body { background: #fff !important; }
                    @page { margin: 12mm; }
                }
                .course-card:hover { box-shadow: 0 10px 26px rgba(51,68,84,0.12); }
                .stat-card { transition: transform .18s ease, box-shadow .18s ease; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(51,68,84,0.1); }
                .nice-scroll::-webkit-scrollbar { width: 7px; }
                .nice-scroll::-webkit-scrollbar-thumb { background: #33445422; border-radius: 99px; }
                .nice-scroll::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            <Sidebar d={d} active={active} />

            <div className="dash-main ml-[76px]">
                <Topbar d={d} onPrint={onPrint} />

                <main className="p-6 lg:p-7 space-y-5">
                    <WrappedBanner firstName={d.student.firstName} />

                    {/* KPI stat row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        <StatCard icon="🎯" color={BLUE} value={`${d.overview.overallScore}`} label="Overall score" sub={`/ ${d.overview.idealScore} ideal`} />
                        <StatCard icon="🏅" color="#0E5A86" value={d.overview.ratingLabel} label="Readiness" sub={`${d.student.sparsity} evidence`} />
                        <StatCard icon="🕸️" color="#1C6FA5" value={d.competencies.length} label="Competencies" sub={`${d.competencies.filter((c) => c.level === "Advanced").length} advanced`} />
                        <StatCard icon="🧰" color={SKY} value={skillCount} label="Skills" sub={`${evTotal} evidence items`} />
                        <StatCard icon="🚧" color="#334454" value={d.gaps.length} label="Focus areas" sub={`${missing} curriculum gaps`} />
                    </div>

                    <div className="dash-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* overview */}
                        <Card id="overview" span={2} title={`Where ${d.student.firstName} stands`} subtitle="Executive summary">
                            <p className="font-hind text-[14.5px] leading-relaxed line-clamp-3" style={{ color: "#334454cc" }}>{d.overview.summary}</p>
                            <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                {[
                                    { items: d.overview.topIssues, label: "Top issues", icon: "⚠", c: "#334454", bg: "#e8edf0" },
                                    { items: d.overview.quickFixes, label: "Quick fixes", icon: "✓", c: "#0E5A86", bg: "#e2f3fd" },
                                ].map((col) => (
                                    <div key={col.label} className="rounded-xl border p-4" style={{ borderColor: LINE, background: col.bg }}>
                                        <h3 className="font-montserrat font-black uppercase tracking-[0.14em] text-[11px] flex items-center gap-1.5" style={{ color: col.c }}><span>{col.icon}</span> {col.label}</h3>
                                        <ul className="mt-2.5 space-y-2.5">{col.items.slice(0, 3).map((t, i) => (
                                            <li key={i} className="flex gap-2.5">
                                                <span className="grid place-items-center w-4 h-4 rounded-full font-montserrat font-black text-[9px] text-white shrink-0 mt-[1px]" style={{ background: col.c }}>{i + 1}</span>
                                                <span className="font-hind text-[12.5px] leading-snug line-clamp-2" style={{ color: "#334454cc" }}>{t}</span>
                                            </li>
                                        ))}</ul>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* readiness ring + competency mix */}
                        <Card title="Readiness" subtitle={`Target ${d.overview.idealScore}/100`}>
                            <div className="grid place-items-center gap-2 py-1">
                                <ScoreRing score={d.overview.overallScore} ideal={d.overview.idealScore} />
                                <span className="font-montserrat font-black uppercase tracking-[0.2em] text-[13px]" style={{ color: BLUE }}>{d.overview.ratingLabel}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t" style={{ borderColor: LINE }}>
                                <p className="font-montserrat font-black uppercase tracking-[0.16em] text-[10px] mb-2" style={{ color: "#33445499" }}>Competency mix</p>
                                <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px]">
                                    {levelMix.map((m) => <div key={m.lv} title={`${m.n} ${m.lv}`} style={{ width: `${(m.n / d.competencies.length) * 100}%`, background: m.color }} />)}
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                                    {levelMix.map((m) => <span key={m.lv} className="flex items-center gap-1.5 font-hind text-[12px]" style={{ color: "#334454aa" }}><span className="w-2 h-2 rounded-full" style={{ background: m.color }} /><b style={{ color: INK }}>{m.n}</b> {m.lv}</span>)}
                                </div>
                            </div>
                        </Card>

                        {/* competency profile */}
                        <Card id="competencies" span={3} title="Competency profile" subtitle={`${d.competencies.length} competencies, scored vs. ideal`}>
                            <div className="flex flex-col lg:flex-row gap-7 items-center">
                                <div className="shrink-0 w-full lg:w-[480px] grid place-items-center"><Radar comps={d.competencies} /></div>
                                <div className="flex-1 grid sm:grid-cols-2 gap-2.5 w-full">
                                    {d.competencies.map((c) => (
                                        <div key={c.name} className="rounded-xl border p-3" style={{ borderColor: LINE }}>
                                            <div className="flex items-center justify-between gap-2"><span className="font-montserrat font-black text-[13.5px] leading-tight" style={{ color: INK }}>{c.name}</span><LevelBadge level={c.level} /></div>
                                            <div className="flex items-center gap-2 mt-2"><Bar value={c.score} ideal={c.idealScore} color={compColor(c.name)} /><span className="font-montserrat font-black text-[13px] tabular-nums w-7 text-right" style={{ color: INK }}>{c.score}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* skills */}
                        <Card id="skills" span={2} title="Skills inventory" subtitle="Self-reported ratings">
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                                {[...d.skills.hard, ...d.skills.soft, ...d.skills.uncategorized].map((s) => (
                                    <div key={s.name} className="flex items-center gap-3">
                                        <span className="font-montserrat font-bold text-[13.5px] w-28 shrink-0 truncate" style={{ color: INK }}>{s.name}</span>
                                        <Bar value={s.rating} color={s.rating >= 85 ? "#0E5A86" : s.rating >= 70 ? BLUE : SKY} />
                                        <span className="font-montserrat font-black text-[13px] tabular-nums w-7 text-right" style={{ color: INK }}>{s.rating}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* strengths */}
                        <Card id="strengths" title="Standout strengths">
                            <div className="space-y-3">
                                {d.strengths.map((s) => {
                                    const comp = d.competencies.find((c) => c.name === s.area);
                                    const c = compColor(s.area);
                                    return (
                                        <div key={s.area} className="rounded-xl p-3.5" style={{ background: `${c}0d`, border: `1px solid ${c}26` }}>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0"><span>⭐</span><h3 className="font-montserrat font-black text-[14px] truncate" style={{ color: INK }}>{s.area}</h3></div>
                                                {comp && <span className="font-montserrat font-black text-[16px] tabular-nums shrink-0" style={{ color: c }}>{comp.score}</span>}
                                            </div>
                                            {comp && <div className="mt-2"><Bar value={comp.score} ideal={comp.idealScore} color={c} /></div>}
                                            <p className="font-hind text-[12px] leading-snug mt-2 line-clamp-2" style={{ color: "#334454aa" }}>{s.evidence[0]}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* gaps */}
                        <Card id="gaps" span={3} title="Focus areas" subtitle="Biggest distance from the ideal — start here">
                            <div className="grid md:grid-cols-2 gap-4">
                                {d.gaps.map((g) => {
                                    const comp = d.competencies.find((c) => c.name === g.area);
                                    const score = comp?.score ?? 0;
                                    const ideal = comp?.idealScore ?? 100;
                                    const c = compColor(g.area);
                                    return (
                                        <div key={g.area} className="rounded-xl border p-4" style={{ borderColor: LINE }}>
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-montserrat font-black text-[16px] min-w-0 truncate" style={{ color: c }}>{g.area}</h3>
                                                <span className="font-montserrat font-black uppercase text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0" style={{ background: `${c}18`, color: c }}>−{ideal - score} to ideal</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Bar value={score} ideal={ideal} color={c} />
                                                <span className="font-montserrat font-black text-[13px] tabular-nums shrink-0" style={{ color: INK }}>{score}/{ideal}</span>
                                            </div>
                                            <p className="font-hind text-[12.5px] leading-snug mt-3 line-clamp-2" style={{ color: "#334454aa" }}>{g.reason}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-3">{g.search_keywords.map((k) => <span key={k} className="font-montserrat font-bold text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: `${c}14`, color: c }}>#{k}</span>)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* action roadmap — dynamic gap → learn → build → document from the API */}
                        <Card id="roadmap" span={3} title="Action roadmap" subtitle="A path out of each gap, with courses to take">
                            <div className="space-y-6">
                                {roadmapTracks.map((track) => (
                                    <div key={track.competency} className="rounded-xl border p-5" style={{ borderColor: LINE }}>
                                        <h3 className="font-montserrat font-black text-[16px]" style={{ color: compColor(track.competency) }}>{track.competency}</h3>
                                        <div className="flex items-stretch gap-2 mt-3.5 overflow-x-auto pb-1">
                                            {track.nodes.map((n, i) => {
                                                const r = ROAD[n.type] ?? ROAD.course;
                                                return (
                                                    <div key={n.id} className="flex items-stretch gap-2 shrink-0">
                                                        <div className="rounded-xl p-3 w-[200px]" style={{ background: `${r.color}0c`, border: `1px solid ${r.color}2e` }}>
                                                            <div className="flex items-center gap-1.5 font-montserrat font-black uppercase tracking-[0.12em] text-[10px]" style={{ color: r.color }}><span className="text-[13px]">{r.icon}</span> {r.label}</div>
                                                            <div className="font-hind text-[12px] leading-snug mt-1.5" style={{ color: "#334454bb" }}>{n.detail.length > 116 ? n.detail.slice(0, 114) + "…" : n.detail}</div>
                                                        </div>
                                                        {i < track.nodes.length - 1 && <div className="self-center font-montserrat font-black text-base" style={{ color: `${compColor(track.competency)}88` }}>→</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {track.courses.length > 0 && (
                                            <>
                                                <p className="font-montserrat font-black uppercase tracking-[0.16em] text-[10px] mt-5 mb-2.5" style={{ color: "#33445499" }}>Recommended courses</p>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {track.courses.map((rec) => { const kw = rec.title.replace(/^.*?:\s*/, "").replace(/^Deepen with /, "").replace(/^"|"$/g, ""); return <CourseCard key={rec.url} title={kw} url={rec.url} competency={track.competency} reason={rec.reason} />; })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* learning map — list, no show-more */}
                        {(lm?.idealSkills?.length ?? 0) > 0 && (
                            <Card id="learning" span={3} title="Learning Map" subtitle={lm.summary} right={<span className="font-montserrat font-bold text-[11px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full" style={{ background: "#08a0e914", color: INK }}>{lm.programCode} · Target {lm.targetScore}%</span>}>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {[`${missing} missing`, `${lm.idealSkills.filter((s) => s.status === "needs-work").length} needs work`, `${lm.idealSkills.filter((s) => s.status === "met").length} met`].map((t, i) => (
                                        <span key={t} className="font-montserrat font-bold text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full" style={{ background: [STATUS.missing, STATUS["needs-work"], STATUS.met][i].bg, color: [STATUS.missing, STATUS["needs-work"], STATUS.met][i].c }}>{t}</span>
                                    ))}
                                </div>
                                <div className="mt-1">{lm.idealSkills.map((s, i) => <LearningRow key={i} s={s} />)}</div>
                            </Card>
                        )}

                        {/* recommendations */}
                        {d.recommendations.length > 0 && (
                            <Card id="recs" span={3} title="Recommended courses" subtitle="LinkedIn Learning, targeted to your gaps">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {d.recommendations.map((rec) => { const kw = rec.title.replace(/^.*?:\s*/, "").replace(/^Deepen with /, "").replace(/^"|"$/g, ""); return <CourseCard key={rec.url} title={kw} url={rec.url} competency={rec.relatedCompetency} reason={rec.reason} />; })}
                                </div>
                            </Card>
                        )}

                        {/* narrative */}
                        {d.narrative && (
                            <Card id="narrative" span={3} title="The complete assessment" subtitle="Scroll for the full evidence-based write-up">
                                <div className="relative">
                                    <div className="nice-scroll max-h-[320px] overflow-y-auto pr-4"><Narrative md={d.narrative} /></div>
                                    <div className="pointer-events-none absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                </div>
                            </Card>
                        )}

                        {/* references */}
                        {d.references.length > 0 && (
                            <Card id="references" span={3} title="References">
                                <ul className="space-y-2">
                                    {d.references.map((r) => (
                                        <li key={r.id} className="font-hind text-[13px] leading-snug flex gap-2" style={{ color: "#334454bb" }}>
                                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 h-fit" style={{ background: "#33445408", color: "#33445488" }}>{r.id}</span>
                                            {/^https?:\/\//i.test(r.url) ? <a href={safeUrl(r.url)} target="_blank" rel="noopener noreferrer" style={{ color: INK }}>{r.title}</a> : <span>{r.title}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    <p className="font-montserrat font-bold text-[11px] uppercase tracking-[0.2em] mt-7" style={{ color: "#33445488" }}>Briefcase · generated {d.run.id} · {d.student.id}</p>
                </main>
            </div>
        </div>
    );
}
