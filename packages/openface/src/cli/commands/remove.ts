import { cmd } from "../utils/cmd"
import { rm, exists } from "node:fs/promises"
import { intro, log, outro, tasks, type Task, spinner as createSpinner } from "@clack/prompts"
import { join } from "node:path"
import { UI } from "../utils/ui"
import { useConfig } from "../../config"

export const RemoveCommand = cmd({
  command: "remove [modelId...]",
  describe: "Remove downloaded language models from local cache",
  aliases: ["rm"],
  builder: (yargs) =>
    yargs.positional("modelId", {
      type: "string",
      describe: "Model identifier(s) to remove (e.g., openai/gpt-4, anthropic/claude-3)",
      array: true,
      demandOption: true,
    }),
  async handler(args) {
    const { config, removeModelInfo } = await useConfig()
    if (!config.CACHE_DIR) {
      log.error("Cache directory is not configured.")
      return
    }

    intro(`Removing model(s)...`)
    for (const modelId of args.modelId) {
      const modelPath = join(config.CACHE_DIR, modelId)
      const dirExists = await exists(modelPath)
      if (!dirExists) {
        log.error(`Model ${UI.Style.TEXT_DANGER_BOLD}${modelId}\x1b[0m not found in cache.`)
        continue
      }
      await rm(modelPath, { recursive: true, force: true })

      await removeModelInfo(modelId)
      log.success(`Removed model ${UI.Style.TEXT_SUCCESS_BOLD}${modelId}\x1b[0m from cache.`)
    }
    outro(`Model(s) removed from cache successfully`)
  },
})
