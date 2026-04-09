import { intro, log, outro } from "@clack/prompts"
import { cmd } from "../utils/cmd"
import { readdir } from "node:fs/promises"
import { UI } from "../utils/ui"
import { join } from "node:path"

export const ListCommand = cmd({
  command: "list",
  describe: "List downloaded language models in local cache",
  aliases: ["ls"],
  async handler() {
    const { useConfig } = await import("../../config")
    const { config } = await useConfig()
    if(!config.CACHE_DIR) {
      log.error("Cache directory is not configured.")
      process.exit(1)
    }
    const result: Array<{ provider: string; model: { id: string; name: string } }> = []
    const providers = await readdir(config.CACHE_DIR, { withFileTypes: true })

    for await (const provider of providers.filter((p) => p.isDirectory()).map((p) => p.name)) {
      const models = await readdir(join(config.CACHE_DIR, provider), { withFileTypes: true })
      result.push(
        ...models
          .filter((m) => m.isDirectory())
          .map((m) => ({ provider, model: { id: `${provider}/${m.name}`, name: m.name } })),
      )
    }

    intro(`Models ${UI.Style.TEXT_DIM}${config.CACHE_DIR}`)
    for (const { provider, model } of result) {
      log.info(`${model.name} ${UI.Style.TEXT_DIM}${provider}`)
    }
    if (result.length === 0) {
      log.warn("No Models configured")
      outro("Add models with: openface pull")
      return
    } else {
      outro(`${result.length} models`)
    }
  },
})
