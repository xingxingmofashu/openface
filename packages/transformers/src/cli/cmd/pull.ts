import { cmd } from "./cmd";

export const PullCommand = cmd({
  command: "pull [model]",
  describe: "Pull a model.",
  builder: (yargs) =>
    yargs
      .positional("pull", {
        describe: "pull a model",
        type: "string",
        array:true,
        default:[]
      })
      .option('name', {
        type: 'string',
        describe: 'The model name.',
        demandOption: true
      }),
  handler: async (args) => {

    let name = [...args.name, ...(args["--"] || [])]
      .map((arg) => (arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg))
      .join(" ")

    console.log(`Text: ${JSON.stringify(name)};`);
  }
})