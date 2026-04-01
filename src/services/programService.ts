import {
  normalizeCollegeCode,
  type CreateProgramPayload,
  type ProgramRow,
  type UpdateProgramPayload,
} from '../models/ProgramModel'
import { assertTauriRuntime, invokeTauri } from './tauriClient'

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

export async function fetchProgramRows(): Promise<ProgramRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [programResponse, linkResponse, collegesResponse, studentProgramLinks] = await Promise.all([
    invokeTauri<BackendProgram[]>('list_programs'),
    invokeTauri<BackendCollegeProgramLink[]>('list_college_program_links'),
    invokeTauri<BackendCollege[]>('list_colleges'),
    invokeTauri<BackendStudentProgramLink[]>('list_student_program_links'),
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
      (studentCountsByProgram.get(link.program_code) ?? 0) + 1,
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
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const colleges = await invokeTauri<BackendCollege[]>('list_colleges')
  return colleges
    .map((college) => college.code)
    .sort((left, right) => left.localeCompare(right))
}

export async function fetchProgramCollegeCodes(programCode: string): Promise<string[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const links = await invokeTauri<BackendCollegeProgramLink[]>('list_college_program_links')
  return links
    .filter((link) => link.program_code === programCode)
    .map((link) => link.college_code)
    .sort((left, right) => left.localeCompare(right))
}

export async function createProgram(payload: CreateProgramPayload) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('create_program', { payload })
}

export async function updateProgram(code: string, payload: UpdateProgramPayload) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('update_program', { code, payload })
}

export async function deleteProgram(code: string) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('delete_program', { code })
}

export async function syncProgramCollegeLink(
  programCode: string,
  previousCollegeCode: string,
  nextCollegeCode: string,
) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const previousCode = normalizeCollegeCode(previousCollegeCode)
  const nextCode = normalizeCollegeCode(nextCollegeCode)

  if (previousCode === nextCode) {
    return
  }

  if (previousCode && nextCode) {
    try {
      await invokeTauri('update_college_program_link', {
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

    await invokeTauri('create_college_program_link', {
      payload: {
        college_code: nextCode,
        program_code: programCode,
      },
    })
    return
  }

  if (!previousCode && nextCode) {
    await invokeTauri('create_college_program_link', {
      payload: {
        college_code: nextCode,
        program_code: programCode,
      },
    })
    return
  }

  if (previousCode && !nextCode) {
    await invokeTauri('delete_college_program_link', {
      college_code: previousCode,
      program_code: programCode,
    })
  }
}

