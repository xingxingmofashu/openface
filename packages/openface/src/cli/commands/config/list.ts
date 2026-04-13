import { UI } from "../../utils/ui"
import { cmd } from "../../utils/cmd"
import { log, intro, outro } from "@clack/prompts"
import { useConfig } from "../../../config"

export const ConfigListCommand = cmd({
  command: "list",
  aliases: ["ls"],
  describe: "List all configuration settings",
  async handler() {
    const { config } = await useConfig()
    intro(`Configurations ${UI.Style.TEXT_DIM}${config.CONFIG_PATH}`)
    for (const [key, value] of Object.entries(config)) {
      log.info(`${key.toUpperCase()} ${UI.Style.TEXT_DIM}${value}`)
    }
    outro("Set config with: openface config set")
  },
})
