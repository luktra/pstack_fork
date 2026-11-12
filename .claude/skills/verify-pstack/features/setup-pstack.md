# Configure models with setup-pstack

`/pstack:setup-pstack` detects the models the `Agent` tool accepts and asks for a reasoning budget. It maps each pstack role to `<model> <effort>` or `inherit-parent`, and writes `~/.claude/rules/pstack-models.md`. Every later Claude Code session loads that rule, so pstack skills pick their subagent models from it.

## Sub-features

- `setup-detect` names the `Agent` models (`opus`, `sonnet`, `haiku`, `fable`) and their efforts.
- `setup-budget` maps `unlimited`, `large`, `medium` and `small` to Opus at `max`, `xhigh`, `high` and `medium`. `inherit-parent` doesn't change.
- `setup-write` writes `~/.claude/rules/pstack-models.md` with no frontmatter, a `# budget:` line, and 17 role lines.
- `setup-loaded` makes a later session load the rule into context.
- `setup-rerun` rereads an existing rule and treats it as the current state.

## How to get to it (user POV)

- Type `/pstack:setup-pstack` in an interactive session and answer the budget and role questions.
- In a headless session, type `/pstack:setup-pstack` followed by the answers.

## Driving it with control-pstack

Preconditions:

- `$C doctor` prints `doctor: OK`.
- `$C files` lists no `home/.claude/rules/pstack-models.md`.

- **Run the skill.** Run `$C run setup "/pstack:setup-pstack My answers up front, do not ask: budget small. Accept the role table as-is. Skip the optional verification-skill offers." --permission-mode acceptEdits --max-turns 30`. The summary shows `result: success` and a `Write(.../home/.claude/rules/pstack-models.md)` tool call. `permission denials` lists that same Write, because the path is sensitive.
- **Inspect the attempted content.** In `artifacts/setup.jsonl`, the result event's `permission_denials[0].tool_input.content` has `# budget: small (medium)`, `judgment and prose: opus medium`, and every Grok-default role as `inherit-parent`.
- **Approve as the user.** Run `$C approve setup`. It prints `approved and wrote: .../home/.claude/rules/pstack-models.md`.
- **Loaded in a new session.** Run `$C run setup-loaded "Is a pstack model configuration rule in your context? If so, quote its budget line and the value for 'judgment and prose' exactly. Do not use tools." --max-turns 1`. The final text quotes `# budget: small (medium)` and `judgment and prose: opus medium`.
- **Re-run.** Run `$C run setup-rerun "/pstack:setup-pstack My answers up front, do not ask: budget large. Accept the role table as-is. Skip the optional offers." --permission-mode acceptEdits --max-turns 30`. The transcript reads the existing rule first, and the denied Write's content has `# budget: large (xhigh)` and `opus xhigh`.

## Gotchas

- Headless sessions can't write the rule themselves. See the sensitive-path gotcha in `SKILL.md`. Report the denial, then approve it.
- With no answers in the prompt, the skill asks in plain text and the run ends with no Write. That is correct behavior, not a failure.
- The rule must never land in `CLAUDE.md` or `AGENTS.md`. Fail the run if the transcript writes either one.
