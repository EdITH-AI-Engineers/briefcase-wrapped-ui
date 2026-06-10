import type { Dashboard } from "@/lib/get-dashboard";

// ── derived scene data ───────────────────────────────────────────────────────
// Pure functions that turn the (server-fetched) dashboard into the exact shapes
// each Wrapped scene needs — so the mock JSON files can be deleted entirely.

export type CompetenciesData = {
    framework: string;
    program: string;
    year: string;
    overall: number;
    tiers: { min: number; label: string; color: string }[];
    domains: { id: string; label: string; short: string; icon: string; level: number; blurb: string; po: string }[];
};
export type SkillsData = {
    building: string;
    year: string;
    program: string;
    mastery: { name: string; icon: string; level: number; note: string }[];
    gaps: { name: string; icon: string; level: number; note: string }[];
};
export type ActionPlanData = {
    student: string;
    program: string;
    title: string;
    subtitle: string;
    stops: { area: string; icon: string; reason: string; recommendation: string; course: string; weeks: number; tag: string }[];
};
export type AchievementsData = {
    achievements: { id: string; title: string; description: string; year: string; icon: string; color: string }[];
};
export type ArchetypeData = { overall: number; tiers: { min: number; label: string; color: string }[] };

const TIERS = [
    { min: 85, label: "Advanced", color: "#f4a261" },
    { min: 70, label: "Proficient", color: "#f4ead2" },
    { min: 55, label: "Developing", color: "#ffffff" },
    { min: 0, label: "Emerging", color: "#cfe8f6" },
];

const compIcon = (name: string) => {
    const n = name.toLowerCase();
    if (/comput|program|foundation/.test(n)) return "💻";
    if (/system|infra/.test(n)) return "🖧";
    if (/data|information/.test(n)) return "🗄️";
    if (/secur|ethic|responsib/.test(n)) return "🔐";
    if (/communic/.test(n)) return "🗣️";
    if (/collab|team/.test(n)) return "🤝";
    if (/learn|innovat/.test(n)) return "🚀";
    if (/network/.test(n)) return "🌐";
    return "🧠";
};

const skillIcon = (name: string) => {
    const n = name.toLowerCase();
    const map: Record<string, string> = { javascript: "🟨", typescript: "🔷", python: "🐍", react: "⚛️", "node.js": "🟢", node: "🟢", sql: "🗃️", git: "🔧", docker: "🐳", java: "☕", "c++": "🔧", go: "🐹", rust: "🦀", agile: "🔁", kubernetes: "☸️", aws: "☁️", azure: "☁️" };
    for (const k in map) if (n.includes(k)) return map[k];
    if (/cloud|devops/.test(n)) return "☁️";
    if (/design|ui|ux/.test(n)) return "🎨";
    if (/writ|doc/.test(n)) return "✍️";
    if (/speak|present/.test(n)) return "🎤";
    return "🛠️";
};

const shortLabel = (name: string) => name.replace(/ & /g, " & ").split(" ").slice(0, 2).join(" ");
const masteryNote = (lvl: number) => (lvl >= 90 ? "Top floor — penthouse view." : lvl >= 80 ? "Solid, dependable craft." : "A strong, growing floor.");
const gapNote = (lvl: number) => (lvl < 45 ? "The ground floor to build up." : lvl < 60 ? "Rooms left to furnish." : "Almost move-in ready.");

export function toCompetencies(d: Dashboard): CompetenciesData {
    return {
        framework: d.run.frameworkVersion,
        program: d.student.program,
        year: String(d.student.yearLevel),
        overall: d.overview.overallScore,
        tiers: TIERS,
        domains: d.competencies.map((c, i) => ({
            id: `comp-${i}`,
            label: c.name,
            short: shortLabel(c.name),
            icon: compIcon(c.name),
            level: c.score,
            blurb: c.diagnosis,
            po: c.citations?.[0]?.clause ?? "",
        })),
    };
}

export function toArchetype(d: Dashboard): ArchetypeData {
    return { overall: d.overview.overallScore, tiers: TIERS };
}

export function toSkills(d: Dashboard): SkillsData {
    const all = [...d.skills.hard, ...d.skills.soft, ...d.skills.uncategorized];
    const sorted = [...all].sort((a, b) => b.rating - a.rating);
    let mastery = sorted.filter((s) => s.rating >= 70);
    let gaps = sorted.filter((s) => s.rating < 70);
    // guarantee both sides have something to render
    if (mastery.length === 0) mastery = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
    if (gaps.length === 0) gaps = sorted.slice(-Math.max(1, Math.floor(sorted.length / 2)));
    return {
        building: "Skill Tower",
        year: String(d.student.yearLevel),
        program: d.student.program,
        mastery: mastery.slice(0, 5).map((s) => ({ name: s.name, icon: skillIcon(s.name), level: s.rating, note: masteryNote(s.rating) })),
        gaps: gaps.slice(0, 5).map((s) => ({ name: s.name, icon: skillIcon(s.name), level: s.rating, note: gapNote(s.rating) })),
    };
}

