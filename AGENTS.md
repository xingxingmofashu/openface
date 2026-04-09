# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bun workspace with two packages under `packages/`:

- `packages/openface/`: the CLI application. Main entry is `src/index.ts`.
- `packages/docs/`: the Mintlify docs site. Navigation is configured in `docs.json`.

Inside `packages/openface/src/`:

- `cli/commands/` contains yargs command modules such as `pull`, `run`, `list`, `remove`, and `config`.
- `cli/utils/` contains shared terminal helpers like the REPL and UI styling.
- `tasks/` contains Hugging Face pipeline and model-download logic.
- `config/` contains default config values and config/model registry loading.

## Build, Test, and Development Commands

- `bun install`: install all workspace dependencies from the repo root.
- `bun dev`: run the CLI entrypoint from the root workspace.
- `bun run docs:dev`: start the Mintlify docs site from the repo root.
- `bun run docs:validate`: validate the docs build from the repo root.
- `bun typecheck`: run TypeScript checks across the workspace.
- `bun run --cwd packages/openface --conditions=browser src/index.ts --help`: inspect the live CLI.
- `mint validate` from `packages/docs/`: validate the docs build.

Example:

```bash
bun run --cwd packages/openface --conditions=browser src/index.ts pull Helsinki-NLP/opus-mt-zh-en
```

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation, no semicolons, and a 120-character line width. Prefer single quotes. Follow
existing naming patterns: files in kebab-case, functions and variables in camelCase, types and command modules in
PascalCase where applicable. Keep command handlers thin and move model logic into `tasks/`.

## Testing Guidelines

There is no dedicated test framework in the repository yet. For now, contributors should run `bun typecheck`, verify
CLI help output locally, and validate docs with `mint validate` when touching `packages/docs/`. If you add tests, place
them near the related source as `*.test.ts` and keep external model/network dependencies mocked.

## Commit & Pull Request Guidelines

Recent history follows a lightweight conventional style: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. Keep
commit subjects short and imperative, for example `fix: update pull error message`.

Pull requests should include:

- a short summary of behavior changes
- linked issues when relevant
- command output or screenshots for CLI/docs changes
- notes on verification performed

## Configuration Tips

User config is stored under `~/.config/openface/`, and model cache defaults to `~/.local/share/openface/models`. Avoid
hardcoding machine-specific paths in code or docs.
