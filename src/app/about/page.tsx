import Link from "next/link";

import { AnalyticsViewTracker } from "@/components/analytics-view-tracker";
import { MotifSearch } from "@/components/motif-search";
import { getAllCanonicalDocs } from "@/lib/content";

export default async function AboutPage() {
  const docs = await getAllCanonicalDocs();

  return (
    <>
      <AnalyticsViewTracker mode="about" />

      <section className="hero about-hero">
        <p className="eyebrow">Portfolio Context</p>
        <h1>Anthony James Padavano</h1>
        <p>
          MET4MORFOSES is an MFA thesis project developed at Florida Atlantic University (May 2018), designed as an
          evolving hybrid between mythic narrative, computational process, and multimedia publication.
        </p>
      </section>

      <section className="about-grid" aria-label="Project context and framing">
        <article>
          <h2>Artist Statement</h2>
          <p>
            This digital representation preserves the thesis language while extending the intended online and
            interactive trajectory described in the project preface.
          </p>
        </article>

        <article>
          <h2>Project Modes</h2>
          <p>
            The site ships three intentionally distinct interfaces: Node Map, Feed, and Scroll. Each mode exposes the
            same canonical text through different spatial and temporal logics.
          </p>
        </article>

        <article>
          <h2>Archive Policy</h2>
          <p>
            The repository mirror is intentionally public and complete for provenance and research continuity.
            Downloadables are available in <Link href="/archive">Archive</Link>.
          </p>
        </article>
      </section>

      <MotifSearch docs={docs} />
    </>
  );
}
