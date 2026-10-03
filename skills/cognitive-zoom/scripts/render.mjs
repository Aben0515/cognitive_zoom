#!/usr/bin/env node
/**
 * Cognitive Zoom - Standalone HTML Viewer Renderer (Node.js)
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateAST } from "./validate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, "../assets");

export function renderStandaloneHtml(astData) {
  const nodes = astData.nodes || [];
  const issues = validateAST(nodes);
  if (issues.some((i) => i.severity === "high")) {
    console.warn("AST validation warnings:", issues);
  }

  const templatePath = join(ASSETS_DIR, "viewer.template.html");
  let template = readFileSync(templatePath, "utf-8");

  // Read vendor files
  const vendorDir = join(ASSETS_DIR, "vendor");
  const markedJs = readFileSync(join(vendorDir, "marked.min.js"), "utf-8");
  const purifyJs = readFileSync(join(vendorDir, "purify.min.js"), "utf-8");
  const highlightJs = readFileSync(join(vendorDir, "highlight.min.js"), "utf-8");
  const highlightCss = readFileSync(join(vendorDir, "github-dark.min.css"), "utf-8");

  // Replace placeholders safely
  template = template.replace("/* __HIGHLIGHT_CSS__ */", () => highlightCss);
  template = template.replace("/* __MARKED_JS__ */", () => markedJs);
  template = template.replace("/* __PURIFY_JS__ */", () => purifyJs);
  template = template.replace("/* __HIGHLIGHT_JS__ */", () => highlightJs);
  template = template.replace("/* __DATA_JSON__ */", () => JSON.stringify(astData));

  return template;
}

// CLI handler
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node render.mjs <input.json> [--out <output.html>]");
    process.exit(0);
  }

  const inputFile = args[0];
  let outFile = "zoom-viewer.html";
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1 && args[outIdx + 1]) {
    outFile = args[outIdx + 1];
  }

  const raw = readFileSync(inputFile, "utf-8");
  let data;
  if (raw.trim().startsWith("{") && !raw.trim().includes("\n{")) {
    data = JSON.parse(raw);
  } else {
    // NDJSON
    const nodes = [];
    raw.split("\n").forEach((l) => {
      const s = l.trim();
      if (s && !s.startsWith("```")) {
        try {
          nodes.push(JSON.parse(s));
        } catch (e) {}
      }
    });
    data = { question: "認知縮放回答", nodes: nodes, preferred_zoom: 2.0 };
  }

  const html = renderStandaloneHtml(data);
  mkdirSync(dirname(resolve(outFile)), { recursive: true });
  writeFileSync(outFile, html, "utf-8");
  console.log(`✔ 獨立可互動 HTML 已生成：${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
}
