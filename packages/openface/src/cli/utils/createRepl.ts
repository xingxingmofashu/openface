import { createInterface, type ReadLineOptions } from "node:readline/promises"
import clipboardy from "clipboardy"
import { log } from "@clack/prompts"
import type { PreTrainedTokenizer, Message, TextGenerationOutput } from "@huggingface/transformers"

export interface CreateReplOptions extends ReadLineOptions {
  stream?: boolean
}

export type ReplHandler = (input: string) => Promise<string | undefined>

export async function createRepl(options: CreateReplOptions, callback?: ReplHandler) {
  const repl = createInterface(options)
  console.log(`Type \x1b[36m.copy [code]\x1b[0m to copy to clipboard. \x1b[36m.help\x1b[0m for more info.\n`)
  while (true) {
    const input = await repl.question("> ")
    if (input === ".exit") {
      break
    }

    if (input === ".help") {
      const helpinfo = [
        {
          titile: `\n\x1b[1mREPL Commands:\x1b[0m`,
          content: [
            `  \x1b[36m.exit        \x1b[0m - Exit the REPL`,
            `  \x1b[36m.copy        \x1b[0m - Copy result to clipboard (.copy [expr])`,
            `  \x1b[36m.help        \x1b[0m - Print this help message\n`,
          ],
        },
      ]
      helpinfo.forEach((x) => {
        console.log(x.titile)
        x.content.forEach((c) => {
          console.log(c)
        })
      })
      continue
    }

    const output = await callback?.(input.replace(".copy ", ""))
    if (!options.stream && output) {
      console.log(`${output}`)
    }

    if (input.startsWith(".copy ")) {
      try {
        if (output) {
          await clipboardy.write(output)
          console.log(`\x1b[90mCopied ${output.length} characters to clipboard\x1b[0m`)
        }
      } catch (error) {
        log.error(`Failed to copy:${error}`)
      }
      continue
    }
  }

  return repl
}

const createStreamer = async (tokenizer: PreTrainedTokenizer, stream: boolean) => {
  if (!stream) {
    return undefined
  }

  const { TextStreamer } = await import("@huggingface/transformers")
  return new TextStreamer(tokenizer, { skip_prompt: true })
}

const createTranslationHandler = async (modelId: string, stream: boolean): Promise<ReplHandler> => {
  const { useTranslation } = await import("../../tasks/translation")
  const { translator, tokenizer } = await useTranslation(modelId)
  return async (input: string) => {
    const output = await translator(input, {
      streamer: await createStreamer(tokenizer, stream),
    })
    return output.at(-1)?.translation_text
  }
}

const createTextGenerationHandler = async (modelId: string, stream: boolean): Promise<ReplHandler> => {
  const { useTextGeneration } = await import("../../tasks/text-generation")
  const { generator, tokenizer } = await useTextGeneration(modelId)
  return async (input: string) => {
    if (!input) return

    const messages: Message[] = []
    messages.push({
      role: "user",
      content: input,
    })
    const output = await generator(input, {
      streamer: await createStreamer(tokenizer, stream),
    })
    if (output) {
      messages.push((output as TextGenerationOutput).at(0)?.generated_text.at(-1) as Message)
    }
    return messages.at(-1)?.content as string
  }
}

export const createReplHandler = async (modelId: string, task: string, stream: boolean): Promise<ReplHandler> => {
  switch (task) {
    case "translation":
      return createTranslationHandler(modelId, stream)
    case "text-generation":
      return createTextGenerationHandler(modelId, stream)
    default:
      throw new Error(`Unsupported task type: ${task}`)
  }
}
