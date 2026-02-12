import { describe, it, expect } from "vitest";
import { parseSections } from "@/lib/content-engine";

describe("Content Engine - parseSections", () => {
  it("should split content into sections based on H2 headers", () => {
    const md = "# Title\n## Section 1\nBody 1\n## Section 2\nBody 2";
    const sections = parseSections(md, "test-doc");
    
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe("Section 1");
    expect(sections[1].title).toBe("Section 2");
  });

  it("should generate unique anchors for duplicate titles", () => {
    const md = "## Same\nOne\n## Same\nTwo";
    const sections = parseSections(md, "test-doc");
    
    expect(sections[0].anchor).toBe("same");
    expect(sections[1].anchor).toBe("same-2");
  });

  it("should ignore H1 headers as section starters", () => {
    const md = "# Root Title\nContent before first h2";
    const sections = parseSections(md, "test-doc");
    
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Full Text");
  });
});
