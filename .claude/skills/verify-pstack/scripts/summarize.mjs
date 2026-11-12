#!/usr/bin/env node
// Summarizes a `claude -p --output-format stream-json --verbose` transcript: what the session loaded, which tools it
// called, and how it ended. Usage: node summarize.mjs <transcript.jsonl>
import { readFileSync } from "node:fs";

const events = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).flatMap((line) => {
  try { return [JSON.parse(line)]; } catch { return []; }
});
const init = events.find((e) => e.type === "system" && e.subtype === "init");
const result = events.findLast((e) => e.type === "result");
const label = (c) => {
  const arg = c.input?.skill ?? c.input?.file_path ?? c.input?.command;
  return arg ? `${c.name}(${String(arg).slice(0, 120)})` : c.name;
};
const tools = events
  .flatMap((e) => (e.type === "assistant" ? e.message?.content ?? [] : []))
  .filter((c) => c.type === "tool_use")
  .map(label);

if (!init) console.log("init: MISSING (session never started)");
else {
  const pstack = [...new Set(init.slash_commands.filter((s) => s.startsWith("pstack:")))];
  console.log(`model: ${init.model}`);
  console.log(`plugins: ${init.plugins.filter((p) => p.path !== "builtin").map((p) => `${p.source} ${p.version ?? ""}`).join(", ") || "none"}`);
  console.log(`pstack slash commands: ${pstack.length}`);
  console.log(`pstack agents: ${init.agents.filter((a) => a.startsWith("pstack:")).join(", ") || "none"}`);
}
console.log(`tool calls: ${tools.join(" | ") || "none"}`);
if (!result) console.log("result: MISSING");
else {
  const denied = (result.permission_denials ?? []).map((d) => label({ name: d.tool_name, input: d.tool_input }));
  console.log(`permission denials (would prompt a user): ${denied.join(" | ") || "none"}`);
  console.log(`result: ${result.subtype}${result.is_error ? " (error)" : ""}, turns ${result.num_turns}, cost $${(result.total_cost_usd ?? 0).toFixed(4)}`);
  console.log(`final text: ${String(result.result ?? "").slice(0, 800)}`);
}
