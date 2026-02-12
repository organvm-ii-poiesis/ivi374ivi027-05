import { describe, it, expect } from "vitest";
import { SmartGenerator } from "@/lib/codex/ai-engine";
import type { StyleDNA } from "@/lib/codex/analyzer";

describe("SmartGenerator", () => {
  const mockDna: StyleDNA = {
    entityRegistry: { "@APOLO": 1 },
    vocabularySize: 100,
    avgSentenceLength: 10,
    fragmentationScore: 0, // Disable glitches for deterministic testing
    glitchPatterns: {
      capsLockRatio: 0,
      symbolDensity: 0
    }
  };

  it("should inject handles for known entities", () => {
    const generator = new SmartGenerator(mockDna);
    const input = "Apollo loved Daphne.";
    const output = generator.generate(input);
    
    expect(output).toContain("@APOLO");
    expect(output).toContain("@DAFNE");
  });

  it("should apply capitalization when DNA ratio is high", () => {
    const shoutingDna = { 
      ...mockDna, 
      glitchPatterns: { ...mockDna.glitchPatterns, capsLockRatio: 1 } 
    };
    const generator = new SmartGenerator(shoutingDna);
    const output = generator.generate("hello world");
    
    expect(output).toBe("HELLO WORLD");
  });

  it("should handle empty strings gracefully", () => {
    const generator = new SmartGenerator(mockDna);
    expect(generator.generate("")).toBe("");
  });
});
