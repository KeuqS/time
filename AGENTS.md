<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Pull requests

## Screenshots

PRs that change what users see carry screenshots in the PR description.

- **Attach them with the GitHub CLI only**: `gh pr create --attach` or `gh pr edit --attach` (gh 2.101+). Reference each file in the body as `![alt](./file.png)`, and gh rewrites the reference to the uploaded asset. Don't commit screenshots to the repo or push them to asset branches such as `pr-assets/*`. Save them outside the repository so they never get committed.
- Take them in a real browser, from the demo or the docs, not from mocks.
- **UI fixes** (bug fixes, restyles, changed behaviour): a before/after table.

  | | Before | After |
  | --- | --- | --- |
  | Week view, dark | ![Week view before, dark](./before-week-dark.png) | ![Week view after, dark](./after-week-dark.png) |

- **New UI** (new features, views or parts): a light/dark table, or simply screenshots of the demo UI.

  | | Light | Dark |
  | --- | --- | --- |
  | Year view | ![Year view, light](./year-light.png) | ![Year view, dark](./year-dark.png) |

- PRs without visible UI changes need no screenshots.
- Example of the table layout: https://github.com/Moltenship/time/pull/125

```bash
# body.md holds the table and references ./before-week-dark.png and ./after-week-dark.png
gh pr create --title "…" --body-file body.md \
  --attach './before-week-dark.png#Week view before, dark' \
  --attach './after-week-dark.png#Week view after, dark'

# Add or replace screenshots on an open PR
gh pr edit 123 --body-file body.md --attach ./before.png --attach ./after.png
```
