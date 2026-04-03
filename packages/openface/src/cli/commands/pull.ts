import { cmd } from "../utils/cmd"
import { pull } from "../../tasks/pull"
import { SUPPORTED_TASKS } from "../../tasks/pull/tasks"
import type { SUPPORTED_TASKS_TYPES } from "../../tasks/pull/tasks"
import { log, progress } from "@clack/prompts"

export const PullCommand = cmd({
  command: "pull",
  describe: "Download models from Hugging Face Hub",
  builder: (yargs) =>
    yargs
      .option("model", {
        type: "string",
        alias: "m",
        describe: "Model repository ID",
        demandOption: true,
      })
      .option("task", {
        type: "string",
        alias: "t",
        describe: "Task type",
        choices: Object.keys(SUPPORTED_TASKS),
        demandOption: true,
      }),
  handler: async (args) => {
    const { model, task } = args as { model: string; task: SUPPORTED_TASKS_TYPES }

    const prog = progress({
      indicator: "dots",
      style: "heavy",
    })

    try {
      log.info(`Pulling model '${model}' for task '${task}'...`)
      prog.start(`Downloading`)
      await pull(task, model,{
        progress_callback:(info)=>{
        }
      })
      prog.stop(`Model '${model}' pulled successfully!`)
    } catch (error) {
      prog.error(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  },
})
