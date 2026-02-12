"use client";

import { useEffect } from "react";

type Props = {
  keyName: string;
};

export function ScrollMemory({ keyName }: Props) {
  useEffect(() => {
    const storageKey = `met4-scroll:${keyName}`;
    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== "function") {
      return;
    }
    const savedPosition = storage.getItem(storageKey);

    if (savedPosition) {
      const parsed = Number(savedPosition);
      if (!Number.isNaN(parsed)) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: parsed, behavior: "instant" as ScrollBehavior });
        });
      }
    }

    const savePosition = () => {
      if (typeof storage.setItem === "function") {
        storage.setItem(storageKey, String(window.scrollY));
      }
    };

    window.addEventListener("scroll", savePosition, { passive: true });
    window.addEventListener("beforeunload", savePosition);

    return () => {
      savePosition();
      window.removeEventListener("scroll", savePosition);
      window.removeEventListener("beforeunload", savePosition);
    };
  }, [keyName]);

  return null;
}
