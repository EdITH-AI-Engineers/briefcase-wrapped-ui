"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export type SectionName =
    | "intro"
    | "achievements"
    | "competencies"
    | "skills"
    | "actionPlan"
    | "summary"
    | "end";

type SectionControlProps = {
    sections: SectionName[];
    selectedSection: SectionName;
    onSelectSection: (section: SectionName) => void;
};

function formatSectionLabel(section: SectionName) {
    return section
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function SectionControl({
    sections,
    selectedSection,
    onSelectSection,
}: SectionControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeRectRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useGSAP(
        () => {
            const activeIndex = sections.indexOf(selectedSection);
            const activeButton = activeRectRefs.current[activeIndex];

            if (!activeButton) {
                return;
            }

            gsap.fromTo(
                activeButton,
                { scale: 0.96, opacity: 0.9 },
                { scale: 1, opacity: 1, duration: 0.28, ease: "power3.out" },
            );
        },
        { scope: containerRef, dependencies: [sections, selectedSection] },
    );

    const activeIndex = sections.indexOf(selectedSection);

    function goToIndex(nextIndex: number) {
        const nextSection = sections[nextIndex];

        if (!nextSection) {
            return;
        }

        onSelectSection(nextSection);
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-20">
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
                <div
                    ref={containerRef}
                    className="pointer-events-auto flex items-center gap-3 rounded-md bg-black/30 px-2 py-1 backdrop-blur-sm"
                    style={{ boxShadow: '0 6px 20px rgba(2,6,23,0.35)' }}
                >
                    <button
                        type="button"
                        onClick={() => goToIndex(activeIndex - 1)}
                        disabled={activeIndex <= 0}
                        aria-label="Previous section"
                        className="grid h-9 w-9 place-items-center rounded-md text-white transition-colors duration-180 hover:bg-white/6 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 px-1">
                        {sections.map((section, index) => {
                            const isActive = selectedSection === section;
                            return (
                                <button
                                    key={section}
                                    ref={(element) => {
                                        activeRectRefs.current[index] = element;
                                    }}
                                    type="button"
                                    onClick={() => onSelectSection(section)}
                                    aria-label={`Go to ${section} section`}
                                    aria-pressed={isActive}
                                    className={`h-2 rounded-full transition-all duration-200 ${isActive ? 'w-6 bg-white border border-white/80' : 'w-3 bg-white/20 hover:bg-white/30 border border-white/10'}`}
                                />
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => goToIndex(activeIndex + 1)}
                        disabled={activeIndex >= sections.length - 1}
                        aria-label="Next section"
                        className="grid h-9 w-9 place-items-center rounded-md text-white transition-colors duration-180 hover:bg-white/6 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
