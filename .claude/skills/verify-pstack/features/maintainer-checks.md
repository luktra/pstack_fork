# Maintainer checks

These are the gates that keep what users install consistent with the source. They check the marketplace and plugin manifest schemas, that the generated Claude Code tree matches `pstack/`, that the docs match the skills tree, and the skill script tests. CI runs them on pull requests.

## Sub-features

- `check-schema`: `scripts/validate-plugins.mjs` validates every marketplace and `plugin.json`.
- `check-tree`: `scripts/generate-pstack-harness-trees.mjs --check` reports `harness/pstack is up to date.`
- `check-docs`: `scripts/check-pstack-docs.mjs` reports `0 problems`.
- `check-tests`: the `pstack/skills/*/scripts/test/*.test.ts` suites pass.

## How to get to it (user POV)

- A maintainer runs the scripts from the repo root.
- CI runs `.github/workflows/validate-plugins.yml` on pull requests that touch pstack, harness, scripts or manifests.

## Driving it with control-pstack

Preconditions:

- A launched run exists, because `checks` writes its log into the run's artifacts.

- **All gates.** Run `$C checks`. Every step prints `pass` and the command exits 0. `artifacts/checks.txt` contains `All plugins validated successfully.`, `harness/pstack is up to date.`, `0 problems`, and a test footer with `# fail 0`.
- **A stale tree is caught.** Append a line to any `pstack/skills/*/SKILL.md`, then run `node scripts/generate-pstack-harness-trees.mjs --check`. It exits non-zero. Revert the edit with `git checkout -- pstack/skills` and rerun the check, which now passes.

## Gotchas

- Run the generator without `--check` after you edit `pstack/`, then commit `harness/pstack/` too. CI fails otherwise.
- About 67 tests are skipped by design, so `# skipped` isn't a failure. Only `# fail` counts.
- The test suites take about 75s.
