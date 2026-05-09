import { cmd } from "../../utils/cmd"
import { ConfigGetCommand } from "./get"
import { ConfigListCommand } from "./list"

export const ConfigCommand = cmd({
  command: "config",
  describe: "Manage configuration settings",
  builder: (yargs) => yargs.command(ConfigListCommand).command(ConfigGetCommand).demandCommand(),
  async handler() {},
})
