import { pipeline } from "@huggingface/transformers"
import type { PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"
import { useConfig } from "../../config"

const {
  config
} = await useConfig()

export type GenerationFunctionParameters = Record<string, any>

export async function useTranslation(model?: string, opts?: PretrainedModelOptions) {
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline<"translation">("translation", model, options)

  function translator(texts: string | string[], config?: GenerationFunctionParameters) {
    return pipe(texts, config)
  }

  return {
    options,
    ...pipe,
    translator,
  }
}
