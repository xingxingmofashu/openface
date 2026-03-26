import { cmd } from "./cmd"
import { pull } from "../../pull"
import { SUPPORTED_TASKS } from "../../pull/tasks"
import type { SUPPORTED_TASKS_TYPES } from "../../pull/tasks"
import consola from "consola"

export const PullCommand = cmd({
  command: "pull <model>",
  describe: "Pull a model from Hugging Face Hub.",
  builder: (yargs) =>
    yargs
      .positional("model", {
        describe: "Model repository ID (e.g., 'Xenova/nllb-200-distilled-600M')",
        type: "string"
      })
      .option("task", {
        type: "string",
        describe: "The task type (e.g., 'text-classification', 'translation', etc.)",
        choices: Object.keys(SUPPORTED_TASKS),
        demandOption: true
      }),
  handler: async (args) => {
    const { model, task } = args as { model: string; task: SUPPORTED_TASKS_TYPES }
    
    try {
      // Set proxy if configured
      if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
        consola.info(`Using proxy: ${process.env.HTTP_PROXY || process.env.HTTPS_PROXY}`)
      }

      consola.start(`Pulling model '${model}' for task '${task}'...`)
      await pull(task, model)
      consola.success(`Model '${model}' pulled successfully!`)
      
    } catch (error) {
      consola.error("Failed to pull model:", error instanceof Error ? error.message : String(error))
      
      process.exit(1)
    }
  }
})