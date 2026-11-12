#!/usr/bin/env node
// Stands in for a user who clicks "Approve" on a write prompt. Headless `claude -p` cannot approve writes to
// sensitive paths such as ~/.claude/rules/, so it records them as permission denials. This applies each denied
// Write whose path is inside the isolated HOME, and refuses every other path.
// Usage: node apply-denied-writes.mjs <transcript.jsonl> <isolated home dir>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

const [transcript, home] = process.argv.slice(2);
const root = resolve(home) + sep;
const result = readFileSync(transcript, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).findLast((e) => e.type === "result");
const writes = (result?.permission_denials ?? []).filter((d) => d.tool_name === "Write");
if (writes.length === 0) {
  console.log("no denied writes");
  process.exit(1);
}
for (const { tool_input: { file_path, content } } of writes) {
  const target = resolve(file_path);
  if (!target.startsWith(root)) {
    console.log(`refused (outside ${root}): ${target}`);
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`approved and wrote: ${target} (${content.length} bytes)`);
}
