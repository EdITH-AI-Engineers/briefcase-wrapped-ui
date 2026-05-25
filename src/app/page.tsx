"use client"

import { WrappedAchievments } from "@/components/achievments/achievements";
import { SectionControl, type SectionName } from "@/components/glob/section-control";
import { WrappedIntro } from "@/components/intro/intro";
import type { ComponentType } from "react";
import { useState } from "react";

const sections: SectionName[] = [
  "intro",
  "achievements",
  "overview",
  "competencies",
  "skills",
  "action plan",
  "summary",
  "end",
];

const user = {
  name: "John Doe",
}

type SectionPanelProps = {
  section: SectionName;
  user: typeof user;
  onComplete?: () => void;
};

const sectionPanels: Partial<Record<SectionName, ComponentType<SectionPanelProps>>> = {
  intro: ({ user, onComplete }) => <WrappedIntro user={user} onComplete={onComplete} />,
  achievements: ({ user, onComplete }) => <WrappedAchievments user={user} onComplete={onComplete} />,
};

export default function Home() {
  const [selectedSection, setSelectedSection] = useState<SectionName>("intro");

  function goToNextSection() {
    const currentIndex = sections.indexOf(selectedSection);
    const nextSection = sections[currentIndex + 1] ?? sections[currentIndex];

    setSelectedSection(nextSection);
  }

  const SelectedPanel = sectionPanels[selectedSection] ?? TempSectionPanel;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06131d]">
      <div className="absolute inset-0">
        <SelectedPanel section={selectedSection} user={user} onComplete={goToNextSection} />
      </div>

      <SectionControl
        sections={sections}
        selectedSection={selectedSection}
        onSelectSection={setSelectedSection}
      />
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
          {section === "action plan" ? "Action plan" : section}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-white/70 sm:text-lg">
          This panel is ready to be replaced with the real section content.
          Use the arrows below to switch between sections.
        </p>
      </div>
    </section>
  );
}
