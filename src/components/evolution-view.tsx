"use client";

import { useState } from "react";
import type { EvolutionaryDoc } from "@/types/content";

type Props = {
  doc: EvolutionaryDoc;
};

type DiffToken = {
  type: "added" | "removed" | "equal";
  value: string;
};

/**
 * Simple word-level diffing algorithm for MET4 texts.
 */
function diffWords(oldStr: string, newStr: string): DiffToken[] {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  const result: DiffToken[] = [];

  // Very basic heuristic diff - improved algorithms exist but this is 
  // robust for showing the "glitch" shifts in MET4.
  let i = 0;
  let j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
      result.push({ type: "equal", value: oldWords[i] });
      i++;
      j++;
    } else if (j < newWords.length && !oldWords.includes(newWords[j])) {
      result.push({ type: "added", value: newWords[j] });
      j++;
    } else if (i < oldWords.length && !newWords.includes(oldWords[i])) {
      result.push({ type: "removed", value: oldWords[i] });
      i++;
    } else {
      // Fallback
      if (i < oldWords.length) {
        result.push({ type: "removed", value: oldWords[i] });
        i++;
      }
      if (j < newWords.length) {
        result.push({ type: "added", value: newWords[j] });
        j++;
      }
    }
  }

  return result;
}

export function EvolutionView({ doc }: Props) {
  const [v1Index, setV1Index] = useState(0);
  const [v2Index, setV2Index] = useState(doc.versions.length - 1);
  const [showDiff, setShowDiff] = useState(true);

  const v1 = doc.versions[v1Index];
  const v2 = doc.versions[v2Index];

  return (
    <section className="evolution-shell">
      <header className="evolution-header">
        <p className="eyebrow">The Time Machine • {doc.slug}</p>
        <h1>{doc.title}</h1>
        <div className="evolution-controls">
          <div className="version-selectors">
            <div className="selector">
              <label>From:</label>
              <select value={v1Index} onChange={(e) => setV1Index(Number(e.target.value))}>
                {doc.versions.map((v, i) => (
                  <option key={v.draft} value={i}>Draft {v.draft} ({v.date})</option>
                ))}
              </select>
            </div>
            <div className="selector">
              <label>To:</label>
              <select value={v2Index} onChange={(e) => setV2Index(Number(e.target.value))}>
                {doc.versions.map((v, i) => (
                  <option key={v.draft} value={i}>Draft {v.draft} ({v.date})</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            className={`toggle-btn ${showDiff ? "active" : ""}`}
            onClick={() => setShowDiff(!showDiff)}
          >
            {showDiff ? "Hide Semantic Diff" : "Show Visual Diff"}
          </button>
        </div>
      </header>

      <div className="evolution-stats">
        <div className="stat">
          <span className="label">Word Count Shift:</span>
          <span className="value">
            {v1.wordCount} → {v2.wordCount} ({v2.wordCount - v1.wordCount > 0 ? "+" : ""}{v2.wordCount - v1.wordCount})
          </span>
        </div>
      </div>

      <div className="evolution-grid">
        <article className="version-pane">
          <header>Draft {v1.draft} Source</header>
          <div className="content-scroll">
            {v1.sections.map(s => (
              <section key={s.id} className="version-section">
                <h3>{s.title}</h3>
                <p className="literary">{s.body}</p>
              </section>
            ))}
          </div>
        </article>

        <article className={`version-pane ${showDiff ? "diff-mode" : ""}`}>
          <header>{showDiff ? `Diff: Draft ${v1.draft} vs ${v2.draft}` : `Draft ${v2.draft} Target`}</header>
          <div className="content-scroll">
            {v2.sections.map((s, idx) => {
              const prevSection = v1.sections[idx];
              if (!showDiff || !prevSection) {
                return (
                  <section key={s.id} className="version-section">
                    <h3>{s.title}</h3>
                    <p className="literary">{s.body}</p>
                  </section>
                );
              }

              const tokens = diffWords(prevSection.body, s.body);

              return (
                <section key={s.id} className="version-section">
                  <h3>{s.title}</h3>
                  <div className="literary diff-content">
                    {tokens.map((token, i) => (
                      <span key={i} className={`diff-token ${token.type}`}>
                        {token.value}
                      </span>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
