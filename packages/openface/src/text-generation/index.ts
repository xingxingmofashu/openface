import { useConfig } from "@/config"
import { pipeline, type Chat, type PretrainedModelOptions, type TextGenerationConfig } from "@huggingface/transformers"
import { defu } from "defu"

const { config: { huggingface: { pretrained } } } = await useConfig()

export class TextGeneration {
  private model: string
  private options?: PretrainedModelOptions = {
    ...pretrained.model
  }

  constructor(model: string, options?: PretrainedModelOptions) {
    this.model = model
    this.options = defu(options, this.options)
  }
  
  async generator(messages: string | string[] | Chat | Chat[], config?: Partial<TextGenerationConfig>) {
    const pipe = await pipeline('text-generation', this.model,this.options)
    return pipe(messages, config);
  }
}