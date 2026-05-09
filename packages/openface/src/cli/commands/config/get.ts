import { UI } from "../../utils/ui";
import { cmd } from "../../utils/cmd";
import { log, intro, outro } from "@clack/prompts";
import { useConfig } from "../../../config";

export const ConfigGetCommand = cmd({
  command: "get <name>",
  describe: "Get configuration setting",
  builder: (yargs) =>
    yargs.positional("name", {
      type: "string",
      description: "Configuration name",
      demandOption: true,
    }),
  async handler(args) {
    const { config } = await useConfig();
    intro(`Configurations ${UI.Style.TEXT_DIM}${config.CONFIG_PATH}`);
    const result = Object.entries(config).filter(([key, _]) =>
      key.toUpperCase().includes(args.name.toUpperCase()),
    );
    for (const [key, value] of result) {
      log.info(`${key.toUpperCase()} ${UI.Style.TEXT_DIM}${value}`);
    }
    if (result.length == 0) {
      log.info(`No find configuration`);
    }
    outro("Set config with: openface config set");
  },
});
