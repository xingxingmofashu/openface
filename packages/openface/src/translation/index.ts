import { pipeline, env } from "@huggingface/transformers"
import type { PretrainedModelOptions, TextGenerationConfig } from "@huggingface/transformers"
import { TranslationLanguages } from "./languages"
import { defu } from "defu"


/**
   * This class uses the Singleton pattern to ensure that only one instance of the
   * pipeline is loaded. This is because loading the pipeline is an expensive
   * operation and we don't want to do it every time we want to translate a sentence.
   */
export class Translation {
  private model?: string
  private options?: PretrainedModelOptions = {
    cache_dir: env.cacheDir
  }

  constructor(model?: string, options?: PretrainedModelOptions) {
    this.model = model, this.options = defu(this.options, options)
  }

  async translator(texts: string | string[], config?: TranslationConfig) {
    const pipe = await pipeline<'translation'>('translation', this.model, this.options)
    // @ts-ignore
    return pipe(texts, config);
  }
}

export interface TranslationConfig extends Partial<TextGenerationConfig> {
  src_lang?: TranslationLanguages.LanguageCode
  tgt_lang?: TranslationLanguages.LanguageCode
}
