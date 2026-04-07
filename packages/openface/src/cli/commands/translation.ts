import { cmd } from "../utils/cmd"
import { useTranslation } from "../../tasks/translation"
import { TextStreamer } from "@huggingface/transformers"
import { createRepl } from "../utils/createRepl"

export const TranslationCommand = cmd({
  command: "translation",
  describe: "Translate text between languages",
  builder: (yargs) =>
    yargs
      .option("model", {
        alias: "m",
        type: "string",
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
    const { translator, tokenizer } = await useTranslation(args.model)
    const streamer = args.stream
      ? new TextStreamer(tokenizer, {
          skip_prompt: true,
        })
      : undefined

    const handler = async (input: string) => {
      const output = await translator(input, {
        streamer,
      })
      return output.at(-1)?.translation_text
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
