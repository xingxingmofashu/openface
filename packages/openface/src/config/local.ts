import { mkdir } from 'node:fs/promises'
import consola from 'consola'
import { useGlobal } from './global'
import { env } from '@huggingface/transformers'


export function useLocal() {
  const { config: { local } } = useGlobal()
  mkdir(local.models_cache_dir, { recursive: true }).catch(consola.error)
  env.cacheDir = local.models_cache_dir
  
  return {
    config: local
  }
}