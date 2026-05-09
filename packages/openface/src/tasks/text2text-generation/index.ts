import { useConfig } from "../../config"
import { pipeline, type PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"

export type GenerationFunctionParameters = Record<string, any>

export async function useText2TextGeneration(model: string, opts?: PretrainedModelOptions) {
  const { config } = await useConfig({ syncTransformersEnv: true })
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline("text2text-generation", model, options)

  async function generator(texts: string, options?: Partial<GenerationFunctionParameters>) {
    return pipe(texts, options)
  }

  return {
    options,
    tokenizer: pipe.tokenizer,
    generator,
  }
}
