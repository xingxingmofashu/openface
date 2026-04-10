# OpenFace

OpenFace is a Bun + TypeScript monorepo for a local-first Hugging Face CLI and its Mintlify docs site.

## Install

Install the latest published CLI binary:

```bash
curl -fsSL https://raw.githubusercontent.com/xingxingmofashu/openface/main/install | bash
```

Install a specific version:

```bash
curl -fsSL https://raw.githubusercontent.com/xingxingmofashu/openface/main/install | bash -s -- --version 0.1.0
```

By default, the installer places the binary in `~/.openface/bin/openface` and will try to add that directory to your
shell `PATH`.

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
packages/openface/bin/openface --help
```

Pull a model:

```bash
packages/openface/bin/openface pull Helsinki-NLP/opus-mt-zh-en
```

Run it:

```bash
packages/openface/bin/openface run Helsinki-NLP/opus-mt-zh-en
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
bun run build
bun dev
bun typecheck
```

The CLI launcher is `packages/openface/bin/openface`, and the build output is `packages/openface/dist/openface`.

## License

MIT. See `LICENSE`.
