"use client";

import { WrappedAchievments } from "@/components/achievments/achievements";
import { SectionControl, type SectionName } from "@/components/settings/section-control";
import { WrappedIntro } from "@/components/intro/intro";
import { BriefcaseLoader } from "@/components/intro/loader";
import { StartGate } from "@/components/intro/start-gate";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { WrappedCompetencies } from "@/components/competencies/competencies";
import { WrappedSkills } from "@/components/skills/skills";
import { WrappedActionPlan } from "@/components/action-plan/action-plan";
import { WrappedSummary } from "@/components/summary/summary";
import { WrappedOutro } from "@/components/outro/outro";
import { playSection, fadeOutCurrent } from "@/lib/audio";
import type { CompetenciesData, SkillsData, ActionPlanData, AchievementsData, ArchetypeData } from "@/lib/scene-data";

const sections: SectionName[] = ["intro", "achievements", "competencies", "skills", "actionPlan", "summary", "end"];

// The full career-readiness report lives in a separate app. When the outro ends,
// hand off to it. Override per-environment with NEXT_PUBLIC_REPORT_URL.
const REPORT_URL = process.env.NEXT_PUBLIC_REPORT_URL ?? "http://localhost:3001";

export type SceneData = {
    competencies: CompetenciesData;
    skills: SkillsData;
    actionPlan: ActionPlanData;
    achievements: AchievementsData;
    archetype: ArchetypeData;
};

type LayerEntry = { key: number; section: SectionName };
type PendingAnim = { key: number; direction: 1 | -1 } | null;

export function WrappedExperience({ userName, sceneData }: { userName: string; sceneData: SceneData }) {
    const user = { name: userName };

    const [layers, setLayers] = useState<LayerEntry[]>([{ key: 0, section: "intro" }]);
    const [selectedSection, setSelectedSection] = useState<SectionName>("intro");
    const [activeKey, setActiveKey] = useState<number>(-1);
    const [loaderDone, setLoaderDone] = useState(false);
    const [started, setStarted] = useState(false);
    const [gateOpen, setGateOpen] = useState(true);
    const [leaving, setLeaving] = useState(false);

    const selectedSectionRef = useRef<SectionName>("intro");

    const handleLoaderComplete = useCallback(() => {
        setLoaderDone(true);
        setActiveKey(0);
    }, []);

    useEffect(() => {
        if (!loaderDone) return;
        playSection(selectedSection);
    }, [selectedSection, loaderDone]);

    const keyCounterRef = useRef(1);
    const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const isSliding = useRef(false);
    const pendingAnim = useRef<PendingAnim>(null);

    const goToSection = useCallback((newSection: SectionName, bypassGuard = false) => {
        if (isSliding.current && !bypassGuard) return;
        const current = selectedSectionRef.current;
        if (newSection === current) return;
        const currentIndex = sections.indexOf(current);
        const nextIndex = sections.indexOf(newSection);
        const direction: 1 | -1 = nextIndex >= currentIndex ? 1 : -1;
        const key = keyCounterRef.current++;
        pendingAnim.current = { key, direction };
        selectedSectionRef.current = newSection;
        setLayers((prev) => [...prev, { key, section: newSection }]);
        setSelectedSection(newSection);
    }, []);

    const goToNextSection = useCallback(() => {
        const current = selectedSectionRef.current;
        const currentIndex = sections.indexOf(current);
        const next = sections[currentIndex + 1];
        if (next) goToSection(next, true);
    }, [goToSection]);

    // The outro fires onComplete after the briefcase collapses. The report is no
    // longer embedded here — fade the story out and hand off to the dashboard at "/".
    const finish = useCallback(() => {
        setLeaving(true);
        fadeOutCurrent({ fadeMs: 1100 });
        window.setTimeout(() => { window.location.href = REPORT_URL; }, 950);
    }, []);

    const handleComplete = useCallback(() => {
        if (selectedSectionRef.current === "end") finish();
        else goToNextSection();
    }, [goToNextSection, finish]);

    useEffect(() => {
        const pending = pendingAnim.current;
        if (!pending) return;
        const el = layerRefs.current.get(pending.key);
        if (!el) return;
        pendingAnim.current = null;
        isSliding.current = true;
        const startX = pending.direction > 0 ? "100%" : "-100%";
        const slidKey = pending.key;
        gsap.fromTo(
            el,
            { x: startX },
            {
                x: 0,
                duration: 0.65,
                ease: "power3.inOut",
                onComplete: () => {
                    isSliding.current = false;
                    setActiveKey(slidKey);
                    setLayers((prev) => (prev.length > 1 ? [prev[prev.length - 1]] : prev));
                },
            },
        );
    }, [layers]);

    // Each scene gets its slice of the server-fetched dashboard (see lib/scene-data).
    const renderPanel = (section: SectionName, active: boolean) => {
        const common = { user, onComplete: handleComplete, active };
        switch (section) {
            case "intro":
                return <WrappedIntro {...common} />;
            case "achievements":
                return <WrappedAchievments {...common} data={sceneData.achievements} />;
            case "competencies":
                return <WrappedCompetencies {...common} data={sceneData.competencies} />;
            case "skills":
                return <WrappedSkills {...common} data={sceneData.skills} />;
            case "actionPlan":
                return <WrappedActionPlan {...common} data={sceneData.actionPlan} />;
            case "summary":
                return <WrappedSummary {...common} archetype={sceneData.archetype} />;
            case "end":
                return <WrappedOutro {...common} />;
            default:
                return null;
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#06131d]">
            <div className="absolute inset-0">
                {layers.map((layer) => (
                    <div
                        key={layer.key}
                        ref={(el) => {
                            if (el) layerRefs.current.set(layer.key, el);
                            else layerRefs.current.delete(layer.key);
                        }}
                        className="absolute inset-0"
                    >
                        {renderPanel(layer.section, layer.key === activeKey)}
                    </div>
                ))}
            </div>

            <SectionControl sections={sections} selectedSection={selectedSection} onSelectSection={goToSection} />

            {started && !loaderDone && <BriefcaseLoader onComplete={handleLoaderComplete} />}

            {gateOpen && <StartGate onStart={() => setStarted(true)} onClose={() => setGateOpen(false)} />}

            {/* Hand-off fade to the dashboard */}
            <div className="pointer-events-none fixed inset-0 z-[300] bg-[#06131d] transition-opacity duration-[900ms]" style={{ opacity: leaving ? 1 : 0 }} />
        </main>
    );
}
