import { UI } from "../../utils/ui"
import { cmd } from "../../utils/cmd"
import { log, intro, outro } from "@clack/prompts"

export const ConfigListCommand = cmd({
  command: "list",
  aliases: ["ls"],
  describe: "List all configuration settings",
  async handler() {
    const { useConfig } = await import("../../../config")
    const { config } = await useConfig()
    console.log(config)
    intro(`Configurations ${UI.Style.TEXT_DIM}${config.CONFIG_PATH}`)
    for (const [key, value] of Object.entries(config)) {
      log.info(`${key.toUpperCase()} ${UI.Style.TEXT_DIM}${value}`)
    }
    outro("Set config with: openface config set")
  },
})
