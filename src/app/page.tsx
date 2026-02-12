import Link from "next/link";

import { AnalyticsViewTracker } from "@/components/analytics-view-tracker";
import { NodeMapExperience } from "@/components/node-map-experience";
import { ScrollMemory } from "@/components/scroll-memory";
import { getAllCanonicalDocs } from "@/lib/content";
import { getNarrativeNodes } from "@/lib/nodes";

export default async function HomePage() {
  const [docs, nodes] = await Promise.all([getAllCanonicalDocs(), Promise.resolve(getNarrativeNodes())]);

  return (
    <>
      <AnalyticsViewTracker mode="node-map" />
      <ScrollMemory keyName="node-map" />

      <section className="hero mythic-tech">
        <p className="eyebrow">Mode 1 • Mythic Node Map</p>
        <h1>Ancient Myth Meets Synthetic Signal</h1>
        <p>
          Explore characters and motifs as a living constellation. Each node opens into thesis passages,
          cycle crossings, and linked textual transformations.
        </p>
        <div className="hero-actions">
          <Link href="/feed">Switch to Feed</Link>
          <Link href="/scroll">Switch to Scroll</Link>
          <Link href="/read/intro">Begin with Intro</Link>
        </div>
      </section>

      <NodeMapExperience docs={docs} nodes={nodes} />
    </>
  );
}
