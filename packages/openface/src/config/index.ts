import os from "node:os"
import { resolve } from "node:path"
import Bun from "bun"
import { name } from "../../package.json"
import { env } from "@huggingface/transformers"
import { defu } from "defu"
import { config as defaultConfig, type Config } from "./default"

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
    await modelFile.write(
      JSON.stringify(
        {
          provider: {},
        },
        null,
        2,
      ),
    )
  }

  const config = defu((await Bun.file(GLOBAL_CONFIG_PATH).json()) as Config, defaultConfig)
  Object.assign(env, config.huggingface.env)

  return {
    GLOBAL_CONFIG_PATH,
    GLOBAL_MODEL_CONFIG_PATH,
    config,
    file: {
      config: file,
      model: modelFile,
    },
  }
}
