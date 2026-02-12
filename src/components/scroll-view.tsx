"use client";

import Link from "next/link";

import type { CanonicalDoc } from "@/types/content";
import { trackEvent } from "@/lib/analytics";

type Props = {
  docs: CanonicalDoc[];
};

export function ScrollView({ docs }: Props) {
  return (
    <section className="scroll-shell" aria-label="Three-cycle scroll narrative">
      {docs.map((doc) => (
        <article className="scroll-doc" id={doc.slug} key={doc.id}>
          <header>
            <p className="eyebrow">Cycle Sequence</p>
            <h2>{doc.title}</h2>
            <Link href={`/read/${doc.slug}`}>Open dedicated reader</Link>
          </header>

          <div className="scroll-sections">
            {doc.sections.map((section) => (
              <section id={`${doc.slug}-${section.anchor}`} key={section.id}>
                <h3>{section.title}</h3>
                <p>{section.body.slice(0, 900)}</p>
                <Link
                  href={`/read/${doc.slug}#${section.anchor}`}
                  onClick={() => {
                    void trackEvent({
                      eventName: "section_opened",
                      mode: "scroll",
                      docSlug: doc.slug,
                      sectionId: section.anchor,
                    });
                  }}
                >
                  Jump to full passage
                </Link>
              </section>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
