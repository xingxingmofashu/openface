#!/usr/bin/env bun

import { $ } from "bun"
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import pkg from "../package.json"

const allTargets: {
  os: string
  arch: "arm64" | "x64"
  abi?: "musl"
  avx2?: false
}[] = [
  {
    os: "linux",
    arch: "arm64",
  },
  {
    os: "linux",
    arch: "x64",
  },
  {
    os: "linux",
    arch: "x64",
    avx2: false,
  },
  {
    os: "linux",
    arch: "arm64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
    avx2: false,
  },
  {
    os: "darwin",
    arch: "arm64",
  },
  {
    os: "darwin",
    arch: "x64",
  },
  {
    os: "darwin",
    arch: "x64",
    avx2: false,
  },
  {
    os: "win32",
    arch: "arm64",
  },
  {
    os: "win32",
    arch: "x64",
  },
  {
    os: "win32",
    arch: "x64",
    avx2: false,
  },
]

const targets = allTargets

await $`rm -rf dist`

const binaries: Record<string, string> = {}
const onnxruntimePackagesDir = join(process.cwd(), "..", "..", "node_modules", ".bun")

function hasOnnxruntimeBinding(os: string, arch: "arm64" | "x64") {
  if (!existsSync(onnxruntimePackagesDir)) {
    return true
  }

  const onnxruntimePackages = readdirSync(onnxruntimePackagesDir).filter((entry) => entry.startsWith("onnxruntime-node@"))
  if (onnxruntimePackages.length === 0) {
    return true
  }

  return onnxruntimePackages.some((entry) =>
    existsSync(
      join(
        onnxruntimePackagesDir,
        entry,
        "node_modules",
        "onnxruntime-node",
        "bin",
        "napi-v6",
        os,
        arch,
        "onnxruntime_binding.node",
      ),
    ),
  )
}

for (const item of targets) {
  const name = [
    pkg.name,
    // changing to win32 flags npm for some reason
    item.os === "win32" ? "windows" : item.os,
    item.arch,
    item.avx2 === false ? "baseline" : undefined,
    item.abi === undefined ? undefined : item.abi,
  ]
    .filter(Boolean)
    .join("-")

  if (item.os === process.platform && !hasOnnxruntimeBinding(item.os, item.arch)) {
    console.warn(`skipping ${name}: missing onnxruntime native binding for ${item.os}-${item.arch}`)
    continue
  }

  console.log(`building ${name}`)
  await $`mkdir -p dist/${name}/bin`

  await Bun.build({
    conditions: ["browser"],
    tsconfig: "./tsconfig.json",
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      target: name.replace(pkg.name, "bun") as any,
      outfile: `dist/${name}/bin/openface`,
      windows: {},
    },
    entrypoints: ["./src/index.ts"],
    define: {
      OPENCODE_VERSION: `'${pkg.version}'`
    },
  })

  // Smoke test: only run if binary is for current platform
  if (item.os === process.platform && item.arch === process.arch && !item.abi) {
    const binaryPath = `dist/${name}/bin/openface`
    console.log(`Running smoke test: ${binaryPath} --version`)
    try {
      const versionOutput = await $`${binaryPath} --version`.text()
      console.log(`Smoke test passed: ${versionOutput.trim()}`)
    } catch (e) {
      console.error(`Smoke test failed for ${name}:`, e)
      process.exit(1)
    }
  }

  await $`rm -rf ./dist/${name}/bin/tui`
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version: pkg.version,
        os: [item.os],
        cpu: [item.arch],
      },
      null,
      2,
    ),
  )
  binaries[name] = pkg.version
}

export { binaries }
