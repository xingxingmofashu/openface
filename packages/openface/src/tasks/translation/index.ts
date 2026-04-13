import { pipeline } from "@huggingface/transformers"
import type { PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"
import { useConfig } from "../../config"

export type GenerationFunctionParameters = Record<string, any> & {
  stream?: boolean
}

export async function useTranslation(model?: string, opts?: PretrainedModelOptions) {
  const { config } = await useConfig({ syncTransformersEnv: true })
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline<"translation">("translation", model, options)

  async function translator(texts: string | string[], config?: GenerationFunctionParameters) {
    if (config?.stream) {
      const { TextStreamer } = await import("@huggingface/transformers")
      config.streamer = new TextStreamer(pipe.tokenizer, { skip_prompt: true })
    }
    return pipe(texts, config)
  }

  return {
    options,
    ...pipe,
    translator,
  }
}
