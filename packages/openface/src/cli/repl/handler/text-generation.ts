import type { Message, TextGenerationOutput } from "@huggingface/transformers"
import { prepareTransformersRuntime } from "../../../config"
import { type ReplHandler } from ".."

export const createTextGenerationHandler = async (modelId: string, stream: boolean): Promise<ReplHandler> => {
  await prepareTransformersRuntime()
  const { useTextGeneration } = await import("../../../tasks/text-generation")
  const { generator } = await useTextGeneration(modelId)

  return async (input: string) => {
    if (!input) return

    const messages: Message[] = []
    messages.push({
      role: "user",
      content: input,
    })
    const output = await generator(input, {
      stream,
    })
    if (output) {
      messages.push((output as TextGenerationOutput).at(0)?.generated_text.at(-1) as Message)
    }
    return messages.at(-1)?.content as string
  }
}
