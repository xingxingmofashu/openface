import {
  AutoProcessor,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
} from "@huggingface/transformers"
import type { TaskType, PretrainedModelOptions, PretrainedTokenizerOptions } from "@huggingface/transformers"
import { SUPPORTED_TASKS } from "./tasks"
import defu from "defu"
import { useConfig } from "../../config"
import { modelInfo, repoExists } from "@huggingface/hub"

export async function pull(modelId: string, opts: PretrainedModelOptions = {}) {
  const {
    config: {
      huggingface: { pretrained },
    },
    file,
  } = await useConfig()

  const exists = await repoExists({ repo: modelId })
  if (!exists) {
    throw new Error(`Model '${modelId}' does not exist on Hugging Face Hub`)
  }
  const [provider, name] = modelId.split("/") as [string, string]

  const model = await modelInfo({ name: modelId, additionalFields: ["tags"] })
  const task = model.task as TaskType
  if (!task) {
    throw new Error(`Cannot detect task type for model '${modelId}'`)
  }

  const modelOptions = defu<PretrainedModelOptions, [PretrainedModelOptions]>(opts, {
    ...pretrained.model,
  } satisfies PretrainedModelOptions)

  const tokenizerOptions = defu<PretrainedTokenizerOptions, [PretrainedTokenizerOptions]>(opts, {
    ...pretrained.model,
  } satisfies PretrainedTokenizerOptions)

  const processorOptions = defu(opts, {
    ...pretrained.model,
  })

  const promises: Promise<PreTrainedTokenizer | PreTrainedModel | Processor>[] = []

  if ("tokenizer" in SUPPORTED_TASKS[task]) {
    promises.push((SUPPORTED_TASKS[task].tokenizer as typeof AutoTokenizer).from_pretrained(modelId, tokenizerOptions))
  }

  if ("processor" in SUPPORTED_TASKS[task]) {
    if (SUPPORTED_TASKS[task].processor instanceof Array) {
      for (const processor of SUPPORTED_TASKS[task].processor as Array<typeof AutoProcessor | null>) {
        if (processor) {
          promises.push(processor.from_pretrained(modelId, processorOptions))
        }
      }
    } else {
      promises.push(
        (SUPPORTED_TASKS[task].processor as typeof AutoProcessor).from_pretrained(modelId, processorOptions),
      )
    }
  }

  if (SUPPORTED_TASKS[task].model instanceof Array) {
    for (const model of SUPPORTED_TASKS[task].model) {
      promises.push(model.from_pretrained(modelId, modelOptions))
    }
  } else {
    promises.push(SUPPORTED_TASKS[task].model.from_pretrained(modelId, modelOptions))
  }

  await Promise.all(promises)

  const setModelConfig = {
    provider: {
      [provider]: {
        models: {
          [name]: {
            ...model,
          },
        },
      },
    },
  }

  await file.model.write(JSON.stringify(defu(setModelConfig, await file.model.json()), null, 2))
}
