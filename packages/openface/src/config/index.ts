import os from "node:os"
import { resolve } from "node:path"
import Bun from "bun"
import { name } from "../../package.json"
import { env } from "@huggingface/transformers"
import { defu } from "defu"
import { config as defaultConfig, type Config } from "./default"
import type { ModelEntry } from "@huggingface/hub"

export type TransformersEnvironment = typeof env

export async function useConfig() {
  const GLOBAL_CONFIG_PATH = resolve(os.homedir(), ".config", name, `config.json`)
  const GLOBAL_MODEL_CONFIG_PATH = resolve(os.homedir(), ".config", name, `model.json`)

  const file = await Bun.file(GLOBAL_CONFIG_PATH)
  if (!(await file.exists())) {
    await file.write(JSON.stringify({}))
  }

  const modelFile = await Bun.file(GLOBAL_MODEL_CONFIG_PATH)
  if (!(await modelFile.exists())) {
    const initModelConfig = {
      provider: {},
    }
    await modelFile.write(JSON.stringify(initModelConfig, null, 2))
  }

  const config = defu((await Bun.file(GLOBAL_CONFIG_PATH).json()) as Config, defaultConfig)
  Object.assign(env, config.huggingface.env)

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
    return (await modelFile.json())["provider"]?.[provider]?.["models"]?.[model]
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
    GLOBAL_CONFIG_PATH,
    GLOBAL_MODEL_CONFIG_PATH,
    config,
    languageModel,
    exists,
    getModelInfo,
    setModelInfo,
    removeModelInfo,
  }
}
