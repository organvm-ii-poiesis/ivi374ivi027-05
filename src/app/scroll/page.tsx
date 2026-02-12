import { AnalyticsViewTracker } from "@/components/analytics-view-tracker";
import { ScrollMemory } from "@/components/scroll-memory";
import { ScrollView } from "@/components/scroll-view";
import { getAllCanonicalDocs } from "@/lib/content";

const cycleSlugs = new Set(["sikl-1", "sikl-2", "sikl-3"]);

export default async function ScrollPage() {
  const docs = (await getAllCanonicalDocs()).filter((doc) => cycleSlugs.has(doc.slug));

  return (
    <>
      <AnalyticsViewTracker mode="scroll" />
      <ScrollMemory keyName="scroll" />

      <section className="hero minimal-literary">
        <p className="eyebrow">Mode 3 • Three-Cycle Scroll</p>
        <h1>A Long-Form Passage Through Sikl 1, 2, and 3</h1>
        <p>
          A continuous reading arc with chapter transitions and direct jumps into the dedicated full reader.
        </p>
      </section>

      <ScrollView docs={docs} />
    </>
  );
}
