import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageEntry = {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
};

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const manifest = JSON.parse(read("package.json")) as PackageEntry;
const lock = JSON.parse(read("package-lock.json")) as { packages: Record<string, PackageEntry> };
const version = (name: string) => {
  const value = lock.packages[`node_modules/${name}`]?.version;
  if (!value) throw new Error(`Missing locked dependency: ${name}`);
  return value;
};

// These assertions describe the currently accepted consumer/runtime contract.
// A deliberate migration updates the consumers, Dependabot limits, and tests together.
describe("dependency compatibility contract", () => {
  it("keeps the manifest and lockfile root requirements synchronized", () => {
    expect(lock.packages[""].dependencies).toEqual(manifest.dependencies);
    expect(lock.packages[""].devDependencies).toEqual(manifest.devDependencies);
    expect(lock.packages[""].engines).toEqual(manifest.engines);
  });

  it("pairs React and DOM on the renderer-supported line with matching types", () => {
    expect(version("react")).toMatch(/^19\.2\.\d+$/);
    expect(version("react-dom")).toBe(version("react"));
    expect(version("@types/react")).toMatch(/^19\.2\.\d+$/);
    expect(version("@types/react-dom")).toMatch(/^19\.2\.\d+$/);
  });

  it("keeps Node declarations and types aligned with the actual CI runtime major", () => {
    expect(read(".nvmrc").trim()).toBe("24");
    expect(manifest.engines?.node).toBe(">=24 <25");
    expect(version("@types/node")).toMatch(/^24\.\d+\.\d+$/);
  });

  it("retains supported lint-tool peers and pairs Vitest with its coverage provider", () => {
    expect(version("eslint")).toMatch(/^9\.\d+\.\d+$/);
    expect(version("typescript")).toMatch(/^6\.0\.\d+$/);
    expect(version("@vitest/coverage-v8")).toBe(version("vitest"));
  });

  it("does not weaken engine or peer validation to make upgrades install", () => {
    const npmrc = read(".npmrc");
    expect(npmrc).toMatch(/^engine-strict=true$/m);
    expect(npmrc).toMatch(/^strict-peer-deps=true$/m);
    expect(npmrc).not.toMatch(/^(?:legacy-peer-deps|force)=true$/m);
  });
});
