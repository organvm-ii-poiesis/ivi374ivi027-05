import { AnalyticsViewTracker } from "@/components/analytics-view-tracker";
import { ArchiveBrowser } from "@/components/archive-browser";
import { getAllMirrorAssets, getMirrorExtensionCounts } from "@/lib/mirror";

export default function ArchivePage() {
  const assets = getAllMirrorAssets();
  const extensionCounts = getMirrorExtensionCounts();
  const extensions = Object.keys(extensionCounts).sort((a, b) =>
    extensionCounts[b] === extensionCounts[a]
      ? a.localeCompare(b)
      : extensionCounts[b] - extensionCounts[a],
  );

  return (
    <>
      <AnalyticsViewTracker mode="archive" />

      <section className="hero archive-hero">
        <p className="eyebrow">Public Mirror</p>
        <h1>Complete Source Archive</h1>
        <p>
          All thesis artifacts are publicly available: PDF, Pages, Numbers, ZIP, and related source files in their
          preserved directory structure.
        </p>
      </section>

      <ArchiveBrowser assets={assets} extensions={extensions} />
    </>
  );
}
