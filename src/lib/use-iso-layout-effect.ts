"use client";

import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on the client so GSAP can hide animated elements *before* the
// first paint (prevents the "all containers flash for a frame" on scene mount /
// slide-in); useEffect on the server to avoid the SSR warning.
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
