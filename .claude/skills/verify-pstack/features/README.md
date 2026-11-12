# pstack verification map

This directory is the maintained source for verifying what a Claude Code user experiences with pstack. Read the index, then use the matching feature file as the recipe.

## Baseline preconditions

- Run from the repo root with `C=.claude/skills/verify-pstack/scripts/control-pstack`.
- `node scripts/generate-pstack-harness-trees.mjs --check` passes, because launch refuses a stale tree.
- `eval "$($C launch | tail -1)"` has created a fresh run, and `$C doctor` prints `doctor: OK`.
- `claude` is on `PATH` and the environment can reach the API, because headless sessions spend real money.
- Never point the helper at a real `~/.claude`. Every session runs as the isolated user in `/tmp/verify-pstack/<run-id>/home`.

## Driving conventions

- Type prompts exactly as a user would, starting with `/pstack:<skill>`.
- Put the user's answers in the prompt, because headless sessions cannot show `AskUserQuestion`.
- Pass `--max-turns` on every `run`.
- Use a new `run` name for each attempt, so earlier evidence is never overwritten.
- Launch a new run after editing `pstack/` or `harness/`, because the install is a snapshot copy.

## Proof and skip reporting

- A session's proof is `artifacts/<name>.summary.txt` together with `artifacts/<name>.jsonl`.
- File side effects need `$C files` output and the file contents.
- A config change needs a second session that shows it loaded.
- Report each permission denial by its path, and say whether you then approved it.
- Report an unreachable path with the command you tried and the precondition that wasn't met.
- Never report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file has an H1 title and a one-paragraph description. Then come four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-pstack`, and `Gotchas`.

## Features

- [Install the plugin](./install.md) covers adding the marketplace, installing, enabling and disabling pstack, and listing it.
- [Slash commands and agents](./slash-commands.md) covers that every pstack skill shows up as `/pstack:<name>`, that the agents load, and that a command actually runs.
- [Configure models with setup-pstack](./setup-pstack.md) covers `/pstack:setup-pstack` writing `~/.claude/rules/pstack-models.md`, and a later session loading it.
- [Maintainer checks](./maintainer-checks.md) covers the CI gates that keep the installed tree, the docs and the manifests honest.
