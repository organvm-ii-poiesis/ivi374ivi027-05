"use client";

import { useEffect, useCallback, useRef } from "react";
import { globalSynth } from "@/lib/audio/synth";
import styleDna from "@/data/style-dna.json";

export function useGlitchSynth() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const init = useCallback(() => {
    globalSynth?.init();
  }, []);

  const trigger = useCallback((intensity?: number) => {
    globalSynth?.triggerGlitch(intensity);
  }, []);

  useEffect(() => {
    // Generative background glitches based on Style DNA fragmentation score
    const startGenerativeLayer = () => {
      const interval = Math.random() * (20000 / styleDna.fragmentationScore) + 500;
      
      timerRef.current = setTimeout(() => {
        if (Math.random() > 0.7) {
          globalSynth?.triggerGlitch(Math.random() * 30);
        }
        startGenerativeLayer();
      }, interval);
    };

    startGenerativeLayer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { init, trigger, setMode: (theme: string) => globalSynth?.setMode(theme) };
}
