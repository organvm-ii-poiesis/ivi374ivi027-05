import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { packageRuntime } from "../../scripts/package-runtime.mjs";

const roots: string[] = [];
const commit = "a".repeat(40);

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "met4-package-test-"));
  roots.push(root);
  for (const directory of [".next/standalone", ".next/static", "public/mirror", "src/data", "src/content"]) {
    await mkdir(join(root, directory), { recursive: true });
  }
  const bytes = Buffer.from("Preserved original archive bytes.");
  await writeFile(join(root, "public/mirror/@sample.txt"), bytes);
  await writeFile(join(root, ".next/standalone/server.js"), "// fixture server\n");
  await writeFile(join(root, ".next/static/app.js"), "// fixture static\n");
  await writeFile(join(root, "src/content/intro.md"), "Original text\n");
  await writeFile(join(root, "package-lock.json"), "{}\n");
  await writeFile(join(root, "src/data/mirror-manifest.json"), JSON.stringify([{
    relativePath: "@sample.txt", sizeBytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }]));
  return root;
}

afterEach(async () => {
  // Only temporary fixtures created by these tests are removed.
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

describe("runtime candidate packaging", () => {
  it("packages verified bytes with commit provenance and no publication approval", async () => {
    const root = await fixture();
    const result = await packageRuntime(root, commit);
    expect(result.sourceCommit).toBe(commit);
    expect(result.publicationApproved).toBe(false);
    expect(result.archiveAssetsVerified).toBe(1);
    expect(result.archiveSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(await readFile(join(root, ".release/runtime/public/mirror/@sample.txt"), "utf8"))
      .toBe("Preserved original archive bytes.");
  });

  it("rejects an unpinned source", async () => {
    await expect(packageRuntime(await fixture(), "main")).rejects.toThrow("exact source commit");
  });

  it("rejects corrupted archive bytes", async () => {
    const root = await fixture();
    await writeFile(join(root, "public/mirror/@sample.txt"), "corrupt");
    await expect(packageRuntime(root, commit)).rejects.toThrow("archive mismatch");
  });

  it("rejects private environment files", async () => {
    const root = await fixture();
    await writeFile(join(root, ".next/standalone/.env.production"), "FIXTURE=not-a-secret");
    await expect(packageRuntime(root, commit)).rejects.toThrow("Private configuration");
  });

  it("rejects symlinks outside the runtime", async () => {
    const root = await fixture();
    await symlink(join(root, "package-lock.json"), join(root, ".next/standalone/escape"));
    await expect(packageRuntime(root, commit)).rejects.toThrow("outside its package");
  });

  it("refuses to overwrite a previous candidate", async () => {
    const root = await fixture();
    await packageRuntime(root, commit);
    await expect(packageRuntime(root, commit)).rejects.toThrow("previous candidate");
  });
});
