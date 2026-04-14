import { createInterface, type ReadLineOptions } from "node:readline/promises"
import clipboardy from "clipboardy"
import { log } from "@clack/prompts"
import { createTranslationHandler } from "./handler/translation"
import { createTextGenerationHandler } from "./handler/text-generation"

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
