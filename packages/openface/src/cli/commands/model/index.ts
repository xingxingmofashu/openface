import { cmd } from "../../utils/cmd"
import { ModelListCommand } from "./list"
import { ModelRemoveCommand } from "./remove"

export const ModelCommand = cmd({
  command: "model",
  describe: "",
  builder: (yargs) => yargs.command(ModelListCommand).command(ModelRemoveCommand).demandCommand(),
  async handler() {},
})
