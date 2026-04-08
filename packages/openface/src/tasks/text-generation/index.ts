import { useConfig } from "../../config"
import { pipeline, type Message, type PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"

const { config } = await useConfig()

export type TextGenerationConfig = Record<string, any>

export async function useTextGeneration(model: string, opts?: PretrainedModelOptions) {
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline("text-generation", model, options)

  async function generator(
    texts: string | string[] | Message[] | Message[][],
    options?: Partial<TextGenerationConfig>,
  ) {
    return pipe._call(texts, options)
  }

  return {
    options,
    ...pipe,
    generator,
  }
}
