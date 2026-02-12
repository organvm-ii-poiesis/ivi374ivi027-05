"use client";

import { useEffect, useRef } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  docSlug: string;
};

export function ReaderProgress({ docSlug }: Props) {
  const reportedMilestones = useRef(new Set<number>());

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollHeight <= 0 ? 1 : scrollTop / scrollHeight;
      const percent = Math.max(0, Math.min(100, Math.round(ratio * 100)));
      const milestone = Math.floor(percent / 10) * 10;

      if (!reportedMilestones.current.has(milestone)) {
        reportedMilestones.current.add(milestone);
        void trackEvent({
          eventName: "doc_progress",
          mode: "reader",
          docSlug,
          value: milestone,
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [docSlug]);

  return null;
}
