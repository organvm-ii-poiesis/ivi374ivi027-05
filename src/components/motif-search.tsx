"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { CanonicalDoc, CanonicalSection } from "@/types/content";

type SearchResult = {
  doc: CanonicalDoc;
  section: CanonicalSection;
  score: number;
};

type Props = {
  docs: CanonicalDoc[];
};

export function MotifSearch({ docs }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query || query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const hits: SearchResult[] = [];

    for (const doc of docs) {
      for (const section of doc.sections) {
        let score = 0;
        const lowerTitle = section.title.toLowerCase();
        const lowerBody = section.body.toLowerCase();

        if (lowerTitle.includes(lowerQuery)) {
          score += 10;
        }

        const bodyHits = lowerBody.split(lowerQuery).length - 1;
        score += bodyHits;

        if (score > 0) {
          hits.push({ doc, section, score });
        }
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [docs, query]);

  return (
    <section className="motif-search-shell" aria-labelledby="search-heading">
      <div className="search-header">
        <h2 id="search-heading">Motif Discovery</h2>
        <p className="description">Search the canonical Three Cycles for recurring themes and motifs.</p>
        <input
          type="search"
          placeholder="Search motifs (e.g. '@APOLO', 'mirror', 'ecstasy')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          aria-label="Search motifs across Three Cycles"
        />
      </div>

      <div className="search-results" aria-live="polite">
        {query.length >= 2 && results.length === 0 && (
          <p className="no-results">No motifs found for &quot;{query}&quot;.</p>
        )}

        {results.map(({ doc, section, score }) => (
          <article key={section.id} className="search-result-card">
            <header>
              <h3>{section.title}</h3>
              <p className="eyebrow">{doc.title} • Fidelity Score: {score}</p>
            </header>
            <p className="excerpt">
              {section.body.slice(0, 180)}...
            </p>
            <footer>
              <Link href={`/read/${doc.slug}#${section.anchor}`}>
                Go to passage
              </Link>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
