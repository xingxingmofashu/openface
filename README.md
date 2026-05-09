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

| Command                             | Description                            |
| ----------------------------------- | -------------------------------------- |
| `openface pull <modelId>`           | Download a model from Hugging Face Hub |
| `openface run <modelId> [--stream]` | Run a model in the interactive REPL    |
| `openface list`                     | List cached models (`ls` alias)        |
| `openface remove <modelId...>`      | Remove cached models (`rm` alias)      |
| `openface config list`              | Print all merged runtime config keys   |
| `openface config get <name>`        | Print config entries matching a name   |

## Configuration

OpenFace creates and uses two files under `~/.config/openface`:

- `config.json` for runtime configuration
- `model.json` for the pulled-model registry

Model artifacts are cached under `~/.local/share/openface/models` by default.

## Supported Pull Tasks

`pull` understands 25 Hugging Face task types, including `translation`, `text-generation`, `text-classification`,
`summarization`, `question-answering`, `automatic-speech-recognition`, `image-classification`, and more. See
[`src/tasks/pull/tasks.ts`](packages/openface/src/tasks/pull/tasks.ts) for the full list.

`run` is intentionally narrower and currently only handles `translation` and `text-generation`.

## Development

From the repository root:

```bash
bun install
bun run build
bun dev
bun typecheck
```

The CLI launcher is `packages/openface/bin/openface`, and the build output lands in
`packages/openface/dist/<platform>/bin/openface` for each supported target platform.

## License

MIT. See `LICENSE`.
