import { cmd } from "./cmd";
import { Translation } from "@/tasks/translation"
import consola from "consola"
import { TranslationLanguages } from '@/tasks/translation/languages'

export const TranslationCommand = cmd({
  command: "translation",
  describe: "Translate with a message.",
  builder: (yargs) =>
    yargs
      .positional("translation", {
        describe: "message to send",
        type: "string",
        array: true,
        default: [],
      })
      .option("model", {
        alias: 'm',
        type: "string",
        demandOption: true
      })
      .option("src_lang", {
        alias: 's',
        type: "string",
        default: "zho_Hans"
      })
      .option("tgt_lang", {
        alias: 't',
        type: "string",
        default: "eng_Latn"
      })
      .option('message', {
        type: 'string',
        describe: 'The message to be translated.',
        demandOption: true
      }),
  handler: async (args) => {
    let message = [...args.message, ...(args["--"] || [])]
      .map((arg) => (arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg))
      .join(" ")

    const translation = new Translation(args.model)

    const output = await translation.translator(message, {
      src_lang: args.src_lang as TranslationLanguages.LanguageCode,
      tgt_lang: args.tgt_lang as TranslationLanguages.LanguageCode
    })

    consola.log(`Text:${message} tranlationed ${JSON.stringify({ output })};`);
  }
})