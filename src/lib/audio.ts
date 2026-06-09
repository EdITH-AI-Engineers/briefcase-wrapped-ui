"use client";

import gsap from "gsap";

// ── Music ─────────────────────────────────────────────────────────────────────
// One <audio> element, ever. Tracks never overlap: switching fades the current
// out, then loads + fades in the next. SFX (below) layer on their own elements.
const TRACKS: Record<string, string> = {
    intro: "/f-intro.m4a",
    achievements: "/f-achievements.m4a",
    competencies: "/f-competency.m4a",
    skills: "/f-skills.m4a",
    actionPlan: "/f-roadmap.m4a",
    summary: "/f-overview-1.m4a", // overview part 1 (until "lights off")
    end: "/f-outro.m4a",
};

const VOLUME = 0.5;

let el: HTMLAudioElement | null = null;
let currentSrc = "";
let switchToken = 0;

// ── Autoplay unlock ─────────────────────────────────────────────────────────
// Autoplay is blocked until the user interacts. Any rejected play() registers a
// resume that runs on the first pointer/key event.
let gestureArmed = false;
let pendingResumes: Array<() => void> = [];

function armGestureUnlock() {
    if (gestureArmed || typeof document === "undefined") return;
    gestureArmed = true;
    const unlock = () => {
        gestureArmed = false;
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
        const rs = pendingResumes;
        pendingResumes = [];
        rs.forEach((fn) => {
            try {
                fn();
            } catch {
                /* ignore */
            }
        });
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
}

function tryPlay(a: HTMLAudioElement, resume?: () => void) {
    const p = a.play();
    if (p && typeof p.catch === "function") {
        p.catch(() => {
            if (resume) pendingResumes.push(resume);
            armGestureUnlock();
        });
    }
}

function getEl(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!el) {
        el = new Audio();
        el.loop = false; // tracks are timed to their sections — play once, don't repeat
        el.preload = "auto";
        el.volume = 0;
        el.setAttribute("data-wrapped-audio", "");
        document.body.appendChild(el); // keep it in the tree for a stable lifecycle
    }
    return el;
}

/** Play a specific track. Fades the current one out first, so nothing overlaps. */
export function playTrack(src: string, { fadeOutMs = 500, fadeInMs = 650 } = {}) {
    const a = getEl();
    if (!a) return;

    if (currentSrc === src) {
        gsap.killTweensOf(a);
        if (a.paused) tryPlay(a, () => a.play().catch(() => {}));
        gsap.to(a, { volume: VOLUME, duration: 0.3 });
        return;
    }

    currentSrc = src;
    const token = ++switchToken;
    gsap.killTweensOf(a);

    const swap = () => {
        if (token !== switchToken) return; // a newer request superseded this one
        a.src = src;
        a.currentTime = 0;
        a.volume = 0;
        tryPlay(a, () => {
            a.play()
                .then(() => gsap.to(a, { volume: VOLUME, duration: 0.4 }))
                .catch(() => {});
        });
        gsap.to(a, { volume: VOLUME, duration: fadeInMs / 1000, ease: "power1.out" });
    };

    if (!a.paused && a.currentSrc) {
        gsap.to(a, { volume: 0, duration: fadeOutMs / 1000, ease: "power1.in", onComplete: swap });
    } else {
        swap();
    }
}

/** Play the track mapped to a section name (no-op if the section has none). */
export function playSection(section: string) {
    const src = TRACKS[section];
    if (src) playTrack(src);
}

/**
 * Call from inside a user gesture (the "tap to begin" gate) to unlock audio for
 * the whole session. Primes the music element + every SFX (muted play→pause) so
 * later programmatic play() calls are allowed everywhere — including Safari/iOS.
 */
export function unlockAudio() {
    const a = getEl();
    if (a && !a.src) a.src = TRACKS.intro; // give the music element a source to prime
    const targets: Array<HTMLAudioElement | null> = [
        a,
        getSfx("/sfx-ambient.m4a"),
        getSfx("/sfx-spinning.m4a"),
        getSfx("/sfx-switch.m4a"),
    ];
    targets.forEach((m) => {
        if (!m) return;
        // Bless the element within the gesture, then pause *synchronously* — a late
        // .then(pause) would race with (and silence) real playback on the same element.
        m.muted = true;
        try {
            const p = m.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {
            /* ignore */
        }
        m.pause();
        try {
            m.currentTime = 0;
        } catch {
            /* not seekable yet */
        }
        m.muted = false;
    });
}

/** Fade the current track out and pause it (used for the summary's "lights off"). */
export function fadeOutCurrent({ fadeMs = 900 } = {}) {
    const a = getEl();
    if (!a) return;
    const token = ++switchToken; // cancel any pending swap
    gsap.killTweensOf(a);
    gsap.to(a, {
        volume: 0,
        duration: fadeMs / 1000,
        ease: "power1.in",
        onComplete: () => {
            if (token === switchToken) a.pause();
        },
    });
    currentSrc = "";
}

// ── SFX ───────────────────────────────────────────────────────────────────────
// Each effect gets its own reused <audio>. They play over the music. One-shots
// (a switch click) just fire; loops (ambient, spinning) are tracked so they can
// resume after a gesture unlock and be stopped on cue.
const sfxEls: Record<string, HTMLAudioElement> = {};
const activeSfx = new Set<string>();

function getSfx(src: string): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!sfxEls[src]) {
        const s = new Audio(src);
        s.preload = "auto";
        s.setAttribute("data-wrapped-sfx", src);
        document.body.appendChild(s);
        sfxEls[src] = s;
    }
    return sfxEls[src];
}

export function playSfx(src: string, { volume = 0.6, loop = false, fadeInMs = 0 } = {}) {
    const s = getSfx(src);
    if (!s) return;
    s.loop = loop;
    if (loop) activeSfx.add(src);
    gsap.killTweensOf(s);
    try {
        s.currentTime = 0;
    } catch {
        /* not yet seekable */
    }
    const resume = loop ? () => activeSfx.has(src) && s.play().catch(() => {}) : undefined;
    if (fadeInMs > 0) {
        s.volume = 0;
        tryPlay(s, resume);
        gsap.to(s, { volume, duration: fadeInMs / 1000, ease: "power1.out" });
    } else {
        s.volume = volume;
        tryPlay(s, resume);
    }
}

export function stopSfx(src: string, { fadeMs = 500 } = {}) {
    activeSfx.delete(src);
    const s = sfxEls[src];
    if (!s) return;
    gsap.killTweensOf(s);
    if (fadeMs <= 0) {
        s.pause();
        return;
    }
    gsap.to(s, { volume: 0, duration: fadeMs / 1000, ease: "power1.in", onComplete: () => s.pause() });
}
