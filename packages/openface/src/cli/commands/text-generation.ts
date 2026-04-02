import { useTextGeneration } from "../../tasks/text-generation"
import { cmd } from "../utils/cmd"
import { TextStreamer, type Chat, type Message, type TextGenerationOutput } from "@huggingface/transformers"
import { createRepl } from "../utils/createRepl"

export const TextGenerationCommand = cmd({
  command: "text-generation",
  describe: "Generate text using language models",
  builder: (yargs) =>
    yargs
      .positional("text-generation", {
        describe: "Input prompt for generation",
        type: "string"
      })
      .option("model", {
        type: "string",
        alias: "m",
        describe: "Model repository ID",
        demandOption: true
      })
      .option("stream", {
        type: "boolean",
        alias: "s",
        describe: "Enable streaming output",
        default: false
      }),
  handler: async (args) => {
    const { generator, tokenizer } = await useTextGeneration(args.model)
    const messages: Chat = []
    const streamer = args.stream ? new TextStreamer(tokenizer, {
      skip_prompt: true
    }) : undefined
    const repl = await createRepl({
      input: process.stdin,
      output: process.stdout,
      stream:args.stream
    }, async (input) => {
      if (input) {
        messages.push({
          role: 'user',
          content: input
        })
        const output = await generator(messages, {
          streamer,
        })
        if (output) {
          messages.push((output as TextGenerationOutput).at(0)?.generated_text.at(-1) as Message)
        }
        return messages.at(-1)?.content
      }
    })

    repl.close()
  }
})