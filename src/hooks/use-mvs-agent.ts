"use client";

import { useEffect, useState, useRef } from "react";
import { globalSynth } from "@/lib/audio/synth";

type MVSMood = "Observant" | "Glitchy" | "Bored" | "Helpful";

/**
 * Autonomous background agent representing @MVS.
 * Monitors user activity and reacts to provide presence.
 */
export function useMVSAgent() {
  const [mood, setMood] = useState<MVSMood>("Observant");
  const lastActivity = useRef<number>(0);

  useEffect(() => {
    lastActivity.current = Date.now();

    const handleActivity = () => {
      lastActivity.current = Date.now();
      if (mood === "Bored") {
        setMood("Observant");
        globalSynth?.triggerGlitch(20);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    const checkIdle = setInterval(() => {
      const diff = Date.now() - lastActivity.current;
      
      if (diff > 30000 && mood !== "Bored") {
        setMood("Bored");
        // Trigger a subtle presence shift
        globalSynth?.setMode("mineral"); 
      }
    }, 5000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(checkIdle);
    };
  }, [mood]);

  return { mood };
}
