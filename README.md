# OpenFace

OpenFace is a Bun + TypeScript monorepo for a local-first Hugging Face CLI and its Mintlify docs site.

## Workspace Layout

```text
.
├── package.json
├── bun.lock
├── tsconfig.json
└── packages
    ├── docs/       # Mintlify documentation
    └── openface/   # CLI implementation
```

The repository follows Bun's workspace model: install once at the root with `bun install`, then run package entrypoints
from the workspace or via `--cwd`.

## What The CLI Does

- Pull models from Hugging Face Hub into a local cache
- List and remove cached models
- Inspect merged runtime configuration
- Run pulled models in an interactive REPL

Current `run` support is limited to models whose detected task is `translation` or `text-generation`.

## Quick Start

Install dependencies:

```bash
bun install
```

Inspect the CLI:

```bash
bun run --cwd packages/openface --conditions=browser src/index.ts --help
```

Pull a model:

```bash
bun run --cwd packages/openface --conditions=browser src/index.ts pull Helsinki-NLP/opus-mt-zh-en
```

Run it:

```bash
bun run --cwd packages/openface --conditions=browser src/index.ts run Helsinki-NLP/opus-mt-zh-en
```

Useful built-in commands inside the REPL:

- `.help`
- `.copy <prompt>`
- `.exit`

## Commands

- `openface pull <modelId>`
- `openface run <modelId> [--stream]`
- `openface list`
- `openface remove <modelId...>`
- `openface config list`
- `openface config get <name>`

## Configuration

OpenFace creates and uses two files under `~/.config/openface`:

- `config.json` for runtime configuration
- `model.json` for the pulled-model registry

Model artifacts are cached under `~/.local/share/openface/models` by default.

## Development

From the repository root:

```bash
bun install
bun dev
bun typecheck
```

Docs live in `packages/docs` and the CLI lives in `packages/openface`.

## License

MIT. See `LICENSE`.
