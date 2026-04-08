import os from "node:os"
import { resolve } from "node:path"
import { name } from "../../package.json"
import { env, LogLevel } from "@huggingface/transformers"

const cacheDir = resolve(os.homedir(), `.local/share/${name}/models/`)

export const config = {
  LOG_LEVEL: LogLevel.ERROR,
  REMOTE_HOST: env.remoteHost,
  CACHE_KEY: env.cacheKey,
  CACHE_DIR: cacheDir,
  LOCAL_MODEL_PATH: cacheDir,
  REMOTE_PATH_TEMPLATE: env.remotePathTemplate,
  ALLOW_LOCAL_MODELS: env.allowLocalModels,
  ALLOW_REMOTE_MODELS: env.allowRemoteModels,
}