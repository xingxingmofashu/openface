import { useConfig } from "@/config"
import { pipeline, type Chat, type PretrainedModelOptions, type TextGenerationConfig } from "@huggingface/transformers"
import { defu } from "defu"

const { config: { huggingface: { pretrained } } } = await useConfig()

export async function useTextGeneration(model: string, opts?: PretrainedModelOptions) {
  const options = defu(opts, {
    ...pretrained.model
  })
  const pipe = await pipeline('text-generation', model, options)

  async function generator(messages: string | string[] | Chat | Chat[], config?: Partial<TextGenerationConfig>) {
    return pipe(messages, config)
  }

  return {
    options,
    ...pipe,
    generator
  }
}