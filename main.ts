// Leonida Nights — entrypoint. Copies app/ and screenshots/ into the
// grader output directory and writes dossier.json with the kit's
// buildDossier. Node 22, standard library only, deterministic.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) return;
  if (existsSync(dst)) rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

function main(): void {
  mkdirSync(outDir, { recursive: true });
  copyTree("app");
  copyTree("screenshots");
  // buildDossier returns the dossier bytes; write them raw, never through
  // JSON.stringify, so the gate's byte-for-byte comparison holds.
  const dossier = buildDossier(repoRoot, { text_max_bytes: 163840 });
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

main();
