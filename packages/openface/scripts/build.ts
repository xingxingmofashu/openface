#!/usr/bin/env bun

import { $ } from "bun"
import pkg from "../package.json"
import path from "node:path"
import { copyFile, mkdir, readdir } from "node:fs/promises"

const singleFlag = process.argv.includes("--single")
const baselineFlag = process.argv.includes("--baseline")
const skipInstall = process.argv.includes("--skip-install")

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

const targets = singleFlag
  ? allTargets.filter((item) => {
      if (item.os !== process.platform || item.arch !== process.arch) {
        return false
      }

      // When building for the current platform, prefer a single native binary by default.
      // Baseline binaries require additional Bun artifacts and can be flaky to download.
      if (item.avx2 === false) {
        return baselineFlag
      }

      // also skip abi-specific builds for the same reason
      if (item.abi !== undefined) {
        return false
      }

      return true
    })
  : allTargets

await $`rm -rf dist`

const binaries: Record<string, string> = {}
if (!skipInstall) {
  await $`bun install --os="*" --cpu="*" @parcel/watcher@${pkg.dependencies["@parcel/watcher"]}`
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
  console.log(`building ${name}`)

  const onnxruntimeDir = path.join(
    __dirname,
    "../node_modules",
    "onnxruntime-node/bin/napi-v6",
    item.os,
    item.arch,
  )
  const onnxruntimeFiles = await readdir(onnxruntimeDir)
  const onnxruntime = onnxruntimeFiles.map((file) => path.join(onnxruntimeDir, file))

  await $`mkdir -p dist/${name}/bin`
  const runtimeDir = `dist/${name}/runtime/onnxruntime/${item.os}/${item.arch}`
  await mkdir(runtimeDir, { recursive: true })
  for (const file of onnxruntimeFiles) {
    await copyFile(path.join(onnxruntimeDir, file), path.join(runtimeDir, file))
  }

  await Bun.build({
    conditions: ["browser"],
    tsconfig: "./tsconfig.json",
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      autoloadTsconfig: true,
      autoloadPackageJson: true,
      target: name.replace(pkg.name, "bun") as any,
      outfile: `dist/${name}/bin/openface`,
      execArgv: [`--user-agent=openface/${pkg.version}`, "--use-system-ca", "--"],
      windows: {},
    },
    entrypoints: ["./src/index.ts", ...onnxruntime],
    define: {
      OPENFACE_VERSION: `'${pkg.version}'`,
      OPENFACE_LIBC: item.os === "linux" ? `'${item.abi ?? "glibc"}'` : "",
    },
  })

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
