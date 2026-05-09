import { useConfig } from "../../config"
import { pipeline, type Message, type PretrainedModelOptions } from "@huggingface/transformers"
import { defu } from "defu"

export type TextGenerationConfig = Record<string, any> & {
  stream?: boolean
}

export async function useTextGeneration(model: string, opts?: PretrainedModelOptions) {
  const { config } = await useConfig({ syncTransformersEnv: true })
  const options = defu(opts, {
    cache_dir: config.CACHE_DIR,
  })
  const pipe = await pipeline("text-generation", model, options)

  async function generator(
    texts: string | string[] | Message[] | Message[][],
    options?: Partial<TextGenerationConfig>,
  ) {
    if (options?.stream) {
      const { TextStreamer } = await import("@huggingface/transformers")
      options.streamer = new TextStreamer(pipe.tokenizer, { skip_prompt: true })
    }
    return pipe._call(texts, options)
  }

  return {
    options,
    tokenizer: pipe.tokenizer,
    generator,
  }
}
