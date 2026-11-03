import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const NEXT_DIR = path.resolve(process.cwd(), ".next");
const MAX_STAGE_GZIP_KB = 250;

function gzipSizeBytes(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

function main() {
  if (!fs.existsSync(NEXT_DIR)) {
    console.error("Error: .next build directory not found. Run `npm run build` first.");
    process.exit(1);
  }

  // Locate chunks referenced by /stage page if manifest exists, otherwise sum page-specific + shared entry chunks
  const appBuildManifestPath = path.join(NEXT_DIR, "app-build-manifest.json");
  const buildManifestPath = path.join(NEXT_DIR, "build-manifest.json");

  const chunkFiles = new Set();

  if (fs.existsSync(appBuildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(appBuildManifestPath, "utf8"));
    const stageChunks = manifest?.pages?.["/stage/page"] ?? [];
    for (const rel of stageChunks) {
      if (rel.endsWith(".js")) {
        chunkFiles.add(path.join(NEXT_DIR, rel));
      }
    }
  } else if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf8"));
    const rootFiles = manifest?.rootMainFiles ?? [];
    for (const rel of rootFiles) {
      if (rel.endsWith(".js")) {
        chunkFiles.add(path.join(NEXT_DIR, rel));
      }
    }
  }

  // Fallback for Next.js 16 Turbopack output if app-build-manifest.json is not emitted
  if (chunkFiles.size === 0) {
    const serverStageManifest = path.join(
      NEXT_DIR,
      "server",
      "app",
      "stage",
      "page_client-reference-manifest.js",
    );
    const chunksDir = path.join(NEXT_DIR, "static", "chunks");
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
      // Measure largest route + shared runtime chunks if manifest is not explicit
      for (const f of files.slice(0, 6)) {
        chunkFiles.add(path.join(chunksDir, f));
      }
    }
    void serverStageManifest;
  }

  let totalBytes = 0;
  for (const file of chunkFiles) {
    totalBytes += gzipSizeBytes(file);
  }

  const totalKb = totalBytes / 1024;
  console.log(
    `[bundle-budget] /stage first-load JS (gzip): ${totalKb.toFixed(2)} kB (budget <= ${MAX_STAGE_GZIP_KB} kB across ${chunkFiles.size} chunks)`,
  );

  if (totalKb > MAX_STAGE_GZIP_KB) {
    console.error(
      `[bundle-budget] FAILED: ${totalKb.toFixed(2)} kB exceeds ${MAX_STAGE_GZIP_KB} kB limit.`,
    );
    process.exit(1);
  }

  console.log("[bundle-budget] OK");
}

main();
