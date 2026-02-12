"use client";

import { useState } from "react";
import { transformText } from "@/lib/codex/generator";
import type { StyleDNA } from "@/lib/codex/analyzer";

type Props = {
  dna: StyleDNA;
};

export function OracleExperience({ dna: initialDna }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modulatedDna, setModulatedDna] = useState(initialDna);

  const handleMetamorphosis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = transformText(input, modulatedDna);
      setOutput(result);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <section className="oracle-shell">
      <header className="oracle-header hero mythic-tech">
        <p className="eyebrow">The Oracle • Style Engine</p>
        <h1>Submit to Metamorphosis</h1>
        <p>
          Input your own text to have it algorithmically transformed into the MET4 dialect.
          The engine uses current stylometric DNA to inject character handles and glitch syntax.
        </p>
      </header>

      <div className="dna-modulation-panel stat">
        <h3>Linguistic DNA Modulation</h3>
        <div className="sliders">
          <div className="slider">
            <label>Fragmentation: {modulatedDna.fragmentationScore.toFixed(1)}%</label>
            <input 
              type="range" min="0" max="100" 
              value={modulatedDna.fragmentationScore}
              onChange={(e) => setModulatedDna({ ...modulatedDna, fragmentationScore: Number(e.target.value) })}
            />
          </div>
          <div className="slider">
            <label>Caps Lock Ratio: {(modulatedDna.glitchPatterns.capsLockRatio * 100).toFixed(1)}%</label>
            <input 
              type="range" min="0" max="1" step="0.01"
              value={modulatedDna.glitchPatterns.capsLockRatio}
              onChange={(e) => setModulatedDna({ 
                ...modulatedDna, 
                glitchPatterns: { ...modulatedDna.glitchPatterns, capsLockRatio: Number(e.target.value) } 
              })}
            />
          </div>
        </div>
      </div>

      <div className="oracle-grid">
        <div className="input-pane">
          <label htmlFor="oracle-input">Source Signal</label>
          <textarea
            id="oracle-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here... (e.g. 'Apollo loved Daphne but she fled into the woods.')"
          />
          <button 
            className="metamorphose-btn"
            onClick={handleMetamorphosis}
            disabled={!input || isProcessing}
          >
            {isProcessing ? "MORPHING..." : "INITIATE METAMORPHOSIS"}
          </button>
        </div>

        <div className="output-pane">
          <label>Synthetic Output</label>
          <div className="result-display literary">
            {output || <span className="placeholder">Awaiting signal...</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
