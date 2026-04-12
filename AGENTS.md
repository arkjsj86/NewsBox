# Repository Instructions

## Git Workflow

- Treat `origin/main` as the mainline branch.
- Do not create, keep, or switch to a local `main` branch unless the user explicitly asks.
- Keep local work on the current working branch, such as a feature branch.
- When the user asks to merge or push to main, merge the working branch into `origin/main` rather than adopting a local `main` workflow.
- If the repository or the user gives a different branch workflow explicitly, follow that more specific instruction.

## Conflict Handling For Commit/Push/PR

- When the user asks Codex to handle `commit + push + PR`, and merge conflicts occur in generated artifacts, resolve them without diff review by choosing `Mine`.
- This rule applies to generated files such as JSON outputs, log files, preview logs, temporary generated files, and similar machine-written artifacts.
- Typical examples include `data/*.json`, `*.log`, `.codex/outputs/**`, and `tmp-*` files.
- Do not apply this shortcut to hand-edited source files such as `src/**`, `scripts/**`, `docs/**`, HTML, or CSS unless the user explicitly asks for it.
