import { invoke, isTauri } from '@tauri-apps/api/core'

export const assertTauriRuntime = (message: string) => {
  if (!isTauri()) {
    throw new Error(message)
  }
}

export const invokeTauri = <T>(command: string, args?: Record<string, unknown>): Promise<T> =>
  invoke<T>(command, args)

export const isTauriRuntime = () => isTauri()
