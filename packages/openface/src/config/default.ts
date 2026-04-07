import os from "node:os"
import { resolve } from "node:path"
import { name } from "../../package.json"
import { env, LogLevel } from "@huggingface/transformers"
import { defu } from "defu"
import type {
  DataType,
  DeviceType,
  PretrainedModelOptions,
  PretrainedTokenizerOptions,
  PretrainedProcessorOptions,
} from "@huggingface/transformers"
import type { TransformersEnvironment } from "."

export type Config = typeof config

const cacheDir = resolve(os.homedir(), `.local/share/${name}/models/`)
export const config = {
  huggingface: {
    env: defu(
      {
        logLevel: LogLevel.ERROR,
        cacheDir,
        localModelPath: cacheDir,
      } as TransformersEnvironment,
      env,
    ),
    pretrained: {
      model: {
        cache_dir: cacheDir,
        device: "auto" as DeviceType,
        dtype: "auto" as DataType,
      } as PretrainedModelOptions,
      tokenizer: {} as PretrainedTokenizerOptions,
      processor: {} as PretrainedProcessorOptions,
    },
  },
}
