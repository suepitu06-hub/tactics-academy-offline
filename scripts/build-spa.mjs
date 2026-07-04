#!/usr/bin/env node
/**
 * Post-build: generate a static SPA shell for Capacitor (offline Android).
 *
 * The TanStack Start build produces `dist/server/` (Cloudflare Worker SSR
 * bundle) and `dist/client/` (browser assets, but NO index.html — HTML is
 * generated on-demand by the worker). Capacitor cannot run a worker; it
 * needs a plain static folder with index.html + assets.
 *
 * This script:
 *   1) imports the built SSR worker (`dist/server/index.mjs`)
 *   2) calls its fetch("/") to render the app's HTML shell
 *   3) writes that HTML into `dist/client/index.html`
 *
 * After this runs, `dist/client` is a self-contained static SPA. Capacitor
 * is configured (see capacitor.config.ts) to use `dist/client` as webDir.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const workerPath = resolve(root, "dist/server/index.mjs");
const outIndex = resolve(root, "dist/client/index.html");

if (!existsSync(workerPath)) {
  console.error(`[build-spa] Missing ${workerPath}. Run \`bun run build\` first.`);
  process.exit(1);
}

// The worker calls console.error on real errors; keep noise low but visible.
process.env.NODE_ENV = "production";

const mod = await import(pathToFileURL(workerPath).href);
const worker = mod.default ?? mod;
if (!worker || typeof worker.fetch !== "function") {
  console.error("[build-spa] Server bundle does not export a { fetch } handler.");
  process.exit(1);
}

const req = new Request("http://localhost/", {
  method: "GET",
  headers: { accept: "text/html" },
});

let res;
try {
  res = await worker.fetch(req, {}, {});
} catch (err) {
  console.error("[build-spa] SSR fetch failed:", err);
  process.exit(1);
}

if (!res || res.status >= 400) {
  console.error(`[build-spa] SSR returned status ${res?.status}`);
  process.exit(1);
}

const html = await res.text();
await mkdir(dirname(outIndex), { recursive: true });
await writeFile(outIndex, html, "utf8");
console.log(`[build-spa] Wrote ${outIndex} (${html.length} bytes)`);
