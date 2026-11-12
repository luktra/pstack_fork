---
name: verify-pstack
description: Prove a pstack change works for a real Claude Code user. Installs this checkout's marketplace and the pstack plugin into a throwaway HOME, runs `/pstack:*` slash commands in headless `claude -p` sessions, and captures transcripts, written files and CI-parity checks as evidence. Use after editing anything under pstack/, harness/, scripts/ or the marketplace manifests, or when asked to verify or demo a pstack skill.
---

# Verify pstack

The product here is the pstack plugin as a Claude Code user gets it. They add this repo as a marketplace, install `pstack@cursor-plugins`, and type `/pstack:<skill>`. Claude Code installs `harness/pstack/claude-code/`, which is generated from `pstack/`. It does not install `pstack/` itself. Drive that path, not the source files.

Everything goes through one helper. From the repo root:

```bash
C=.claude/skills/verify-pstack/scripts/control-pstack
```

Each run lives in `/tmp/verify-pstack/<run-id>/`. Override the root with `VERIFY_PSTACK_ROOT`. The run directory holds `home/` (the isolated `HOME` and `CLAUDE_CONFIG_DIR`), `work/` (an empty git repo that each session starts in) and `artifacts/` (the evidence). The helper never touches your real `~/.claude`.

## Launch

```bash
eval "$($C launch | tail -1)"   # sets VERIFY_PSTACK_RUN; pass VERIFY_PSTACK_RUN=<name> first to pick the id
```

Launch refuses to start when `harness/pstack` is stale. If it does, run `node scripts/generate-pstack-harness-trees.mjs` and launch again. Next it runs `claude plugin marketplace add <repo>`, `claude plugin install pstack@cursor-plugins` and `claude plugin list` as the isolated user, and logs all three to `artifacts/install.txt`. It's ready when the last line prints `export VERIFY_PSTACK_RUN=...`.

The install **copies** the tree into `home/.claude/plugins/cache/`. If you edit pstack after launching, launch a new run. Doctor catches this.

## Doctor

```bash
$C doctor
```

This is read-only. Doctor checks that the plugin is installed, enabled and read from this checkout, that the installed version matches `harness/pstack/claude-code/plugin.json`, that the harness tree is fresh, and that the installed copy is byte-identical to the tree. Run it first, and again whenever anything looks off. It prints `doctor: OK`, or a `FAIL:` line followed by a non-zero exit.

## Drive

| Command | What it does |
| --- | --- |
| `$C commands` | One cheap session (about $0.15). Its summary shows the pstack slash-command count and the agents the session loaded. |
| `$C run <name> "<prompt>" [claude args...]` | One headless `claude -p` session in `work/`, as the isolated user. Type a slash command exactly as a user would, such as `"/pstack:how where is X handled"`. The isolated home is always passed as `--add-dir`. Without that, reads of the installed plugin's adapter doc are denied and skills quietly fall back to Cursor paths. Extra args pass straight to `claude`. Useful ones are `--max-turns N`, `--permission-mode acceptEdits` and `--add-dir <path>`. |
| `$C approve <name>` | Stands in for the user clicking **Approve** on the Write prompts that run `<name>` was denied. It applies only writes inside the isolated home. See the gotcha below. |
| `$C plugin <args>` | `claude plugin <args>` as the isolated user, for example `disable pstack@cursor-plugins`. |
| `$C files` | Lists the files under the isolated home and workspace, so you can show what a run wrote. |
| `$C checks` | CI parity, as in `.github/workflows/validate-plugins.yml`: plugin schema validation, harness freshness, the docs drift check and the skill script tests. The tests take about 75s. |

Headless sessions have no `AskUserQuestion`, so pstack skills ask in plain text and then stop. Put the user's answers in the prompt (for example, "My answers up front, do not ask: budget small"), or chain runs with `--resume <session_id>` from the transcript.

Each run costs real API money, which the summary line reports. Keep `--max-turns` tight.

## Evidence

`run` writes these files to `artifacts/<name>.*`:
- `prompt.txt`: the exact input.
- `jsonl`: the full stream-json transcript.
- `stderr.txt` and `exit.txt`.
- `summary.txt`: model, installed plugin and version, pstack command and agent counts, every tool call, every permission denial, and the final text.

Proof standards:

- Use the real user path. That means a `/pstack:<skill>` prompt in a session that loaded the installed plugin. Pasting a SKILL.md into a prompt doesn't count.
- Capture the action and the result. Keep the transcript and summary, plus `files` output or `cat` of every file the skill should have written.
- Prove side effects in a **second session** where that matters. For example, start a new session and ask it to quote the rule that setup-pstack wrote. That proves Claude Code loaded the file, not just that the file exists.
- A permission denial is a finding, not a pass. Report it, then `approve` it only if a real user would approve that prompt.
- Quote file paths from the transcript. The agent in a session sometimes resolves skill-relative links wrongly before finding the right file. That's real behavior, so record it and don't hide it.

## Cleanup

```bash
$C cleanup
```

This removes `home/` and `work/` for the current run only, and keeps `artifacts/`. It never kills processes, because sessions are foreground and exit on their own. Evidence for every run stays in `/tmp/verify-pstack/<run-id>/artifacts/` until you delete it yourself.

## Feature map

See [features/README.md](features/README.md). Pick the feature your change touches and follow its recipe. If a feature has several entry points, prove each one.

## Gotchas

- **Writes to `~/.claude/rules/` are flagged as sensitive.** Neither `--permission-mode acceptEdits` nor `--allowedTools 'Write(...)'` lets `claude -p` write there, so the Write turns up in the result's `permission_denials`. An interactive user would see an approval prompt instead. Use `approve`.
- **Don't** turn permission checks off in nested sessions (`bypassPermissions`). A supervising agent's safety checks may refuse it, and it would hide the prompts a user really sees.
- **The parent session leaks into the child.** The helper strips variables like `CLAUDE_CODE_SESSION_ID` and `CLAUDE_CODE_MESSAGING_*` so a child session doesn't attach to the parent's transcript. If you call `claude` yourself, go through `as_user` in the helper.
- **The repo's `.claude/settings.json` enables `pstack@cursor-plugins` from GitHub.** Sessions start in `work/`, not in the repo, so that setting doesn't pull the published version over your checkout.
- **`checks` installs `ajv`, `ajv-formats` and `fast-check` with `npm install --no-save`** into the repo's `node_modules/`, which is gitignored. It skips this if they're already there.
