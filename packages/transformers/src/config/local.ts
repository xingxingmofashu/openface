import os from 'node:os'
import { resolve } from 'node:path'
import fs from 'node:fs'

export function useLocal() {
  const HOME_DIR_PATH = resolve(os.homedir(),'.config', 'transformers')
  const LOCAL_MODEL_PATH = `${HOME_DIR_PATH}/models`

  fs.mkdirSync(LOCAL_MODEL_PATH, { recursive: true })

  return {
    HOME_DIR_PATH,
    LOCAL_MODEL_PATH
  }
}