import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { parseSections } from "../src/lib/content-engine";
import { verifyMirrorAssets, type MirrorIntegrityResult } from "../src/lib/mirror-integrity";
import type { CanonicalDoc, MirrorAsset } from "../src/types/content";

type NarrativeNode = {
  id: string;
  linkedDocSlugs: string[];
};

type FeedItem = {
  id: string;
  contentRef: string;
};

type IntegrityReport = {
  generatedAt: string;
  mirror: MirrorIntegrityResult;
  invariants: {
    duplicateNodeIds: string[];
    invalidNodeLinkedDocSlugs: string[];
    invalidFeedContentRefs: string[];
    processedContentMismatch: boolean;
  };
  ok: boolean;
};

const root = process.cwd();
const mirrorManifestPath = join(root, "src/data/mirror-manifest.json");
const processedContentPath = join(root, "src/data/processed-content.json");
const nodeMapPath = join(root, "src/data/node-map.json");
const feedItemsPath = join(root, "src/data/feed-items.json");
const outputPath = join(root, "src/data/data-integrity-report.json");

async function sha256(path: string): Promise<string> {
  const buffer = await readFile(path);
  return createHash("sha256").update(buffer).digest("hex");
}

async function run() {
  const mirrorManifest = JSON.parse(await readFile(mirrorManifestPath, "utf8")) as MirrorAsset[];
  const processedContent = JSON.parse(await readFile(processedContentPath, "utf8")) as CanonicalDoc[];
  const nodeMap = JSON.parse(await readFile(nodeMapPath, "utf8")) as NarrativeNode[];
  const feedItems = JSON.parse(await readFile(feedItemsPath, "utf8")) as FeedItem[];

  const mirror = await verifyMirrorAssets(mirrorManifest, (relativePath) =>
    sha256(join(root, "public", "mirror", relativePath)),
  );

  const nodeIds = nodeMap.map((node) => node.id);
  const duplicateNodeIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);

  const validSlugs = new Set(processedContent.map((doc) => doc.slug));
  const invalidNodeLinkedDocSlugs: string[] = [];

  for (const node of nodeMap) {
    for (const slug of node.linkedDocSlugs) {
      if (!validSlugs.has(slug)) {
        invalidNodeLinkedDocSlugs.push(`${node.id}:${slug}`);
      }
    }
  }

  const anchorsByDoc = new Map<string, Set<string>>();
  let processedContentMismatch = false;

  for (const doc of processedContent) {
    const markdown = await readFile(join(root, doc.markdownPath), "utf8");
    const freshSections = parseSections(markdown, doc.slug);

    // Check if the pre-parsed JSON sections match what we would parse now.
    if (JSON.stringify(freshSections) !== JSON.stringify(doc.sections)) {
      processedContentMismatch = true;
    }

    anchorsByDoc.set(doc.slug, new Set(freshSections.map((section) => section.anchor)));
  }

  const invalidFeedContentRefs: string[] = [];
  for (const item of feedItems) {
    const [slug, anchor] = item.contentRef.split("#");
    if (!slug || !anchor) {
      invalidFeedContentRefs.push(item.id);
      continue;
    }

    const anchors = anchorsByDoc.get(slug);
    if (!anchors || !anchors.has(anchor)) {
      invalidFeedContentRefs.push(item.id);
    }
  }

  const report: IntegrityReport = {
    generatedAt: new Date().toISOString(),
    mirror,
    invariants: {
      duplicateNodeIds,
      invalidNodeLinkedDocSlugs,
      invalidFeedContentRefs,
      processedContentMismatch,
    },
    ok:
      mirror.verifiedAssets === mirror.totalAssets &&
      mirror.checksumMismatches.length === 0 &&
      mirror.unreadableFiles.length === 0 &&
      mirror.badDownloadUrls.length === 0 &&
      duplicateNodeIds.length === 0 &&
      invalidNodeLinkedDocSlugs.length === 0 &&
      invalidFeedContentRefs.length === 0 &&
      !processedContentMismatch,
  };

  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (!report.ok) {
    console.error(JSON.stringify(report, null, 2));
    throw new Error("Data integrity checks failed. Inspect src/data/data-integrity-report.json");
  }

  console.log(`Integrity checks passed for ${mirror.verifiedAssets} mirrored assets and processed content.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
