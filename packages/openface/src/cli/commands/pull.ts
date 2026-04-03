import { cmd } from "../utils/cmd"
import { pull } from "../../tasks/pull"
import { SUPPORTED_TASKS } from "../../tasks/pull/tasks"
import type { SUPPORTED_TASKS_TYPES } from "../../tasks/pull/tasks"
import type { ProgressInfo } from "@huggingface/transformers"
import { log, spinner } from "@clack/prompts"

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

    const prog = spinner()

    const fileProgress = new Map<string, number>()
    const fileTotals = new Map<string, number>()
    const fileLoaded = new Map<string, number>()

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 B"
      const k = 1024
      const sizes = ["B", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
    }

    const updateProgress = () => {
      const totalLoaded = Array.from(fileLoaded.values()).reduce((a, b) => a + b, 0)
      const totalBytes = Array.from(fileTotals.values()).reduce((a, b) => a + b, 0)
      const activeFiles = Array.from(fileProgress.entries())
        .filter(([, p]) => p > 0 && p < 100)
        .map(([file, p]) => `${file}: ${Math.round(p)}%`)

      if (totalBytes > 0) {
        const overallProgress = totalLoaded > 0 && totalBytes > 0 ? Math.round((totalLoaded / totalBytes) * 100) : 0
        const msg = activeFiles.length > 0
          ? `${activeFiles.join(" | ")} | Total: ${overallProgress}% (${formatBytes(totalLoaded)} / ${formatBytes(totalBytes)})`
          : `Total: ${overallProgress}% (${formatBytes(totalLoaded)} / ${formatBytes(totalBytes)})`
        prog.message(msg)
      } else if (activeFiles.length > 0) {
        prog.message(activeFiles.join(" | "))
      }
    }

    const progressCallback = (info: ProgressInfo) => {
      switch (info.status) {
        case "initiate":
          fileProgress.set(info.file, 0)
          prog.message(`Starting download: ${info.file}`)
          break
        case "download":
          prog.message(`Downloading: ${info.file}`)
          break
        case "progress":
          fileProgress.set(info.file, info.progress)
          fileTotals.set(info.file, info.total)
          fileLoaded.set(info.file, info.loaded)
          updateProgress()
          break
        case "done":
          fileProgress.set(info.file, 100)
          prog.message(`Downloaded: ${info.file}`)
          break
        case "ready":
          prog.message(`Model ready: ${info.model}`)
          break
      }
    }

    try {
      log.info(`Pulling model '${model}' for task '${task}'...`)
      prog.start(`Downloading`)
      await pull(task, model, {
        progress_callback: progressCallback,
      })
      prog.stop(`Model '${model}' pulled successfully!`)
    } catch (error) {
      prog.error(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  },
})
