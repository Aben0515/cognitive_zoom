/**
 * Unit test for DSH Cognitive Zoom render.mjs & validate.mjs
 */

import assert from "node:assert";
import { validateAST } from "./validate.mjs";
import { renderStandaloneHtml } from "./render.mjs";

console.log("Running DSH Cognitive Zoom Node.js render & validation tests...");

const sampleAST = {
  question: "測試 epoll 與 select",
  preferred_zoom: 2.0,
  nodes: [
    { id: "n1", parent_id: null, level: 0, kind: "tldr", content: "一句話結論" },
    { id: "n2", parent_id: "n1", level: 1, kind: "card", content: "重點卡片" },
    { id: "n3", parent_id: "n2", level: 2, kind: "code", code: { lang: "c", source: "int a = 1;" } },
    { id: "n4", parent_id: "n3", level: 3, kind: "paragraph", content: "內部原理" },
    { id: "n5", parent_id: "n4", level: 4, kind: "asm", code: { lang: "x86asm", source: "mov rax, 232" } },
  ],
};

// 1. Validation test
const issues = validateAST(sampleAST.nodes);
assert.strictEqual(issues.filter((i) => i.severity === "high").length, 0, "AST should have 0 high severity issues");

// 2. Render test
const html = renderStandaloneHtml(sampleAST);
assert(html.includes("<!DOCTYPE html>"), "HTML must have doctype");
assert(html.includes("一句話結論"), "HTML must contain embedded content");
assert(html.includes("cognitiveSlider"), "HTML must contain slider widget");
assert(html.includes("DOMPurify"), "HTML must inline DOMPurify");
assert(html.includes("marked"), "HTML must inline marked");

console.log(`✔ All DSH render tests passed! HTML size: ${(html.length / 1024).toFixed(1)} KB`);
