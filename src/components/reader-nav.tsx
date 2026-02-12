"use client";

import type { CanonicalSection } from "@/types/content";
import { trackEvent } from "@/lib/analytics";

type Props = {
  docSlug: string;
  sections: CanonicalSection[];
};

export function ReaderNav({ docSlug, sections }: Props) {
  return (
    <nav aria-label="Section index" className="reader-nav">
      <h2>Sections</h2>
      <ol>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.anchor}`}
              onClick={() => {
                void trackEvent({
                  eventName: "section_opened",
                  mode: "reader",
                  docSlug,
                  sectionId: section.anchor,
                });
              }}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