export function toActionPlan(d: Dashboard): ActionPlanData {
    const tags = ["First stop", "Next turn", "Scenic detour", "Quick win", "Final stop"];
    const recFor = (area: string) => d.recommendations.find((r) => r.relatedCompetency === area)?.title?.replace(/^.*?:\s*/, "") ?? `Level up ${area}`;
    // One stop per real gap/roadmap — no padding. The scene's route is dynamic to
    // however many the API returns. If there are no gaps, fall back to the two
    // lowest-scoring competencies so the road still has somewhere to go.
    let items = d.gaps.map((g) => ({ area: g.area, reason: g.reason, recommendation: g.recommendation }));
    if (items.length === 0) {
        items = [...d.competencies]
            .sort((a, b) => a.score - b.score)
            .slice(0, 2)
            .map((c) => ({ area: c.name, reason: c.diagnosis, recommendation: `Build concrete evidence and deepen ${c.name}.` }));
    }
    return {
        student: `${d.student.firstName} ${d.student.lastName}`,
        program: d.student.program,
        title: `Your route to ${Number(d.student.yearLevel) >= 4 ? "graduation" : "next year"}`,
        subtitle: `${items.length} stop${items.length === 1 ? "" : "s"}, one you — let's drive`,
        stops: items.map((s, i) => ({
            area: s.area,
            icon: compIcon(s.area),
            reason: s.reason,
            recommendation: s.recommendation,
            course: recFor(s.area),
            weeks: 3 + (i % 3),
            tag: tags[i] ?? `Stop ${i + 1}`,
        })),
    };
}

// The current school year runs Aug (Y-1) → Jul (Y); "and counting", so derive it
// from today: Aug onward belongs to the next-ending year.
export function schoolYearWindow(now = new Date()) {
    const endYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    return { start: new Date(endYear - 1, 7, 1), end: new Date(endYear, 6, 31, 23, 59, 59), label: `${endYear - 1}–${endYear}` };
}

function parseLooseDate(v: unknown): Date | null {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s || /present|current|ongoing/i.test(s)) return null;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
    const ym = s.match(/([A-Za-z]+)\s+(\d{4})/);
    if (ym) {
        const d2 = new Date(`${ym[1]} 1, ${ym[2]}`);
        if (!Number.isNaN(d2.getTime())) return d2;
    }
    const yo = s.match(/(\d{4})/);
    return yo ? new Date(Number(yo[1]), 0, 1) : null;
}

type EvItem = Record<string, unknown>;
const FAR_FUTURE = new Date(8640000000000000);
const EPOCH = new Date(0);

// Achievements = the student's evidence items that fall in (or are still active
// during) the current school year. Old one-off items drop off; ongoing roles stay.
export function toAchievements(d: Dashboard): AchievementsData {
    const colors = ["#08a0e9", "#f4a261", "#f4ead2", "#00c9ff", "#e07a3b", "#0a2236"];
    const win = schoolYearWindow();
    const ev = d.student.evidenceCounts as unknown as Record<string, EvItem[]>;
    const txt = (...vals: unknown[]) => (vals.find((v) => typeof v === "string" && v.trim()) as string | undefined)?.trim() ?? "";
    const CATS: { key: string; icon: string; ranged: boolean; title: (e: EvItem) => string; sub: (e: EvItem) => string }[] = [
        { key: "experience", icon: "💼", ranged: true, title: (e) => txt(e.title, e.position, e.role) || "Role", sub: (e) => txt(e.company, e.organization) },
        { key: "organizations", icon: "🎟️", ranged: true, title: (e) => txt(e.organization, e.name) || "Organization", sub: (e) => txt(e.role) || "Member" },
        { key: "awards", icon: "🏆", ranged: false, title: (e) => txt(e.title, e.name) || "Award", sub: (e) => txt(e.issuer, e.organization) },
        { key: "certifications", icon: "📜", ranged: false, title: (e) => txt(e.name, e.title) || "Certification", sub: (e) => txt(e.issuer, e.organization) },
        { key: "trainings", icon: "🎓", ranged: false, title: (e) => txt(e.title, e.name) || "Training", sub: (e) => txt(e.issuer, e.role) },
        { key: "projects", icon: "🛠️", ranged: true, title: (e) => txt(e.title, e.name) || "Project", sub: (e) => txt(e.role, e.tech) },
    ];

    const items: AchievementsData["achievements"] = [];
    for (const cat of CATS) {
        const list = Array.isArray(ev[cat.key]) ? ev[cat.key] : [];
        for (const e of list) {
            const isRanged = cat.ranged || e.start_date !== undefined || e.end_date !== undefined;
            let keep = false;
            let display = "";
            if (isRanged) {
                const start = parseLooseDate(e.start_date ?? e.date) ?? EPOCH;
                const ongoing = e.end_date === null || e.end_date === undefined;
                const end = ongoing ? FAR_FUTURE : parseLooseDate(e.end_date) ?? start;
                keep = start <= win.end && end >= win.start; // overlaps the school year
                display = ongoing ? `${txt(e.start_date)} – Present`.trim() : txt(e.start_date) ? `${txt(e.start_date)} – ${txt(e.end_date)}` : txt(e.date);
            } else {
                const dt = parseLooseDate(e.date ?? e.issue_date ?? e.year);
                keep = dt != null && dt >= win.start && dt <= win.end;
                display = txt(e.date, e.issue_date);
            }
            if (!keep) continue;
            const title = cat.title(e);
            if (items.find((x) => x.title === title)) continue;
            items.push({
                id: `ach-${items.length}`,
                title,
                description: [cat.sub(e), display].filter(Boolean).join(" · ") || "Logged this school year.",
                year: win.label,
                icon: cat.icon,
                color: colors[items.length % colors.length],
            });
        }
    }

    if (items.length === 0) {
        items.push({ id: "ach-0", title: "A fresh chapter", description: `No badges logged for ${win.label} yet — the year's still young.`, year: win.label, icon: "🌱", color: colors[0] });
    }
    return { achievements: items.slice(0, 8) };
}
