import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, lstat, mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

/** @param {string} file */
async function digest(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

/** @param {string} root @param {string} target */
function assertInside(root, target) {
  const path = relative(root, target);
  if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`)) {
    throw new Error("Runtime contains a path outside its package");
  }
}

/** Reject configuration/credentials and symlinks that escape the runtime. @param {string} root */
async function inspectRuntime(root) {
  /** @param {string} directory */
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (/^(?:\.env(?:\..*)?|\.git|\.npmrc|\.netrc|\.ssh)$/.test(entry.name)) {
        throw new Error(`Private configuration cannot be packaged: ${relative(root, file)}`);
      }
      if (entry.isSymbolicLink()) assertInside(root, await realpath(file));
      else if (entry.isDirectory()) await walk(file);
    }
  }
  await walk(root);
}

/** Package only an already-built application. This never deploys or grants publication approval.
 * @param {string} directory @param {string} sourceCommit
 */
export async function packageRuntime(directory, sourceCommit) {
  if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error("An exact source commit is required");
  const root = await realpath(directory);
  const output = join(root, ".release");
  await mkdir(output, { recursive: true });
  if (await realpath(output) !== output) throw new Error("Refusing a symlinked output directory");
  if ((await readdir(output)).length > 0) throw new Error("Refusing to overwrite a previous candidate; use a clean workspace");
  const runtime = join(output, "runtime");
  // No overwrite/removal of an earlier candidate or repository input.
  await mkdir(runtime);
  await cp(join(root, ".next/standalone"), runtime, { recursive: true, verbatimSymlinks: true });
  for (const [source, destination] of [
    [".next/static", ".next/static"], ["public", "public"],
    ["src/data", "src/data"], ["src/content", "src/content"],
  ]) {
    await cp(join(root, source), join(runtime, destination), { recursive: true, verbatimSymlinks: true });
  }
  await inspectRuntime(runtime);
  if (!(await stat(join(runtime, "server.js"))).isFile()) throw new Error("Missing standalone server");

  const manifestFile = join(runtime, "src/data/mirror-manifest.json");
  const assets = JSON.parse(await readFile(manifestFile, "utf8"));
  if (!Array.isArray(assets) || assets.length === 0) throw new Error("Missing archive inventory");
  for (const asset of assets) {
    if (typeof asset.relativePath !== "string" || !/^[a-f0-9]{64}$/.test(asset.sha256)) {
      throw new Error("Invalid archive inventory entry");
    }
    const file = resolve(runtime, "public/mirror", asset.relativePath);
    assertInside(join(runtime, "public/mirror"), file);
    if (!(await lstat(file)).isFile() || (await stat(file)).size !== asset.sizeBytes || await digest(file) !== asset.sha256) {
      throw new Error(`Packaged archive mismatch: ${asset.relativePath}`);
    }
  }
  const receipt = {
    schema: "met4/runtime-candidate/v1", sourceCommit,
    platform: process.platform, architecture: process.arch, buildNode: process.version,
    runtimeMajor: 24, publicationApproved: false,
    archiveAssetsVerified: assets.length,
    mirrorManifestSha256: await digest(manifestFile),
    dependencyLockSha256: await digest(join(root, "package-lock.json")),
  };
  await writeFile(join(runtime, "release-candidate.json"), JSON.stringify(receipt, null, 2) + "\n");
  const archive = join(output, "met4morfoses-runtime.tar.gz");
  execFileSync("tar", ["-czf", archive, "-C", runtime, "."], { stdio: "inherit" });
  const archiveSha256 = await digest(archive);
  await writeFile(archive + ".sha256", `${archiveSha256}  ${basename(archive)}\n`);
  await writeFile(join(output, "release-candidate.json"), JSON.stringify({ ...receipt, archiveSha256 }, null, 2) + "\n");
  return { ...receipt, archiveSha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Package with the supported Node 24 runtime");
    const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    console.log(JSON.stringify(await packageRuntime(process.cwd(), commit), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
