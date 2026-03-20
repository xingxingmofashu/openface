import { cmd } from "./cmd";
import { Translation } from "../../translation"
import { TranslationLanguages } from "../../translation/languages"

export const TranslationCommand = cmd({
  command: "translation [message..]",
  describe: "Translate with a message.",
  builder: (yargs) =>
    yargs
      .positional("translation", {
        describe: "message to send",
        type: "string",
        array: true,
        default: [],
      })
      .option("src_lang", {
        type: "string",
        describe: "The source language code (e.g., 'en' for English)."
      })
      .option("tgt_lang", {
        type: "string",
        describe: "The target language code (e.g., 'fr' for French).",
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

    let src_lang = args.src_lang as TranslationLanguages.LanguageCode | undefined
    let tgt_lang = args.tgt_lang as TranslationLanguages.LanguageCode | undefined

    const translation = new Translation()

    const output = await translation.translator(message, {
      src_lang,
      tgt_lang
    })

    console.log(`Text: ${JSON.stringify(output)};`);
  }
})