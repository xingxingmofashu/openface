import { intro, log, outro } from "@clack/prompts"
import { useConfig } from "../../../config"
import { cmd } from "../../utils/cmd"
import { readdir } from "node:fs/promises"
import { UI } from "../../utils/ui"
import { join } from "node:path"

export const ModelListCommand = cmd({
  command: "list",
  describe: "",
  aliases: ["ls"],
  async handler() {
    const { config } = await useConfig()
    const cacheDir = config.huggingface.env.cacheDir
    const result: Array<{ provider: string; model: { id: string; name: string } }> = []
    const providers = await readdir(cacheDir, { withFileTypes: true })

    for await (const provider of providers.filter((p) => p.isDirectory()).map((p) => p.name)) {
      const models = await readdir(join(cacheDir, provider), { withFileTypes: true })
      result.push(
        ...models
          .filter((m) => m.isDirectory())
          .map((m) => ({ provider, model: { id: `${provider}/${m.name}`, name: m.name } })),
      )
    }

    intro(`Models ${UI.Style.TEXT_DIM}${cacheDir}`)
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
