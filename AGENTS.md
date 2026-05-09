# Repository Guidelines

## Workspace Layout

Bun workspace with two packages under `packages/`:

- `packages/openface/` — CLI application
- `packages/docs/` — Mintlify docs site

Install once from the repo root: `bun install`

## Key Commands

| Command                 | Notes                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `bun install`           | Root only; installs all workspace deps                                                |
| `bun run build`         | Delegates to `packages/openface/scripts/build.ts`; builds all cross-platform binaries |
| `bun dev`               | Runs CLI source directly via `--conditions=browser`; no build step needed             |
| `bun typecheck`         | Runs `tsc --noEmit` across the workspace; also runs as pre-commit hook                |
| `bun run docs:dev`      | Starts Mintlify dev server for `packages/docs/`                                       |
| `bun run docs:validate` | Validates docs build                                                                  |

To build only the current platform (faster):

```bash
bun run scripts/build.ts --single
```

Run from `packages/openface/` or as `bun run --cwd packages/openface build`.

## Build Output

Build produces per-platform subdirectories, not a single binary:

```
packages/openface/dist/openface-darwin-arm64/bin/openface
packages/openface/dist/openface-linux-x64/bin/openface
...
```

The installer (see `packages/openface/bin/openface`) auto-selects the correct platform binary from `node_modules/` at runtime using AVX2 and musl detection.

## CLI Launcher

`packages/openface/bin/openface` is a plain Node.js script (not Bun). It resolves the compiled binary by walking up the directory tree looking for `node_modules/<platform-dir>/bin/openface`. Override with `OPENFACE_BIN_PATH` env var to point directly to a binary.

For development, use `bun dev` (source) or build with `--single` and run the resulting binary directly.

## Source Structure (`packages/openface/src/`)

- `index.ts` — yargs CLI entrypoint; registers all commands
- `cli/commands/` — thin yargs command modules: `pull/`, `run/`, `list.ts`, `remove.ts`, `config/`
- `cli/utils/` + `cli/repl/` — shared terminal helpers, REPL creation
- `tasks/` — model execution logic; subdirs: `pull/`, `text-generation/`, `text2text-generation/`, `translation/`
- `config/` — default config values and runtime config/model registry loading

Keep command handlers thin; put model logic in `tasks/`.

## `run` Command Scope

`run` only supports three task types: `translation`, `text-generation`, and `text2text-generation`. Adding a new runnable task requires a new subdirectory under `tasks/` and a handler in `cli/utils/createRepl`.

`pull` supports 25 task types defined in `src/tasks/pull/tasks.ts`. Pulling works for any supported task; running is a separate, narrower concern.

## TypeScript / Build Quirks

- Both `bun dev` and the build use `--conditions=browser` (set in `packages/openface/tsconfig.json` as `customConditions: ["browser"]`). Without this condition, `@huggingface/transformers` resolves differently.
- `OPENFACE_VERSION` and `OPENFACE_LIBC` are injected as compile-time `define` constants in `scripts/build.ts`. They are not available in `bun dev`.
- The root `tsconfig.json` has empty `compilerOptions`; the package-level one adds `customConditions`.

## Pre-commit Hook

`bun typecheck` runs automatically on every commit (husky `pre-commit`). Fix type errors before committing or the commit will be rejected.

## Runtime Config Paths

- Config: `~/.config/openface/config.json`
- Model registry: `~/.config/openface/model.json`
- Model cache: `~/.local/share/openface/models/` (overridable via `CACHE_DIR` config key)

Do not hardcode these paths in code or docs.

## Coding Style

TypeScript, 2-space indent, no semicolons, 120-char line width, single quotes. Prettier config is in root `package.json`. Files: kebab-case. Functions/variables: camelCase.

## Testing

No test framework yet. Verification steps in order:

1. `bun typecheck` — must pass; blocks commits
2. `packages/openface/bin/openface --help` — smoke-test CLI wiring
3. `bun run docs:validate` / `mint validate` (from `packages/docs/`) — when touching docs

If adding tests, place them as `*.test.ts` next to the source file and mock external model/network calls.

## Release Flow

CI builds on `v*` tag push or `workflow_dispatch`. It runs `bun run build` from `packages/openface/`, packages per-platform dirs as `.tar.gz` / `.zip`, generates `sha256sum` checksums, and creates a GitHub Release. Releases with `-` in the tag (e.g. `v1.0.0-beta.1`) are marked pre-release automatically.

## Commit Style

Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`. Short imperative subject line.
