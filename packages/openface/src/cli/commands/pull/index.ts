import { cmd } from "../../utils/cmd"
import { pull } from "../../../tasks/pull"
import { SUPPORTED_TASKS } from "../../../tasks/pull/tasks"
import type { SUPPORTED_TASKS_TYPES } from "../../../tasks/pull/tasks"
import type { ProgressInfo } from "@huggingface/transformers"
import { intro, outro, progress as createProgress } from "@clack/prompts"
import { UI } from "../../utils/ui"

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
    const progress = createProgress({ style: "block", max: 100 })

    try {
      intro(`Pulling model '${model}' ...`)
      progress.start("Downloading model...")
      let currentProgress = 0
      await pull(task, model, {
        progress_callback: (info: ProgressInfo) => {
          if (info.status === "progress_total") {
            const t = Math.round(info.progress * 100) / 100
            const c = Math.round(currentProgress * 100) / 100
            const diff = t - c
            if (diff >= 0.01) {
              progress.advance(diff, `${UI.Style.TEXT_HIGHLIGHT}Downloading ${t}% `)
              currentProgress = info.progress
            }
          }
        },
      })
      progress.stop(`Model '${model}' pulled successfully!`)
      outro("Download complete!")
    } catch (error) {
      progress.stop(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  },
})
