"use client";

import { useMemo, type ReactNode } from "react";
import type { Dashboard } from "@/lib/get-dashboard";

// ── palette (styling only — data comes from the API via props) ───────────────
const INK = "#0a2236";
const BLUE = "#08a0e9";
const ORANGE = "#e07a3b";
const PAPER = "#faf6ec";

const LEVEL: Record<string, { color: string; bg: string }> = {
    Advanced: { color: "#15803d", bg: "#dcfce7" },
    Proficient: { color: "#0e7490", bg: "#cffafe" },
    Developing: { color: "#b45309", bg: "#fef3c7" },
    Emerging: { color: "#9f1239", bg: "#ffe4e6" },
};
const levelOf = (l: string) => LEVEL[l] ?? { color: INK, bg: "#0a223614" };

// Colour any competency/skill name deterministically — works for whatever names
// the API returns, no hard-coded mapping.
const PALETTE = ["#08a0e9", "#8b5cf6", "#e07a3b", "#15803d", "#0e7490", "#db2777", "#0a2236", "#ca8a04", "#0ea5e9"];
const compColor = (name: string) =>
    PALETTE[Math.abs([...(name || "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) % PALETTE.length];

// API-supplied URLs are only rendered if http(s) — blocks javascript:/data: in href.
const safeUrl = (u?: string) => (typeof u === "string" && /^https?:\/\//i.test(u) ? u : "#");

type Comp = Dashboard["competencies"][number];

// ── tiny helpers ─────────────────────────────────────────────────────────────
function Kicker({ children }: { children: ReactNode }) {
    return <p className="font-montserrat font-black uppercase tracking-[0.32em] text-[11px]" style={{ color: ORANGE }}>{children}</p>;
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="report-section mx-auto w-full max-w-5xl px-7 py-10">
            <Kicker>{kicker}</Kicker>
            <h2 className="font-figtree font-black tracking-tight text-[clamp(26px,3.4vw,40px)] leading-[1.05] mt-1.5" style={{ color: INK }}>
                {title}
            </h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function LevelBadge({ level }: { level: string }) {
    const c = levelOf(level);
    return (
        <span className="font-montserrat font-black uppercase tracking-[0.14em] text-[10px] px-2.5 py-1 rounded-full" style={{ color: c.color, backgroundColor: c.bg }}>
            {level}
        </span>
    );
}

function Bar({ value, ideal, color }: { value: number; ideal?: number; color: string }) {
    return (
        <div className="relative h-2.5 w-full rounded-full overflow-visible" style={{ backgroundColor: "#0a223614" }}>
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
            {ideal != null && (
                <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded" style={{ left: `${ideal}%`, backgroundColor: INK, opacity: 0.5 }} title={`ideal ${ideal}`} />
            )}
        </div>
    );
}

function ScoreRing({ score, ideal }: { score: number; ideal: number }) {
    const R = 52;
    const C = 2 * Math.PI * R;
    return (
        <div className="relative grid place-items-center" style={{ width: 150, height: 150 }}>
            <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
                <circle cx="65" cy="65" r={R} fill="none" stroke="#0a223614" strokeWidth="12" />
                <circle cx="65" cy="65" r={R} fill="none" stroke={BLUE} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} />
                <circle cx="65" cy="65" r={R} fill="none" stroke={INK} strokeWidth="2" strokeDasharray={`1 ${C / 100 - 1}`} strokeDashoffset={C * (1 - ideal / 100)} opacity="0.45" />
            </svg>
            <div className="absolute text-center">
                <div className="font-figtree font-black text-[44px] leading-none" style={{ color: INK }}>{score}</div>
                <div className="font-montserrat font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: "#0a223699" }}>/ {ideal} ideal</div>
            </div>
        </div>
    );
}

// ── competency radar — scales to N competencies ──────────────────────────────
function Radar({ comps }: { comps: Comp[] }) {
    const N = Math.max(comps.length, 3);
    const C = 50;
    const R = 38;
    const ang = (i: number) => ((-90 + (360 / N) * i) * Math.PI) / 180;
    const pt = (r: number, i: number) => [C + r * Math.cos(ang(i)), C + r * Math.sin(ang(i))];
    const poly = (vals: number[]) => vals.map((v, i) => pt((v / 100) * R, i).join(",")).join(" ");
    return (
        <svg viewBox="-18 -14 136 128" className="w-full h-auto" style={{ maxWidth: 520 }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
                <polygon key={f} points={comps.map((_, i) => pt(f * R, i).join(",")).join(" ")} fill="none" stroke="#0a223622" strokeWidth="0.4" />
            ))}
            {comps.map((_, i) => {
                const [x, y] = pt(R, i);
                return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#0a223622" strokeWidth="0.4" />;
            })}
            <polygon points={poly(comps.map((c) => c.idealScore))} fill="none" stroke={INK} strokeWidth="0.7" strokeDasharray="2 1.6" opacity="0.5" />
            <polygon points={poly(comps.map((c) => c.score))} fill={`${BLUE}33`} stroke={BLUE} strokeWidth="1.1" />
            {comps.map((c, i) => (
                <circle key={i} cx={pt((c.score / 100) * R, i)[0]} cy={pt((c.score / 100) * R, i)[1]} r="1.5" fill={BLUE} />
            ))}
            {comps.map((c, i) => {
                const [x] = pt(R + 9, i);
                const [, y] = pt(R + 9, i);
                const anchor = Math.abs(x - C) < 4 ? "middle" : x < C ? "end" : "start";
                const short = c.name.split(" ").slice(0, 3).join(" ");
                return (
                    <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="font-montserrat" fontSize="2.9" fontWeight="800" fill={INK}>
                        {short.length > 18 ? short.slice(0, 17) + "…" : short}
                    </text>
                );
            })}
        </svg>
    );
}

// ── LinkedIn course card (designed cover banner) ─────────────────────────────
function CourseCard({ title, url, competency, keyword, reason }: { title: string; url: string; competency: string; keyword?: string; reason?: string }) {
    const c = compColor(competency);
    return (
        <a href={safeUrl(url)} target="_blank" rel="noopener noreferrer" className="course-card group block rounded-2xl overflow-hidden border bg-white no-underline" style={{ borderColor: "#0a223618" }}>
            <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(135deg, ${c} 0%, ${INK} 110%)` }}>
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)", backgroundSize: "14px 14px" }} />
                <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full" style={{ background: "#ffffff22" }} />
                <div className="absolute left-4 top-3.5 font-montserrat font-black text-white/90 text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <span className="inline-grid place-items-center w-4 h-4 rounded-[3px] bg-white text-[#0a66c2] text-[9px] font-black">in</span>
                    LinkedIn Learning
                </div>
                <div className="absolute left-4 bottom-3 right-4">
                    <div className="font-figtree font-black text-white leading-[1.05] text-[15px]">{keyword ?? title}</div>
                </div>
                <span className="absolute right-3.5 bottom-3 grid place-items-center w-8 h-8 rounded-full bg-white text-[#0a2236] text-[13px] shadow group-hover:scale-110 transition-transform">▶</span>
            </div>
            <div className="px-4 py-3">
                <div className="font-montserrat font-black uppercase tracking-[0.14em] text-[9px]" style={{ color: c }}>{competency} · Intermediate</div>
                <div className="font-figtree font-bold text-[14px] leading-snug mt-1" style={{ color: INK }}>{title}</div>
                {reason && <p className="font-hind text-[12px] leading-snug mt-1.5" style={{ color: "#0a2236aa" }}>{reason.length > 130 ? reason.slice(0, 128) + "…" : reason}</p>}
            </div>
        </a>
    );
}

// ── narrative (light markdown, escaped) ──────────────────────────────────────
function Narrative({ md }: { md: string }) {
    const body = (md || "").split(/\n---\n/)[0];
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const inline = (s: string) =>
        esc(s)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#08a0e9">$1</a>')
            .replace(/\[([a-z0-9-]+:[^\]]+)\]/gi, '<sup style="color:#0a223699;font-size:0.7em"> [$1]</sup>');
    const blocks = body.split(/\n\n+/).filter(Boolean);
    return (
        <div className="space-y-3.5">
            {blocks.map((b, i) =>
                b.startsWith("## ") ? (
                    <h3 key={i} className="font-figtree font-black text-[19px] mt-5" style={{ color: INK }}>{b.replace(/^##\s*/, "")}</h3>
                ) : (
                    <p key={i} className="font-hind text-[14px] leading-relaxed" style={{ color: "#0a2236d9" }} dangerouslySetInnerHTML={{ __html: inline(b) }} />
                ),
            )}
        </div>
    );
}

export function Report({ data }: { data: Dashboard }) {
    const d = data;

    const roadmapTracks = useMemo(() => {
        const groups: Record<string, Dashboard["roadmap"]["nodes"]> = {};
        d.roadmap.nodes.forEach((n) => {
            (groups[n.competency] ??= []).push(n);
        });
        const order = ["gap", "course", "project", "evidence"];
        return Object.entries(groups).map(([competency, nodes]) => ({
            competency,
            nodes: [...nodes].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)),
            courses: d.recommendations.filter((r) => r.relatedCompetency === competency),
        }));
    }, [d]);

    const ev = d.student.evidenceCounts;
    const onPrint = () => window.print();

    return (
        <main className="min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .report-section { break-inside: avoid; page-break-inside: avoid; padding-top: 22px; padding-bottom: 22px; }
                    .course-card, .keep { break-inside: avoid; }
                    body { background: #fff !important; }
                    @page { margin: 14mm; }
                }
                .course-card:hover { box-shadow: 0 12px 30px rgba(10,34,54,0.12); }
            `}</style>

            <button
                onClick={onPrint}
                className="no-print fixed bottom-7 right-7 z-50 flex items-center gap-2.5 rounded-full px-6 py-3.5 font-figtree font-black text-white shadow-[0_14px_34px_rgba(8,160,233,0.4)] transition-transform hover:scale-[1.04]"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${INK})` }}
            >
                <span className="text-lg">⤓</span> Download PDF
            </button>

            {/* cover */}
            <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${INK} 0%, #123047 60%, #0e2a40 100%)` }}>
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
                <div className="mx-auto w-full max-w-5xl px-7 py-12 relative">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="min-w-[280px]">
                            <p className="font-montserrat font-black uppercase tracking-[0.34em] text-[11px]" style={{ color: BLUE }}>Briefcase · Career Readiness Report</p>
                            <h1 className="font-figtree font-black text-white tracking-tight leading-[0.95] text-[clamp(38px,6vw,72px)] mt-3">{d.student.firstName} {d.student.lastName}</h1>
                            <p className="font-figtree font-bold text-[#f4ead2] text-[clamp(15px,2vw,20px)] mt-2">{d.student.headline}</p>
                            <div className="flex flex-wrap items-center gap-2.5 mt-4">
                                {[`${d.student.program} · ${d.student.specialization}`, `Year ${d.student.yearLevel}`, d.overview.ratingLabel, `Evidence: ${d.student.sparsity}`].filter(Boolean).map((t) => (
                                    <span key={t} className="font-montserrat font-bold text-[11px] uppercase tracking-[0.12em] text-white/90 px-3 py-1.5 rounded-full" style={{ background: "#ffffff1a", border: "1px solid #ffffff26" }}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="grid place-items-center gap-2">
                            <ScoreRing score={d.overview.overallScore} ideal={d.overview.idealScore} />
                            <p className="font-montserrat font-black uppercase tracking-[0.2em] text-[12px]" style={{ color: BLUE }}>{d.overview.ratingLabel}</p>
                        </div>
                    </div>
                    <p className="font-hind text-white/70 text-[12px] mt-8">Run {d.run.id} · status {d.run.status} · framework v{d.run.frameworkVersion}</p>
                </div>
            </header>

            {/* executive summary */}
            <Section id="summary" kicker="Executive summary" title={`Where ${d.student.firstName} stands today`}>
                <p className="font-hind text-[15px] leading-relaxed max-w-3xl" style={{ color: "#0a2236d9" }}>{d.overview.summary}</p>
                <div className="grid sm:grid-cols-2 gap-5 mt-7">
                    <div className="keep rounded-2xl border p-5" style={{ borderColor: "#0a223618", background: "#fff" }}>
                        <h3 className="font-figtree font-black text-[15px]" style={{ color: "#9f1239" }}>⚠ Top issues</h3>
                        <ul className="mt-3 space-y-2.5">
                            {d.overview.topIssues.map((t, i) => (
                                <li key={i} className="font-hind text-[13px] leading-snug pl-4 relative" style={{ color: "#0a2236cc" }}>
                                    <span className="absolute left-0 top-[2px]" style={{ color: "#9f1239" }}>›</span>{t}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="keep rounded-2xl border p-5" style={{ borderColor: "#0a223618", background: "#fff" }}>
                        <h3 className="font-figtree font-black text-[15px]" style={{ color: "#15803d" }}>✓ Quick fixes</h3>
                        <ul className="mt-3 space-y-2.5">
                            {d.overview.quickFixes.map((t, i) => (
                                <li key={i} className="font-hind text-[13px] leading-snug pl-4 relative" style={{ color: "#0a2236cc" }}>
                                    <span className="absolute left-0 top-[2px]" style={{ color: "#15803d" }}>›</span>{t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2.5 mt-6">
                    {Object.entries(ev).map(([k, v]) => (
                        <span key={k} className="font-montserrat text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ background: v ? "#08a0e914" : "#0a223608", color: v ? INK : "#0a223666" }}>
                            <b style={{ color: v ? BLUE : "#0a223666" }}>{v}</b> {k}
                        </span>
                    ))}
                </div>
            </Section>

            {/* competencies */}
            <Section id="competencies" kicker="Competency profile" title={`${d.competencies.length} competencies, scored vs. the ideal`}>
                <div className="flex flex-col lg:flex-row gap-8 items-center keep">
                    <div className="shrink-0 w-full lg:w-[460px]"><Radar comps={d.competencies} /></div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-3 w-full">
                        {d.competencies.map((c) => (
                            <div key={c.name} className="rounded-xl border p-3.5" style={{ borderColor: "#0a223614", background: "#fff" }}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-figtree font-black text-[13px] leading-tight" style={{ color: INK }}>{c.name}</span>
                                    <LevelBadge level={c.level} />
                                </div>
                                <div className="flex items-center gap-2 mt-2.5">
                                    <Bar value={c.score} ideal={c.idealScore} color={compColor(c.name)} />
                                    <span className="font-figtree font-black text-[13px] tabular-nums w-7 text-right" style={{ color: INK }}>{c.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-7">
                    {d.competencies.map((c) => (
                        <div key={c.name} className="course-card rounded-2xl border p-5" style={{ borderColor: "#0a223614", background: "#fff" }}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-figtree font-black text-[15px]" style={{ color: INK }}>{c.name}</h3>
                                <LevelBadge level={c.level} />
                            </div>
                            <p className="font-hind text-[12.5px] leading-snug mt-2" style={{ color: "#0a2236cc" }}>{c.diagnosis}</p>
                            <ul className="mt-3 space-y-1.5">
                                {c.evidence.slice(0, 3).map((e, i) => (
                                    <li key={i} className="font-hind text-[11.5px] leading-snug pl-3.5 relative" style={{ color: "#0a223699" }}>
                                        <span className="absolute left-0" style={{ color: compColor(c.name) }}>•</span>{e}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {c.citations.map((ci, i) => (
                                    <span key={i} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#0a223608", color: "#0a223688" }}>{ci.doc}:{ci.clause.length > 16 ? ci.clause.slice(0, 15) + "…" : ci.clause}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* skills */}
            <Section id="skills" kicker="Skills inventory" title="Self-reported skill ratings">
                <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3.5 keep">
                    {[...d.skills.hard, ...d.skills.soft, ...d.skills.uncategorized].map((s) => (
                        <div key={s.name} className="flex items-center gap-3">
                            <span className="font-figtree font-bold text-[13px] w-32 shrink-0" style={{ color: INK }}>{s.name}</span>
                            <Bar value={s.rating} color={s.rating >= 85 ? "#15803d" : s.rating >= 70 ? BLUE : ORANGE} />
                            <span className="font-figtree font-black text-[13px] tabular-nums w-8 text-right" style={{ color: INK }}>{s.rating}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* strengths */}
            {d.strengths.length > 0 && (
                <Section id="strengths" kicker="Standout strengths" title="What's already working">
                    <div className="grid md:grid-cols-3 gap-4">
                        {d.strengths.map((s) => (
                            <div key={s.area} className="course-card rounded-2xl p-5" style={{ background: `linear-gradient(160deg, ${compColor(s.area)}14, #fff)`, border: `1px solid ${compColor(s.area)}33` }}>
                                <div className="text-[22px]">★</div>
                                <h3 className="font-figtree font-black text-[15px] mt-1" style={{ color: INK }}>{s.area}</h3>
                                <ul className="mt-3 space-y-1.5">
                                    {s.evidence.slice(0, 3).map((e, i) => (
                                        <li key={i} className="font-hind text-[11.5px] leading-snug pl-3.5 relative" style={{ color: "#0a2236aa" }}>
                                            <span className="absolute left-0" style={{ color: compColor(s.area) }}>•</span>{e}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* gaps */}
            {d.gaps.length > 0 && (
                <Section id="gaps" kicker="Growth gaps" title="Where to focus next">
                    <div className="grid md:grid-cols-2 gap-4">
                        {d.gaps.map((g) => (
                            <div key={g.area} className="course-card rounded-2xl border p-5" style={{ borderColor: "#0a223618", background: "#fff" }}>
                                <h3 className="font-figtree font-black text-[16px]" style={{ color: compColor(g.area) }}>{g.area}</h3>
                                <p className="font-hind text-[12.5px] leading-snug mt-2" style={{ color: "#0a2236cc" }}><b>Why:</b> {g.reason}</p>
                                <p className="font-hind text-[12.5px] leading-snug mt-2" style={{ color: "#0a2236cc" }}><b>Do:</b> {g.recommendation}</p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {g.search_keywords.map((k) => (
                                        <span key={k} className="font-montserrat font-bold text-[10px] px-2.5 py-1 rounded-full" style={{ background: `${compColor(g.area)}18`, color: compColor(g.area) }}>#{k}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* roadmap with linkedin courses */}
            {roadmapTracks.length > 0 && (
                <Section id="roadmap" kicker="Action roadmap" title="A path out of each gap — with courses to take">
                    <div className="space-y-8">
                        {roadmapTracks.map((track) => (
                            <div key={track.competency} className="keep rounded-2xl border p-6" style={{ borderColor: "#0a223614", background: "#fff" }}>
                                <h3 className="font-figtree font-black text-[17px]" style={{ color: compColor(track.competency) }}>{track.competency}</h3>
                                <div className="flex items-stretch gap-2 mt-4 overflow-x-auto pb-1">
                                    {track.nodes.map((n, i) => (
                                        <div key={n.id} className="flex items-stretch gap-2 shrink-0">
                                            <div className="rounded-xl p-3.5 w-[200px]" style={{ background: i === 0 ? `${compColor(track.competency)}12` : "#0a223606", border: `1px solid ${i === 0 ? compColor(track.competency) + "44" : "#0a223614"}` }}>
                                                <div className="font-montserrat font-black uppercase tracking-[0.14em] text-[9px]" style={{ color: i === 0 ? compColor(track.competency) : "#0a223688" }}>
                                                    {i === 0 ? "Gap" : n.label}
                                                </div>
                                                <div className="font-hind text-[11.5px] leading-snug mt-1.5" style={{ color: "#0a2236bb" }}>{n.detail.length > 120 ? n.detail.slice(0, 118) + "…" : n.detail}</div>
                                            </div>
                                            {i < track.nodes.length - 1 && <div className="self-center font-figtree font-black text-lg" style={{ color: "#0a223644" }}>→</div>}
                                        </div>
                                    ))}
                                </div>
                                {track.courses.length > 0 && (
                                    <>
                                        <p className="font-montserrat font-black uppercase tracking-[0.18em] text-[10px] mt-6 mb-3" style={{ color: "#0a223699" }}>Recommended courses</p>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {track.courses.map((rec) => {
                                                const kw = rec.title.replace(/^.*?:\s*/, "").replace(/^Deepen with /, "").replace(/^"|"$/g, "");
                                                return <CourseCard key={rec.url} title={kw} keyword={kw} url={rec.url} competency={track.competency} reason={rec.reason} />;
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* curriculum learning map */}
            {d.learningMap?.idealSkills?.length > 0 && (
                <Section id="learning" kicker="Curriculum learning map" title={d.learningMap.summary}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {d.learningMap.idealSkills.map((s, i) => (
                            <div key={i} className="course-card rounded-xl border p-4" style={{ borderColor: "#0a223614", background: "#fff" }}>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#0a223608", color: "#0a223688" }}>{s.courseCode}</span>
                                    <span className="font-montserrat font-black uppercase text-[9px] tracking-[0.12em] px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#9f1239" }}>{s.status}</span>
                                </div>
                                <h3 className="font-figtree font-black text-[13.5px] mt-2 leading-tight" style={{ color: INK }}>{s.name}</h3>
                                <p className="font-hind text-[11.5px] mt-1" style={{ color: "#0a223699" }}>{s.courseTitle}</p>
                                <p className="font-hind text-[11px] mt-1" style={{ color: "#0a223688" }}>{s.year} · {s.trimester} · target {s.targetRating}</p>
                                <div className="flex gap-2 mt-3">
                                    <a href={safeUrl(s.coursewareUrl)} target="_blank" rel="noopener noreferrer" className="font-montserrat font-bold text-[10px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg" style={{ background: "#08a0e914", color: BLUE }}>Courseware →</a>
                                    <a href={safeUrl(s.linkedinLearningUrl)} target="_blank" rel="noopener noreferrer" className="font-montserrat font-bold text-[10px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg" style={{ background: "#0a66c214", color: "#0a66c2" }}>LinkedIn →</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* narrative */}
            {d.narrative && (
                <Section id="narrative" kicker="Full assessment" title="The complete narrative">
                    <div className="max-w-3xl"><Narrative md={d.narrative} /></div>
                </Section>
            )}

            {/* references */}
            {d.references.length > 0 && (
                <Section id="references" kicker="Grounding" title="References">
                    <ul className="space-y-2">
                        {d.references.map((r) => (
                            <li key={r.id} className="font-hind text-[12.5px] leading-snug flex gap-2" style={{ color: "#0a2236bb" }}>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 h-fit" style={{ background: "#0a223608", color: "#0a223688" }}>{r.id}</span>
                                {/^https?:\/\//i.test(r.url) ? <a href={safeUrl(r.url)} target="_blank" rel="noopener noreferrer" style={{ color: INK }}>{r.title}</a> : <span>{r.title}</span>}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <footer className="mx-auto w-full max-w-5xl px-7 py-10 border-t mt-4" style={{ borderColor: "#0a223614" }}>
                <p className="font-montserrat font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: "#0a223688" }}>Briefcase · generated {d.run.id} · {d.student.id}</p>
            </footer>
        </main>
    );
}
