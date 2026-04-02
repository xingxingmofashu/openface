import { cmd } from "../utils/cmd";
import { useTranslation } from "../../tasks/translation"
import { TranslationLanguages } from '../../tasks/translation/languages'
import { TextStreamer, type TranslationOutput } from "@huggingface/transformers";
import { createRepl } from "../utils/createRepl";

export const TranslationCommand = cmd({
  command: "translation",
  describe: "Translate text between languages",
  builder: (yargs) =>
    yargs
      .positional("translation", {
        describe: "Text to translate",
        type: "string",
        array: true,
        default: [],
      })
      .option("model", {
        alias: 'm',
        type: "string",
        describe: "Model repository ID",
        demandOption: true
      })
      .option("stream", {
        type: "boolean",
        alias: "s",
        describe: "Enable streaming output",
        default: false
      })
      .option("src_lang", {
        alias: 's',
        type: "string",
        describe: "Source language code",
        default: "zho_Hans"
      })
      .option("tgt_lang", {
        alias: 't',
        type: "string",
        describe: "Target language code",
        default: "eng_Latn"
      }),
  handler: async (args) => {
    const { translator, tokenizer } = await useTranslation(args.model)
    const streamer = args.stream ? new TextStreamer(tokenizer, {
      skip_prompt: true
    }) : undefined

    const repl = await createRepl({
      input: process.stdin,
      output: process.stdout,
      stream: args.stream,
    }, async (input) => {
      const output = await translator(input, {
        src_lang: args.src_lang as TranslationLanguages.LanguageCode,
        tgt_lang: args.tgt_lang as TranslationLanguages.LanguageCode,
        streamer,
      })
      return (output as TranslationOutput).at(-1)?.translation_text
    })

    repl.close()
  }
})