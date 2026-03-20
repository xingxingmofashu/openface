import { mkdir } from 'node:fs/promises'
import consola from 'consola'
import { useGlobal } from './global'


export function useLocal() {
  const { config: { local } } = useGlobal()
  mkdir(local.models.cache_dir, { recursive: true }).catch(consola.error)

  return {
    config: local
  }
}