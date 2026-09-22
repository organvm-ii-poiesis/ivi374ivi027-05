import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import type { CanonicalDoc, MirrorAsset } from "@/types/content";

type CanonicalEntry = Pick<CanonicalDoc, "id" | "slug" | "title" | "order" | "wordCount"> & {
  sectionCount: number;
  readerUrl: string;
};
type MirrorEntry = Pick<MirrorAsset, "id" | "fileName" | "ext" | "sizeBytes" | "downloadUrl" | "sha256">;

// Read after Playwright starts its server, so production checks use the freshly built data.
function readBuiltManifest<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), "src/data", file), "utf8")) as T;
}

test("canonical API lists every document and every reader route renders", async ({ page, request }) => {
  const response = await request.get("/api/manifest/canonical");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  const documents: CanonicalEntry[] = await response.json();
  const expected = readBuiltManifest<CanonicalDoc[]>("processed-content.json")
    .sort((a, b) => a.order - b.order)
    .map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      order: doc.order,
      wordCount: doc.wordCount,
      sectionCount: doc.sections.length,
      readerUrl: `/read/${encodeURIComponent(doc.slug)}`,
    }));
  expect(expected.length).toBeGreaterThanOrEqual(6);
  expect(documents).toEqual(expected);

  for (const doc of documents) {
    const pageResponse = await page.goto(doc.readerUrl);
    expect(pageResponse?.status(), doc.slug).toBe(200);
    await expect(page.getByRole("heading", { name: doc.title, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  }
});

test("mirror API matches the built archive inventory without local paths", async ({ request }) => {
  const response = await request.get("/api/manifest/mirror");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  const expected = readBuiltManifest<MirrorAsset[]>("mirror-manifest.json").map((asset) => ({
    id: asset.id,
    fileName: asset.fileName,
    ext: asset.ext,
    sizeBytes: asset.sizeBytes,
    downloadUrl: asset.downloadUrl,
    sha256: asset.sha256,
  }));
  expect(expected.length).toBeGreaterThan(0);
  expect(await response.json()).toEqual(expected);
});

for (const ext of ["pdf", "pages", "numbers", "zip", "docx"] as const) {
  test(`the ${ext} download has the exact advertised bytes and SHA-256`, async ({ request }, testInfo) => {
    const response = await request.get("/api/manifest/mirror");
    expect(response.status()).toBe(200);
    const assets: MirrorEntry[] = await response.json();
    const asset = assets.filter((entry) => entry.ext === ext)
      .sort((a, b) => a.sizeBytes - b.sizeBytes)[0];
    expect(asset, `Missing required ${ext} archive representative`).toBeDefined();
    if (!asset) throw new Error(`No ${ext} asset in the manifest`);
    expect(asset.downloadUrl).toMatch(/^\/mirror\//);
    expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);

    const download = await request.get(asset.downloadUrl, { maxRedirects: 0 });
    expect(download.status(), asset.downloadUrl).toBe(200);
    const bytes = await download.body();
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.length).toBe(asset.sizeBytes);
    const digest = createHash("sha256").update(bytes).digest("hex");
    expect(digest).toBe(asset.sha256);
    await testInfo.attach(`download-${ext}-receipt`, {
      body: Buffer.from(JSON.stringify({
        downloadUrl: asset.downloadUrl, sizeBytes: bytes.length, sha256: digest,
      }, null, 2)),
      contentType: "application/json",
    });
    await download.dispose();
  });
}

for (const character of ["@", "#"] as const) {
  test(`archive filenames containing ${character} retain their exact downloadable bytes`, async ({ request }, testInfo) => {
    const response = await request.get("/api/manifest/mirror");
    expect(response.status()).toBe(200);
    const assets: MirrorEntry[] = await response.json();
    const asset = assets.filter((entry) => entry.fileName.includes(character))
      .sort((a, b) => a.sizeBytes - b.sizeBytes)[0];
    expect(asset, `Missing ${character} filename regression fixture`).toBeDefined();
    if (!asset) throw new Error(`No archive filename containing ${character}`);
    const url = new URL(asset.downloadUrl, "http://localhost:3007");
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
    expect(decodeURIComponent(url.pathname)).toContain(asset.fileName);
    expect(asset.downloadUrl).toContain(encodeURIComponent(character));

    const download = await request.get(asset.downloadUrl, { maxRedirects: 0 });
    expect(download.status(), asset.downloadUrl).toBe(200);
    const bytes = await download.body();
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.length).toBe(asset.sizeBytes);
    const digest = createHash("sha256").update(bytes).digest("hex");
    expect(digest).toBe(asset.sha256);
    await testInfo.attach(`encoded-filename-${character.charCodeAt(0)}-receipt`, {
      body: Buffer.from(JSON.stringify({ downloadUrl: asset.downloadUrl, sizeBytes: bytes.length, sha256: digest }, null, 2)),
      contentType: "application/json",
    });
    await download.dispose();
  });
}

test("an unknown canonical reader is a real 404", async ({ request }) => {
  const response = await request.get("/read/not-a-canonical-document-activation-check");
  expect(response.status()).toBe(404);
});

test("the portfolio context route is available", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
