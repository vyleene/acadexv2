import { invoke, isTauri } from '@tauri-apps/api/core'

export const PROGRAM_ROWS_PER_PAGE = 10
export const PROGRAMS_REFRESH_EVENT = 'programs:refresh'

export type ProgramRow = {
  code: string
  programName: string
  collegeCode: string
  collegeName: string
  studentCount: number
}

export type CreateProgramPayload = {
  code: string
  name: string
}

export type UpdateProgramPayload = {
  name: string
}

type BackendProgram = {
  code: string
  name: string
}

type BackendCollegeProgramLink = {
  college_code: string
  program_code: string
}

type BackendCollege = {
  code: string
  name: string
}

type BackendStudentProgramLink = {
  student_id: number
  program_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to manage program data.'

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

export function normalizeProgramCode(value?: string): string {
  if (!value || value === 'N/A') {
    return ''
  }

  return value
}

export function getPrimaryCollegeCode(value?: string): string {
  if (!value) {
    return ''
  }

  const codes = value
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean)

  return codes[0] ?? ''
}

export async function fetchProgramRows(): Promise<ProgramRow[]> {
  ensureTauriRuntime()

  const [programResponse, linkResponse, collegesResponse, studentProgramLinks] = await Promise.all([
    invoke<BackendProgram[]>('list_programs'),
    invoke<BackendCollegeProgramLink[]>('list_college_program_links'),
    invoke<BackendCollege[]>('list_colleges'),
    invoke<BackendStudentProgramLink[]>('list_student_program_links'),
  ])

  const collegesByCode = new Map<string, string>()
  for (const college of collegesResponse) {
    collegesByCode.set(college.code, college.name)
  }

  const collegesByProgram = new Map<string, Set<string>>()
  for (const link of linkResponse) {
    if (!collegesByProgram.has(link.program_code)) {
      collegesByProgram.set(link.program_code, new Set<string>())
    }

    collegesByProgram.get(link.program_code)?.add(link.college_code)
  }

  const studentCountsByProgram = new Map<string, number>()
  for (const link of studentProgramLinks) {
    studentCountsByProgram.set(
      link.program_code,
      (studentCountsByProgram.get(link.program_code) ?? 0) + 1
    )
  }

  return programResponse.map((program) => {
    const codes = Array.from(collegesByProgram.get(program.code) ?? []).sort((a, b) =>
      a.localeCompare(b)
    )
    const names = codes.map((code) => collegesByCode.get(code) ?? 'N/A')

    return {
      code: program.code,
      programName: program.name,
      collegeCode: codes.length > 0 ? codes.join(', ') : 'N/A',
      collegeName: names.length > 0 ? names.join(', ') : 'N/A',
      studentCount: studentCountsByProgram.get(program.code) ?? 0,
    }
  })
}

export async function fetchCollegeCodes(): Promise<string[]> {
  ensureTauriRuntime()

  const colleges = await invoke<BackendCollege[]>('list_colleges')
  return colleges
    .map((college) => college.code)
    .sort((left, right) => left.localeCompare(right))
}

export async function fetchProgramCollegeCodes(programCode: string): Promise<string[]> {
  ensureTauriRuntime()

  const links = await invoke<BackendCollegeProgramLink[]>('list_college_program_links')
  return links
    .filter((link) => link.program_code === programCode)
    .map((link) => link.college_code)
    .sort((left, right) => left.localeCompare(right))
}

export async function createProgram(payload: CreateProgramPayload) {
  ensureTauriRuntime()
  return invoke('create_program', { payload })
}

export async function updateProgram(code: string, payload: UpdateProgramPayload) {
  ensureTauriRuntime()
  return invoke('update_program', { code, payload })
}

export async function deleteProgram(code: string) {
  ensureTauriRuntime()
  return invoke('delete_program', { code })
}

export async function syncProgramCollegeLink(
  programCode: string,
  previousCollegeCode: string,
  nextCollegeCode: string,
) {
  ensureTauriRuntime()

  const previousCode = normalizeCollegeCode(previousCollegeCode)
  const nextCode = normalizeCollegeCode(nextCollegeCode)

  if (previousCode === nextCode) {
    return
  }

  if (previousCode && nextCode) {
    try {
      await invoke('update_college_program_link', {
        college_code: previousCode,
        program_code: programCode,
        payload: {
          new_college_code: nextCode,
          new_program_code: programCode,
        },
      })
      return
    } catch (error) {
      console.error('Failed to update college-program link:', error)
    }

    await invoke('create_college_program_link', {
      payload: {
        college_code: nextCode,
        program_code: programCode,
      },
    })
    return
  }

  if (!previousCode && nextCode) {
    await invoke('create_college_program_link', {
      payload: {
        college_code: nextCode,
        program_code: programCode,
      },
    })
    return
  }

  if (previousCode && !nextCode) {
    await invoke('delete_college_program_link', {
      college_code: previousCode,
      program_code: programCode,
    })
  }
}
