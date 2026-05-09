import os from "node:os"
import { resolve } from "node:path"

export const OPENFACE_APP_DIR = "openface"
const cacheDir = resolve(os.homedir(), `.local/share/${OPENFACE_APP_DIR}/models/`)

export const config = {
  LOG_LEVEL: 40,
  REMOTE_HOST: "https://huggingface.co",
  CACHE_KEY: "transformers-cache",
  CACHE_DIR: cacheDir,
  LOCAL_MODEL_PATH: cacheDir,
  REMOTE_PATH_TEMPLATE: "{model}/resolve/{revision}/",
  ALLOW_LOCAL_MODELS: true,
  ALLOW_REMOTE_MODELS: true,
}
