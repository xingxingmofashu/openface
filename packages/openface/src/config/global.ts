import os from 'node:os'
import { resolve } from 'node:path'
import Bun from 'bun'
import { name } from '../../package.json'
import consola from 'consola'

export function useGlobal() {
  const GLOBAL_CONFIG_PATH = resolve(os.homedir(), '.config', name, `config.json`)

  const config = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    ref: "Config",
    type: "object",
    properties: {
      $schema: {
        description: "JSON schema reference for configuration validation",
        type: "string"
      },
    },
    local: {
      models_cache_dir: resolve(os.homedir(), `.local/share/${name}/models`)
    },
    tasks: {
      translation: {
        default: {
          model: "Xenova/t5-small",
          src_lang: "zho_Hans",
          tgt_lang: "eng_Latn"
        }
      }
    }
  }

  Bun.write(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2),).catch(consola.error)

  return {
    config
  }
}