import { TextGeneration } from "@/text-generation";
import { cmd } from "./cmd";
import consola from "consola";


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
      })
      .option('message', {
        type: 'string',
        demandOption: true
      }),
  handler: async (args) => {
    let message = [...args.message, ...(args["--"] || [])]
      .map((arg) => (arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg))
      .join(" ")

    const generation = new TextGeneration(args.model)

    const output = await generation.generator(message)

    consola.log(`Text:${JSON.stringify({ output })};`);
  }
})