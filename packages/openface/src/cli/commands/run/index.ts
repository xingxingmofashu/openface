import { log } from "@clack/prompts"
import { cmd } from "../../utils/cmd"

export const RunCommand = cmd({
  command: "run <modelId>",
  describe: "Run a model with specified input",
  builder: (yargs) =>
    yargs
      .positional("modelId", {
        type: "string",
        describe: "Model identifier to run (e.g., openai/gpt-4, anthropic/claude-3)",
        demandOption: true,
      })
      .option("stream", {
        type: "boolean",
        alias: "s",
        describe: "Enable streaming output",
        default: true,
      }),
  async handler(args) {
    const { useConfig } = await import("../../../config")
    const { config, getModelInfo, exists } = await useConfig()
    if (!config.CACHE_DIR) {
      log.error("Cache directory is not configured.")
      return
    }

    if (!(await exists(args.modelId))) {
      log.error(`Model ${args.modelId} not found in configuration.`)
      return
    }

    const modelInfo = await getModelInfo(args.modelId)
    if (!modelInfo) {
      log.error(`Model ${args.modelId} not found in configuration.`)
      return
    }

    try {
      const { createReplHandler, createRepl } = await import("../../utils/createRepl")
      const replHandler = await createReplHandler(args.modelId, modelInfo.task!, args.stream)
      const repl = await createRepl(
        {
          input: process.stdin,
          output: process.stdout,
          stream: args.stream,
        },
        replHandler,
      )
      repl.close()
    } catch (error) {
      log.error(error instanceof Error ? error.message : "Failed to create handler")
    }
  }
})
