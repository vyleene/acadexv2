import { invoke, isTauri } from '@tauri-apps/api/core'

export const COLLEGE_ROWS_PER_PAGE = 10

export type CollegeRow = {
  code: string
  collegeName: string
}

type BackendCollege = {
  code: string
  name: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to load MySQL-backed college data.'

export async function fetchCollegeRows(): Promise<CollegeRow[]> {
  if (!isTauri()) {
    throw new Error(TAURI_REQUIRED_MESSAGE)
  }

  const response = await invoke<BackendCollege[]>('list_colleges')

  return response.map((college) => ({
    code: college.code,
    collegeName: college.name,
  }))
}
