import { AutoProcessor, AutoTokenizer, PreTrainedModel, PreTrainedTokenizer, Processor, type PretrainedModelOptions, type PretrainedTokenizerOptions } from '@huggingface/transformers'
import { SUPPORTED_TASKS } from './tasks'
import type { SUPPORTED_TASKS_TYPES } from './tasks'
import defu from 'defu'
import { useConfig } from '@/config'

const { config: { huggingface: { pretrained } } } = await useConfig()

export async function pull(task: SUPPORTED_TASKS_TYPES, repo: string, opts: PretrainedModelOptions = {}) {
  const modelOptions = defu<PretrainedModelOptions, [PretrainedModelOptions]>(opts, {
    ...pretrained.model
  } satisfies PretrainedModelOptions)

  const tokenizerOptions = defu<PretrainedTokenizerOptions, [PretrainedTokenizerOptions]>(opts, {
    ...pretrained.model
  } satisfies PretrainedTokenizerOptions)

  const processorOptions = defu(opts, {
    ...pretrained.model
  })

  const promises: Promise<PreTrainedTokenizer | PreTrainedModel | Processor>[] = []

  if ('tokenizer' in SUPPORTED_TASKS[task]) {
    promises.push((SUPPORTED_TASKS[task].tokenizer as typeof AutoTokenizer).from_pretrained(repo, tokenizerOptions))
  }

  if ('processor' in SUPPORTED_TASKS[task]) {
    if (SUPPORTED_TASKS[task].processor instanceof Array) {
      for (const processor of (SUPPORTED_TASKS[task].processor as Array<typeof AutoProcessor | null>)) {
        if (processor) {
          promises.push(processor.from_pretrained(repo, processorOptions))
        }
      }
    } else {
      promises.push((SUPPORTED_TASKS[task].processor as typeof AutoProcessor).from_pretrained(repo, processorOptions))
    }
  }

  if (SUPPORTED_TASKS[task].model instanceof Array) {
    for (const model of SUPPORTED_TASKS[task].model) {
      promises.push(model.from_pretrained(repo, modelOptions))
    }
  } else {
    promises.push(SUPPORTED_TASKS[task].model.from_pretrained(repo, modelOptions))
  }

  await Promise.all(promises)
}