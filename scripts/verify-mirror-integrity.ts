import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { parseSections } from "../src/lib/content-engine";
import type { CanonicalDoc } from "../src/types/content";

type MirrorAsset = {
  id: string;
  relativePath: string;
  fileName: string;
  ext: string;
  sizeBytes: number;
  modifiedAt: string;
  sourceFolder: string;
  downloadUrl: string;
  sha256: string;
};

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
  mirror: {
    totalAssets: number;
    verifiedAssets: number;
    checksumMismatches: string[];
    unreadableFiles: string[];
    badDownloadUrls: string[];
  };
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

  const checksumMismatches: string[] = [];
  const unreadableFiles: string[] = [];
  const badDownloadUrls: string[] = [];

  for (const asset of mirrorManifest) {
    const expectedDownloadUrl = `/mirror/${encodeURI(asset.relativePath)}`;
    if (!asset.downloadUrl.startsWith("/mirror/") || asset.downloadUrl !== expectedDownloadUrl) {
      badDownloadUrls.push(asset.relativePath);
      continue;
    }

    const absPath = join(root, "public", "mirror", asset.relativePath);

    try {
      const digest = await sha256(absPath);
      if (digest !== asset.sha256) {
        checksumMismatches.push(asset.relativePath);
      }
    } catch {
      unreadableFiles.push(asset.relativePath);
    }
  }

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
    
    // Check if the pre-parsed JSON sections match what we would parse now
    if (JSON.stringify(freshSections) !== JSON.stringify(doc.sections)) {
      processedContentMismatch = true;
    }

    anchorsByDoc.set(doc.slug, new Set(freshSections.map(s => s.anchor)));
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
    mirror: {
      totalAssets: mirrorManifest.length,
      verifiedAssets: mirrorManifest.length - unreadableFiles.length,
      checksumMismatches,
      unreadableFiles,
      badDownloadUrls,
    },
    invariants: {
      duplicateNodeIds,
      invalidNodeLinkedDocSlugs,
      invalidFeedContentRefs,
      processedContentMismatch,
    },
    ok:
      checksumMismatches.length === 0 &&
      unreadableFiles.length === 0 &&
      badDownloadUrls.length === 0 &&
      duplicateNodeIds.length === 0 &&
      invalidNodeLinkedDocSlugs.length === 0 &&
      invalidFeedContentRefs.length === 0 &&
      !processedContentMismatch,
  };

  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (!report.ok) {
    throw new Error("Data integrity checks failed. Inspect src/data/data-integrity-report.json");
  }

  console.log(`Integrity checks passed for ${mirrorManifest.length} mirrored assets and processed content.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
