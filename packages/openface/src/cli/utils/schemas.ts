import z from "zod"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { log } from "@clack/prompts"
import { useConfig } from "../../config"

export type LanguageModel = {
  /**
   * Provider ID.
   */
  provider: string
  /**
   * Provider-specific model ID.
   */
  modelId: string
}

export function useLanguageModelSchema() {
  return z
    .string()
    .regex(/^[^/]+\/[^/]+$/, {
      error: "Invalid model id format. Expected: provider/model",
    })
    .refine(
      async (value) => {
        const { config } = await useConfig()
        const cacheDir = config.huggingface.env.cacheDir

        const [provider, model] = value.split("/") as [string, string]
        const providerDirents = await readdir(cacheDir, { withFileTypes: true })
        const providers = providerDirents.filter((d) => d.isDirectory()).map((p) => p.name)
        if (!providers.some((p) => p === provider)) {
          return false
        }
        const dirents = await readdir(join(cacheDir, provider), { withFileTypes: true })
        const models = dirents.filter((m) => m.isDirectory()).map((x) => x.name)
        return models.some((m) => m === model)
      },
      {
        error: (issue) => {
          const message = `Model ${JSON.stringify(issue.input)} is not found`
          log.error(message)
          return message
        },
      },
    )
    .transform<LanguageModel>((arg) => ({
      provider: arg.split("/").at(0)!,
      modelId: arg.split("/").at(-1)!,
    }))
}