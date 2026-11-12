# Install the plugin

A user adds this repository as a Claude Code marketplace named `cursor-plugins` and installs `pstack@cursor-plugins`. Claude Code copies `harness/pstack/claude-code/` into its plugin cache and enables it for the user.

## Sub-features

- `install-marketplace` adds the marketplace from a path or GitHub repo.
- `install-plugin` installs pstack at the version in `harness/pstack/claude-code/plugin.json`.
- `install-list` lists pstack as enabled and read from the checkout.
- `install-toggle` disables and re-enables pstack, which removes and restores its commands.

## How to get to it (user POV)

- `claude plugin marketplace add <repo path or owner/repo>`, then `claude plugin install pstack@cursor-plugins`.
- `/plugin` inside an interactive session. A headless run can't reach this, so report it as not driven.
- A project `.claude/settings.json` with `extraKnownMarketplaces` and `enabledPlugins`, as this repo ships.

## Driving it with control-pstack

Preconditions:

- No run exists yet, or you picked a new `VERIFY_PSTACK_RUN`.

- **Install.** Run `eval "$($C launch | tail -1)"`. `artifacts/install.txt` shows `Successfully added marketplace: cursor-plugins`, `Successfully installed plugin: pstack@cursor-plugins`, and a list entry with `Status: ✔ enabled`.
- **Health.** Run `$C doctor`. It prints `doctor: OK` and an `installed:` line ending in `(matches tree)`.
- **Disable.** Run `$C plugin disable pstack@cursor-plugins`, then `$C run commands-off "Reply with just OK" --max-turns 1`. The summary shows `pstack slash commands: 0`.
- **Re-enable.** Run `$C plugin enable pstack@cursor-plugins`, then `$C run commands-2 "Reply with just OK" --max-turns 1`. The summary shows `pstack slash commands: 58`, or the current count of skill folders in `harness/pstack/claude-code/skills/`.

## Gotchas

- The marketplace name comes from `.claude-plugin/marketplace.json` (`cursor-plugins`), not from the repo name.
- `pstack` in that marketplace points at `./harness/pstack/claude-code`. Editing only `pstack/` changes nothing a Claude Code user sees until the tree is regenerated.
- Doctor's `Version:` comes from `plugin.json`. Two different trees with the same version still both pass the version check, so rely on the `matches tree` line.
