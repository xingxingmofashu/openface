import { useTextGeneration } from "../../tasks/text-generation"
import { cmd } from "../utils/cmd"
import { TextStreamer } from "@huggingface/transformers"
import { createRepl } from "../utils/createRepl"

export const TextGenerationCommand = cmd({
  command: "text-generation",
  describe: "Input prompt for generation",
  builder: (yargs) =>
    yargs
      .option("model", {
        type: "string",
        alias: "m",
        describe: "Model repository ID",
        demandOption: true,
      })
      .option("stream", {
        type: "boolean",
        alias: "s",
        describe: "Enable streaming output",
        default: true,
      }),
  handler: async (args) => {
    const { generator, tokenizer } = await useTextGeneration(args.model)

    const streamer = args.stream
      ? new TextStreamer(tokenizer, {
          skip_prompt: true,
        })
      : undefined

    const handler = async (input: string) => {
      if (input) {
        const output = await generator(input, {
          streamer,
        })
        return output[0]?.generated_text
      }
    }

    const repl = await createRepl(
      {
        input: process.stdin,
        output: process.stdout,
        stream: args.stream,
      },
      handler,
    )

    repl.close()
  },
})
