"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import type { CanonicalDoc, FeedItem } from "@/types/content";

type Props = {
  items: FeedItem[];
  docs: CanonicalDoc[];
};

function buildDocLookup(docs: CanonicalDoc[]): Record<string, CanonicalDoc> {
  return docs.reduce<Record<string, CanonicalDoc>>((accumulator, doc) => {
    accumulator[doc.slug] = doc;
    return accumulator;
  }, {});
}

export function FeedView({ items, docs }: Props) {
  const docsBySlug = buildDocLookup(docs);

  return (
    <section className="feed-shell" aria-label="Faux social feed">
      {items.map((item) => {
        const [docSlug, anchor] = item.contentRef.split("#");
        const doc = docsBySlug[docSlug];
        const section = doc?.sections.find((candidate) => candidate.anchor === anchor);

        return (
          <article className="feed-card" key={item.id}>
            <header>
              <p className="eyebrow">{item.nodeId}</p>
              <h2>{doc?.title ?? docSlug}</h2>
            </header>

            <p>{section?.body.slice(0, 320) ?? item.contentRef}</p>

            <footer>
              <Link
                href={`/read/${docSlug}#${anchor}`}
                onClick={() => {
                  void trackEvent({
                    eventName: "section_opened",
                    mode: "feed",
                    docSlug,
                    sectionId: anchor,
                    nodeId: item.nodeId,
                  });
                }}
              >
                Open passage
              </Link>
              <span>{item.tags.join(" • ")}</span>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
