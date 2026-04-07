import { cmd } from "../../utils/cmd"
import { pull } from "../../../tasks/pull"
import type { ProgressInfo } from "@huggingface/transformers"
import { intro, outro, progress as createProgress } from "@clack/prompts"
import { UI } from "../../utils/ui"

export const PullCommand = cmd({
  command: "pull <modelId>",
  describe: "Download models from Hugging Face Hub",
  builder: (yargs) =>
    yargs.positional("modelId", {
      type: "string",
      describe: "Model repository ID",
      demandOption: true,
    }),
  handler: async (args) => {
    const progress = createProgress({ style: "block", max: 100 })
    try {
      intro(`Pulling model '${args.modelId}' ...`)
      progress.start("Starting download")
      let currentProgress = 0
      await pull(args.modelId, {
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
      progress.stop(`Model '${args.modelId}' pulled successfully!`)
      outro("Download complete!")
    } catch (error) {
      progress.stop(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  },
})
