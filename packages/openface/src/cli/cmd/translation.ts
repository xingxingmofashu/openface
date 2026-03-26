import { cmd } from "./cmd";
import { Translation } from "../../translation"
import { TranslationLanguages } from "../../translation/languages"
import { useGlobal } from "@/config/global"
import consola from "consola";

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
      .option("model", {
        type: "string",
        describe: "",
        default: undefined
      })
      .option("src_lang", {
        type: "string",
        choices: Object.values(TranslationLanguages.languages),
        describe: "The source language code (e.g., 'en' for English)."
      })
      .option("tgt_lang", {
        type: "string",
        choices: Object.values(TranslationLanguages.languages),
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

    const translation = new Translation(args.model)

    const output = await translation.translator(message, {
      src_lang: args.src_lang,
      tgt_lang: args.tgt_lang
    })

    consola.log(`Text: ${JSON.stringify(output)};`);
  }
})