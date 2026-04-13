import os from "node:os"
import { dirname, resolve } from "node:path"
import Bun from "bun"
import { defu } from "defu"
import { config as defaultConfig, OPENFACE_APP_DIR } from "./default"
import type { ModelEntry } from "@huggingface/hub"
import { existsSync } from "node:fs"
import { copyFile, mkdir, readdir } from "node:fs/promises"

export interface OpenFaceConfig {
  CONFIG_PATH: string
  MODEL_CONFIG_PATH: string
  LOG_LEVEL: 10 | 20 | 20 | 40 | 50
  REMOTE_HOST: string
  CACHE_KEY: string
  CACHE_DIR: string
  LOCAL_MODEL_PATH: string
  REMOTE_PATH_TEMPLATE: string
  ALLOW_LOCAL_MODELS: boolean
  ALLOW_REMOTE_MODELS: boolean
}

function prependPathEnv(key: string, path: string) {
  const delimiter = process.platform === "win32" ? ";" : ":"
  const current = process.env[key]
  const parts = (current ?? "").split(delimiter).filter(Boolean)
  if (parts.includes(path)) {
    return
  }
  process.env[key] = current ? `${path}${delimiter}${current}` : path
}

function resolveOrtRuntimeDir() {
  const execDir = dirname(process.execPath)
  const candidates = [
    // packaged layout: <root>/bin/openface and <root>/runtime/onnxruntime/<os>/<arch>
    resolve(execDir, "..", "runtime", "onnxruntime", process.platform, process.arch),
    // running from package root
    resolve(process.cwd(), "node_modules", "onnxruntime-node", "bin", "napi-v6", process.platform, process.arch),
    // running from monorepo root
    resolve(
      process.cwd(),
      "packages",
      "openface",
      "node_modules",
      "onnxruntime-node",
      "bin",
      "napi-v6",
      process.platform,
      process.arch,
    ),
  ]

  return candidates.find((path) => existsSync(path))
}

function configureOrtLibraryPath() {
  const ortRuntimeDir = resolveOrtRuntimeDir()
  if (!ortRuntimeDir) {
    return undefined
  }

  if (process.platform === "darwin") {
    prependPathEnv("DYLD_FALLBACK_LIBRARY_PATH", ortRuntimeDir)
    return ortRuntimeDir
  }

  if (process.platform === "linux") {
    prependPathEnv("LD_LIBRARY_PATH", ortRuntimeDir)
    return ortRuntimeDir
  }

  if (process.platform === "win32") {
    prependPathEnv("PATH", ortRuntimeDir)
  }

  return ortRuntimeDir
}

async function stageOrtSharedLibs() {
  const ortRuntimeDir = configureOrtLibraryPath()
  if (!ortRuntimeDir || !existsSync(ortRuntimeDir)) {
    return
  }

  const tmpDir = os.tmpdir()
  const files = await readdir(ortRuntimeDir)

  for (const file of files) {
    const isSharedLib =
      (process.platform === "darwin" && file.endsWith(".dylib")) ||
      (process.platform === "linux" && file.includes(".so")) ||
      (process.platform === "win32" && file.toLowerCase().endsWith(".dll"))
    if (!isSharedLib) {
      continue
    }
    await copyFile(resolve(ortRuntimeDir, file), resolve(tmpDir, file))
  }
}

export async function prepareTransformersRuntime() {
  try {
    await stageOrtSharedLibs()
  } catch {
    // Runtime staging is best-effort; downstream commands will show the original error if it still fails.
  }
}

export async function useConfig(opts: { syncTransformersEnv?: boolean } = {}) {
  const configDir = resolve(os.homedir(), ".config", OPENFACE_APP_DIR)
  const CONFIG_PATH = resolve(configDir, `config.json`)
  const MODEL_CONFIG_PATH = resolve(configDir, `model.json`)

  await mkdir(configDir, { recursive: true })

  const file = await Bun.file(CONFIG_PATH)
  if (!(await file.exists())) {
    await file.write(JSON.stringify({}))
  }

  const modelFile = await Bun.file(MODEL_CONFIG_PATH)
  if (!(await modelFile.exists())) {
    const initModelConfig = {
      provider: {},
    }
    await modelFile.write(JSON.stringify(initModelConfig, null, 2))
  }
  const config = defu(await Bun.file(CONFIG_PATH).json(), {
    ...defaultConfig,
    CONFIG_PATH,
    MODEL_CONFIG_PATH,
  }) as OpenFaceConfig

  await mkdir(config.CACHE_DIR, { recursive: true })

  async function mergeTransformersEnv() {
    try {
      await prepareTransformersRuntime()
      const { env } = await import("@huggingface/transformers")
      Object.assign(env, {
        logLevel: config.LOG_LEVEL,
        remoteHost: config.REMOTE_HOST,
        cacheKey: config.CACHE_KEY,
        cacheDir: config.CACHE_DIR,
        localModelPath: config.LOCAL_MODEL_PATH,
        remotePathTemplate: config.REMOTE_PATH_TEMPLATE,
        allowLocalModels: config.ALLOW_LOCAL_MODELS,
        allowRemoteModels: config.ALLOW_REMOTE_MODELS,
      } as typeof env)
    } catch {
      // Keep non-inference commands usable when optional native deps are missing.
    }
  }

  if (opts.syncTransformersEnv) {
    await mergeTransformersEnv()
  }

  function languageModel(modelId: string) {
    const [provider, model] = modelId.split("/") as [string, string]
    return {
      provider,
      model,
    }
  }

  async function exists(modelId: string) {
    const { provider, model } = languageModel(modelId)
    const modelInfo = (await modelFile.json())["provider"]?.[provider]?.["models"]?.[model]
    return !!modelInfo
  }

  async function getModelInfo(modelId: string) {
    const { provider, model } = languageModel(modelId)
    return (await modelFile.json())["provider"]?.[provider]?.["models"]?.[model] as ModelEntry
  }

  async function setModelInfo(modelId: string, modelInfo: ModelEntry) {
    const { provider, model } = languageModel(modelId)
    const setModelConfig = {
      provider: {
        [provider]: {
          models: {
            [model]: {
              ...modelInfo,
            },
          },
        },
      },
    }
    await modelFile.write(JSON.stringify(defu(setModelConfig, await modelFile.json()), null, 2))
  }

  async function removeModelInfo(modelId: string) {
    const { provider, model } = languageModel(modelId)
    const modelConfig = await modelFile.json()
    delete modelConfig["provider"][provider]["models"][model]
    await modelFile.write(JSON.stringify(modelConfig, null, 2))
  }

  return {
    config,
    languageModel,
    exists,
    getModelInfo,
    setModelInfo,
    removeModelInfo,
  }
}
