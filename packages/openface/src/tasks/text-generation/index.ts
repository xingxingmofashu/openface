import { useConfig } from "../../config"
import { pipeline, type PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"

const {
  config: {
    huggingface: { pretrained },
  },
} = await useConfig()

export type TextGenerationConfig = Record<string, any>

export async function useTextGeneration(model: string, opts?: PretrainedModelOptions) {
  const options = defu(opts, {
    ...pretrained.model,
  })
  const pipe = await pipeline("text-generation", model, options)

  async function generator(texts: string, options?: Partial<TextGenerationConfig>) {
    return pipe(texts, options)
  }

  return {
    options,
    ...pipe,
    generator,
  }
}
