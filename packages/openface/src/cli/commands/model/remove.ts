import { useConfig } from "../../../config"
import { cmd } from "../../utils/cmd"
import { rm } from "node:fs/promises"
import { intro, log, outro, tasks, type Task } from "@clack/prompts"
import { join } from "node:path"
import { useLanguageModelSchema } from "../../utils/schemas"

export const ModelRemoveCommand = cmd({
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
    const { config } = await useConfig()
    const cacheDir = config.huggingface.env.cacheDir
    if(!cacheDir) {
      log.error("Cache directory is not configured.")
      process.exit(1)
    }
    const rmTasks = Promise.all(
      args.modelId.map<Promise<Task>>(async (model) => {
        const { provider, modelId } = await useLanguageModelSchema().parseAsync(model)
        return {
          title: `Remove ${provider}/${modelId}`,
          task: async () => {
            await rm(join(cacheDir, provider, modelId), { recursive: true, force: true })
          },
        }
      }),
    )
    
    intro(`Removing model(s)...`)
    await tasks(await rmTasks)
    outro(`Model(s) removed from cache successfully`)
  },
})
