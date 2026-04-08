import { useConfig } from "../../config"
import { pipeline, type PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"

const {
  config
} = await useConfig()

export type GenerationFunctionParameters = Record<string, any>

export async function useText2TextGeneration(model: string, opts?: PretrainedModelOptions) {
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline("text2text-generation", model, options)

  async function generator(texts: string, options?: Partial<GenerationFunctionParameters>) {
    return pipe(texts, options)
  }

  return {
    options,
    ...pipe,
    generator,
  }
}
