# Slash commands and agents

Once pstack is installed, every skill folder in the tree shows up in a new session as `/pstack:<name>`. The `pstack:poteto-agent` and `pstack:comment-sicko` subagents are offered to the `Agent` tool too. Typing a command loads that skill and the agent follows it.

## Sub-features

- `cmd-listed` makes each skill folder a `pstack:<name>` slash command in the session.
- `cmd-agents` loads both pstack agents in the session.
- `cmd-runs` makes a typed `/pstack:<name>` load the skill and produce its behavior.
- `cmd-adapter` makes a Claude Code session running a pstack skill read `docs/harness/claude-code.md` from the installed plugin.

## How to get to it (user POV)

- Type `/pstack:<name>` in an interactive session, or in `claude -p "/pstack:<name> ..."`.
- Ask in plain language, for skills without `disable-model-invocation: true`.

## Driving it with control-pstack

Preconditions:

- `$C doctor` prints `doctor: OK`.

- **Listed.** Run `$C commands`. In `artifacts/commands.summary.txt`, `pstack slash commands:` equals `ls harness/pstack/claude-code/skills | wc -l`, and `pstack agents:` reads `pstack:comment-sicko, pstack:poteto-agent`.
- **A command runs.** Run `$C run how "/pstack:how where does the harness tree generator decide which files to copy? Answer in two sentences." --max-turns 12 --add-dir "$PWD"`. The summary shows `result: success`. The transcript reads files from the installed plugin cache or `$PWD`, and the final text names `scripts/generate-pstack-harness-trees.mjs`.
- **The adapter is used.** In any skill run's summary, `tool calls:` include a `Read` of `.../docs/harness/claude-code.md`.

## Gotchas

- `disable-model-invocation: true` skills, such as `bro`, `create-verification-skill` and `setup-pstack`, only run when typed as a slash command. Plain language won't trigger them.
- `bro` restates the previous message, so in a fresh session it has nothing to restate. Don't use it as a smoke test.
- The session starts in the empty `work/` repo. A skill that inspects "the project" needs `--add-dir` or a prompt that names the path.
- The first adapter `Read` sometimes goes to a wrong path such as `harness/pstack/docs/...`, and the agent then recovers. Record this. It shows that the relative link in each Claude Code SKILL.md is hard to resolve.
