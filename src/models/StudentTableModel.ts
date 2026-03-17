import { invoke, isTauri } from '@tauri-apps/api/core'

export const STUDENT_ROWS_PER_PAGE = 10

export type StudentRow = {
  id: number
  firstName: string
  lastName: string
  programCode: string
  year: string
  gender: string
}

type BackendStudent = {
  id: number
  firstname: string
  lastname: string
  year: string
  gender: string
  program_code: string | null
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to load MySQL-backed student data.'

function mapStudentRow(student: BackendStudent): StudentRow {
  return {
    id: student.id,
    firstName: student.firstname,
    lastName: student.lastname,
    programCode: student.program_code ?? 'N/A',
    year: student.year,
    gender: student.gender,
  }
}

export async function fetchStudentRows(): Promise<StudentRow[]> {
  if (!isTauri()) {
    throw new Error(TAURI_REQUIRED_MESSAGE)
  }

  const response = await invoke<BackendStudent[]>('list_students')
  return response.map(mapStudentRow)
}
