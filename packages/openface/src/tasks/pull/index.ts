import {
  AutoProcessor,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
} from "@huggingface/transformers";
import type { TaskType, PretrainedModelOptions } from "@huggingface/transformers";
import { SUPPORTED_TASKS } from "./tasks";
import defu from "defu";
import { useConfig } from "../../config";
import { modelInfo, repoExists } from "@huggingface/hub";

export async function pull(modelId: string, opts: PretrainedModelOptions = {}) {
  const { config, setModelInfo } = await useConfig({ syncTransformersEnv: true });

  const exists = await repoExists({ repo: modelId });
  if (!exists) {
    throw new Error(`Model '${modelId}' does not exist on Hugging Face Hub`);
  }

  const model = await modelInfo({ name: modelId });
  const task = model.task as TaskType;
  if (!task) {
    throw new Error(`Cannot detect task type for model '${modelId}'`);
  }

  const modelOptions = defu(opts, { cache_dir: config.CACHE_DIR });
  const tokenizerOptions = defu(opts, { cache_dir: config.CACHE_DIR });
  const processorOptions = defu(opts, { cache_dir: config.CACHE_DIR });

  const promises: Promise<PreTrainedTokenizer | PreTrainedModel | Processor>[] = [];

  if ("tokenizer" in SUPPORTED_TASKS[task]) {
    promises.push(
      (SUPPORTED_TASKS[task].tokenizer as typeof AutoTokenizer).from_pretrained(
        modelId,
        tokenizerOptions,
      ),
    );
  }

  if ("processor" in SUPPORTED_TASKS[task]) {
    if (SUPPORTED_TASKS[task].processor instanceof Array) {
      for (const processor of SUPPORTED_TASKS[task].processor as Array<
        typeof AutoProcessor | null
      >) {
        if (processor) {
          promises.push(processor.from_pretrained(modelId, processorOptions));
        }
      }
    } else {
      promises.push(
        (SUPPORTED_TASKS[task].processor as typeof AutoProcessor).from_pretrained(
          modelId,
          processorOptions,
        ),
      );
    }
  }

  if (SUPPORTED_TASKS[task].model instanceof Array) {
    for (const model of SUPPORTED_TASKS[task].model) {
      promises.push(model.from_pretrained(modelId, modelOptions));
    }
  } else {
    promises.push(SUPPORTED_TASKS[task].model.from_pretrained(modelId, modelOptions));
  }

  await Promise.all(promises);

  await setModelInfo(modelId, model);
}
