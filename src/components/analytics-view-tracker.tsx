"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  mode: "node-map" | "feed" | "scroll" | "reader" | "archive" | "about";
  docSlug?: string;
};

export function AnalyticsViewTracker({ mode, docSlug }: Props) {
  useEffect(() => {
    void trackEvent({
      eventName: "mode_viewed",
      mode,
      docSlug,
    });
  }, [mode, docSlug]);

  return null;
}
