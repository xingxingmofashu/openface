import { useTextGeneration } from "@/tasks/text-generation"
import { cmd } from "./cmd"
import { createInterface } from 'node:readline/promises'
import { TextStreamer } from "@huggingface/transformers"

export const TextGenerationCommand = cmd({
  command: "text-generation",
  describe: "Generation with a message.",
  builder: (yargs) =>
    yargs
      .positional("text-generation", {
        describe: "message to send",
        type: "string",
        array: true,
        default: [],
      })
      .option("model", {
        type: "string",
        alias: "m",
        demandOption: true
      }),
  handler: async (args) => {
    const { generator, tokenizer } = await useTextGeneration(args.model)
    const history: string[] = []
    const repl = createInterface({
      input: process.stdin,
      output: process.stdout,
      history: history,
      historySize: Number.MAX_VALUE
    })
    while (true) {
      const input = await repl.question("> ")
      if (input === ".exit") {
        break
      }
      await generator(input, {
        streamer: new TextStreamer(tokenizer, {
          skip_prompt: true,
          skip_special_tokens: true
        }),
      })
    }
  }
})