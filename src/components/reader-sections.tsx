"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import type { CanonicalSection, CommentaryEntry } from "@/types/content";

type Props = {
  docSlug: string;
  sections: CanonicalSection[];
  commentary?: CommentaryEntry[];
};

const virtualizationThreshold = 60;
const eagerlyRenderedCount = 24;

function preview(body: string, length = 280): string {
  const compact = body.replace(/\s+/g, " ").trim();
  if (compact.length <= length) {
    return compact;
  }
  return `${compact.slice(0, length)}...`;
}

export function ReaderSections({ docSlug, sections, commentary = [] }: Props) {
  const isLargeDoc = sections.length > virtualizationThreshold;

  const commentaryByAnchor = useMemo(() => {
    const map = new Map<string, CommentaryEntry[]>();
    commentary.forEach(c => {
      const list = map.get(c.sectionAnchor) || [];
      list.push(c);
      map.set(c.sectionAnchor, list);
    });
    return map;
  }, [commentary]);

  const initialExpanded = useMemo(() => {
    if (!isLargeDoc) {
      return new Set(sections.map((section) => section.id));
    }
    return new Set(sections.slice(0, eagerlyRenderedCount).map((section) => section.id));
  }, [isLargeDoc, sections]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(initialExpanded);
  const [showScholarly, setShowScholarly] = useState(false);

  return (
    <div className="reader-wrapper">
      <div className="reader-controls">
        <button 
          className={`toggle-btn ${showScholarly ? "active" : ""}`}
          onClick={() => setShowScholarly(!showScholarly)}
        >
          {showScholarly ? "Hide Commentary" : "Scholarly Mode"}
        </button>
      </div>

      <article className={`reader-content ${showScholarly ? "scholarly-mode" : ""}`}>
        {sections.map((section, index) => {
          const expanded = expandedSections.has(section.id);
          const sectionComments = commentaryByAnchor.get(section.anchor);

          return (
            <div key={section.id} className="reader-row">
              <section className="reader-section" id={section.anchor}>
                <h2>{section.title}</h2>

                {expanded ? (
                  <div className="reader-section-body">{section.body}</div>
                ) : (
                  <div className="reader-section-body reader-section-preview">{preview(section.body)}</div>
                )}

                {!expanded && (
                  <button
                    className="reader-expand-btn"
                    onClick={() => {
                      setExpandedSections((previous) => {
                        const copy = new Set(previous);
                        copy.add(section.id);
                        return copy;
                      });

                      void trackEvent({
                        eventName: "section_opened",
                        mode: "reader",
                        docSlug,
                        sectionId: section.anchor,
                        metadata: {
                          virtualization: true,
                          index,
                        },
                      });
                    }}
                    type="button"
                  >
                    Load full section
                  </button>
                )}
              </section>

              {showScholarly && (
                <aside className="reader-commentary">
                  {sectionComments?.map(comment => (
                    <div key={comment.id} className="comment-card">
                      <header>{comment.scholar}</header>
                      <p>{comment.body}</p>
                    </div>
                  ))}
                </aside>
              )}
            </div>
          );
        })}
      </article>
    </div>
  );
}
