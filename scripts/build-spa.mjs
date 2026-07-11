#!/usr/bin/env node
/**
 * Post-build: generate a static SPA index.html shell for Capacitor
 * (offline Android).
 *
 * The TanStack Start build produces `dist/server/` (Cloudflare Worker SSR
 * bundle) and `dist/client/` (browser assets, but NO index.html — HTML is
 * generated on-demand by the worker). Capacitor cannot run a worker; it
 * needs a plain static folder with index.html + assets.
 *
 * We scan `dist/client/assets/` for the emitted client-entry chunk
 * (`index-*.js`) and the main stylesheet (`styles-*.css`), then write a
 * minimal HTML shell that boots the client bundle. TanStack Router takes
 * over on the client and handles routing, hydration is unnecessary because
 * there is no SSR-rendered DOM to hydrate.
 */

import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const clientDir = resolve(root, "dist/client");
const assetsDir = resolve(clientDir, "assets");
const capacitorDir = resolve(root, "www");
const outIndex = resolve(capacitorDir, "index.html");

if (!existsSync(assetsDir)) {
  console.error(`[build-spa] Missing ${assetsDir}. Run \`bun run build\` first.`);
  process.exit(1);
}

const files = await readdir(assetsDir);
const entry = files.find((f) => /^index-.*\.js$/.test(f));
const css = files.find((f) => /^styles-.*\.css$/.test(f));

if (!entry) {
  console.error("[build-spa] Could not find client entry (index-*.js) in dist/client/assets.");
  process.exit(1);
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0b3d2e" />
    <title>Basic Football Tactics Edu</title>
    <meta name="description" content="Learn Football Tactics Step by Step — offline lessons, formations, quizzes and a football dictionary." />
    <link rel="icon" href="/favicon.ico" />
${css ? `    <link rel="stylesheet" href="/assets/${css}" />\n` : ""}    <script type="module" crossorigin src="/assets/${entry}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

await rm(capacitorDir, { recursive: true, force: true });
await mkdir(capacitorDir, { recursive: true });
await cp(clientDir, capacitorDir, {
  recursive: true,
  force: true,
  filter: (source) => source !== resolve(clientDir, "index.html"),
});
await writeFile(outIndex, html, "utf8");
console.log(
  `[build-spa] Prepared Capacitor web assets in ${capacitorDir}\n  entry: assets/${entry}${css ? `\n  css:   assets/${css}` : ""}`,
);
