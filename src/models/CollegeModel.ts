import { invoke, isTauri } from '@tauri-apps/api/core'

export const COLLEGE_ROWS_PER_PAGE = 10
export const COLLEGES_REFRESH_EVENT = 'colleges:refresh'

export type CollegeRow = {
  code: string
  collegeName: string
  programCount: number
  studentCount: number
}

export type CreateCollegePayload = {
  code: string
  name: string
}

export type UpdateCollegePayload = {
  name: string
}

type BackendCollege = {
  code: string
  name: string
}

type BackendCollegeProgramLink = {
  college_code: string
  program_code: string
}

type BackendStudentProgramLink = {
  student_id: number
  program_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to manage college data.'

function ensureTauriRuntime() {
  if (!isTauri()) {
    throw new Error(TAURI_REQUIRED_MESSAGE)
  }
}

export function normalizeCollegeCode(value?: string): string {
  if (!value || value === 'N/A') {
    return ''
  }

  return value
}

export async function fetchCollegeRows(): Promise<CollegeRow[]> {
  ensureTauriRuntime()

  const [collegeResponse, linkResponse, studentProgramLinks] = await Promise.all([
    invoke<BackendCollege[]>('list_colleges'),
    invoke<BackendCollegeProgramLink[]>('list_college_program_links'),
    invoke<BackendStudentProgramLink[]>('list_student_program_links'),
  ])

  const programsByCollege = new Map<string, Set<string>>()
  for (const link of linkResponse) {
    if (!programsByCollege.has(link.college_code)) {
      programsByCollege.set(link.college_code, new Set<string>())
    }

    programsByCollege.get(link.college_code)?.add(link.program_code)
  }

  const studentCountsByProgram = new Map<string, number>()
  for (const link of studentProgramLinks) {
    studentCountsByProgram.set(
      link.program_code,
      (studentCountsByProgram.get(link.program_code) ?? 0) + 1
    )
  }

  return collegeResponse.map((college) => {
    const programCodes = programsByCollege.get(college.code) ?? new Set<string>()
    let studentCount = 0

    for (const programCode of programCodes) {
      studentCount += studentCountsByProgram.get(programCode) ?? 0
    }

    return {
      code: college.code,
      collegeName: college.name,
      programCount: programCodes.size,
      studentCount,
    }
  })
}

export async function createCollege(payload: CreateCollegePayload) {
  ensureTauriRuntime()
  return invoke('create_college', { payload })
}

export async function updateCollege(code: string, payload: UpdateCollegePayload) {
  ensureTauriRuntime()
  return invoke('update_college', { code, payload })
}

export async function deleteCollege(code: string) {
  ensureTauriRuntime()
  return invoke('delete_college', { code })
}
