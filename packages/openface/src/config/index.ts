import os from "node:os"
import { resolve } from "node:path"
import Bun from "bun"
import { name } from "../../package.json"
import { env } from "@huggingface/transformers"
import { defu } from "defu"
import { config as defaultConfig } from "./default"
import type { ModelEntry } from "@huggingface/hub"

export interface Config {
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

export async function useConfig() {
  const CONFIG_PATH = resolve(os.homedir(), ".config", name, `config.json`)
  const MODEL_CONFIG_PATH = resolve(os.homedir(), ".config", name, `model.json`)

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
  }) as Config

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
