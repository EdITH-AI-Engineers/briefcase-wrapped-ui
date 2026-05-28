"use client"

import { WrappedAchievments } from "@/components/achievments/achievements";
import { SectionControl, type SectionName } from "@/components/settings/section-control";
import { WrappedIntro } from "@/components/intro/intro";
import { BriefcaseLoader } from "@/components/intro/loader";
import gsap from "gsap";
import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WrappedCompetencies } from "@/components/competencies/competencies";
import { WrappedSkills } from "@/components/skills/skills";
import { WrappedActionPlan } from "@/components/action-plan/action-plan";
import { WrappedSummary } from "@/components/summary/summary";

const sections: SectionName[] = [
  "intro",
  "achievements",
  "competencies",
  "skills",
  "actionPlan",
  "summary",
  "end",
];

const user = {
  name: "John Doe",
};

type SectionPanelProps = {
  section: SectionName;
  user: typeof user;
  onComplete?: () => void;
  active?: boolean;
};

const sectionPanels: Partial<Record<SectionName, ComponentType<SectionPanelProps>>> = {
  intro: ({ user, onComplete, active }) => <WrappedIntro user={user} onComplete={onComplete} active={active} />,
  achievements: ({ user, onComplete, active }) => <WrappedAchievments user={user} onComplete={onComplete} active={active} />,
  competencies: ({ user, onComplete, active }) => <WrappedCompetencies user={user} onComplete={onComplete} active={active} />,
  skills: ({ user, onComplete, active }) => <WrappedSkills user={user} onComplete={onComplete} active={active} />,
  actionPlan: ({ user, onComplete, active }) => <WrappedActionPlan user={user} onComplete={onComplete} active={active} />,
  summary: ({ user, onComplete, active }) => <WrappedSummary user={user} onComplete={onComplete} active={active} />,
};

type LayerEntry = { key: number; section: SectionName };
type PendingAnim = { key: number; direction: 1 | -1 } | null;

export default function Home() {
  const [layers, setLayers] = useState<LayerEntry[]>([{ key: 0, section: "intro" }]);
  const [selectedSection, setSelectedSection] = useState<SectionName>("intro");
  const [activeKey, setActiveKey] = useState<number>(-1);
  const [loaderDone, setLoaderDone] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
    setActiveKey(0);
  }, []);

  const selectedSectionRef = useRef<SectionName>("intro");

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06131d]">
      <div className="absolute inset-0">
        {layers.map((layer) => {
          const Panel = sectionPanels[layer.section] ?? TempSectionPanel;
          return (
            <div
              key={layer.key}
              ref={(el) => {
                if (el) layerRefs.current.set(layer.key, el);
                else layerRefs.current.delete(layer.key);
              }}
              className="absolute inset-0"
            >
              <Panel
                section={layer.section}
                user={user}
                onComplete={goToNextSection}
                active={layer.key === activeKey}
              />
            </div>
          );
        })}
      </div>

      <SectionControl
        sections={sections}
        selectedSection={selectedSection}
        onSelectSection={goToSection}
      />

      {!loaderDone && <BriefcaseLoader onComplete={handleLoaderComplete} />}
    </main>
  );
}

function TempSectionPanel({ section }: SectionPanelProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(8,160,233,0.12),_transparent_40%),linear-gradient(135deg,_#06131d,_#0d1f2c_45%,_#081018)] px-6 text-white">
      <div className="max-w-xl rounded-2xl border border-white/6 bg-white/3 p-8 sm:p-10">
        <p className="font-montserrat text-xs uppercase tracking-wider text-white/50">
          {section}
        </p>
        <h1 className="mt-4 font-figtree text-4xl font-semibold sm:text-5xl">
          {section}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-white/70 sm:text-lg">
          This panel is ready to be replaced with the real section content.
          Use the arrows below to switch between sections.
        </p>
      </div>
    </section>
  );
}