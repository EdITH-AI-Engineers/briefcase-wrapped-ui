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
    const used = new Set(d.gaps.map((g) => g.area));
    const recFor = (area: string) => d.recommendations.find((r) => r.relatedCompetency === area)?.title?.replace(/^.*?:\s*/, "") ?? `Level up ${area}`;
    const fromGaps = d.gaps.map((g) => ({ area: g.area, reason: g.reason, recommendation: g.recommendation, course: recFor(g.area) }));
    const lowComps = [...d.competencies]
        .sort((a, b) => a.score - b.score)
        .filter((c) => !used.has(c.name))
        .map((c) => ({ area: c.name, reason: c.diagnosis, recommendation: `Build concrete evidence and deepen ${c.name}.`, course: recFor(c.name) }));
    const merged = [...fromGaps, ...lowComps].slice(0, 5);
    return {
        student: `${d.student.firstName} ${d.student.lastName}`,
        program: d.student.program,
        title: `Your route to ${Number(d.student.yearLevel) >= 4 ? "graduation" : "next year"}`,
        subtitle: `${merged.length} stops, one you — let's drive`,
        stops: merged.map((s, i) => ({
            area: s.area,
            icon: compIcon(s.area),
            reason: s.reason,
            recommendation: s.recommendation,
            course: s.course,
            weeks: 3 + (i % 3),
            tag: tags[i] ?? "Stop",
        })),
    };
}

export function toAchievements(d: Dashboard): AchievementsData {
    const colors = ["#08a0e9", "#f4a261", "#f4ead2", "#00c9ff", "#e07a3b", "#0a2236"];
    const year = String(d.student.yearLevel);
    const items: AchievementsData["achievements"] = [];
    const push = (title: string, description: string, icon: string) => {
        if (items.find((x) => x.title === title)) return;
        items.push({ id: `ach-${items.length}`, title, description, year, icon, color: colors[items.length % colors.length] });
    };
    d.strengths.forEach((s) => push(s.area, s.evidence[0] ?? "A standout strength this year.", compIcon(s.area)));
    d.competencies.filter((c) => c.level === "Advanced").forEach((c) => push(c.name, c.diagnosis, "🏆"));
    const ev = d.student.evidenceCounts as Record<string, number>;
    const evTotal = Object.values(ev).reduce((a, b) => a + b, 0);
    if (evTotal > 0) push("Receipts on file", `${evTotal} pieces of evidence backing the profile.`, "🧾");
    if (typeof ev.awards === "number" && ev.awards > 0) push("Award-winner", `${ev.awards} award${ev.awards > 1 ? "s" : ""} earned.`, "🥇");
    // always have at least a couple
    if (items.length === 0) push("Showed up all year", "Consistency is the quiet superpower.", "🔥");
    return { achievements: items.slice(0, 8) };
}
