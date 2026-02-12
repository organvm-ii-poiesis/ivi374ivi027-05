import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OracleExperience } from "@/components/oracle-experience";
import type { StyleDNA } from "@/lib/codex/analyzer";

export default async function OraclePage() {
  const root = process.cwd();
  const dnaPath = join(root, "src/data/style-dna.json");
  const dna = JSON.parse(await readFile(dnaPath, "utf8")) as StyleDNA;

  return (
    <main>
      <OracleExperience dna={dna} />
    </main>
  );
}
