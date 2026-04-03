import { type CreateProgramPayload, type ProgramRow, type UpdateProgramPayload } from '../models/ProgramModel'
import { assertTauriRuntime, invokeTauri } from './tauriClient'

type BackendProgram = {
  code: string
  name: string
  college_code: string
}

type BackendCollege = {
  code: string
  name: string
}

type BackendStudent = {
  program_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to manage program data.'

export async function fetchProgramRows(): Promise<ProgramRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [programResponse, collegesResponse, studentsResponse] = await Promise.all([
    invokeTauri<BackendProgram[]>('list_programs'),
    invokeTauri<BackendCollege[]>('list_colleges'),
    invokeTauri<BackendStudent[]>('list_students'),
  ])

  const collegesByCode = new Map<string, string>()
  for (const college of collegesResponse) {
    collegesByCode.set(college.code, college.name)
  }

  const studentCountsByProgram = new Map<string, number>()
  for (const student of studentsResponse) {
    studentCountsByProgram.set(
      student.program_code,
      (studentCountsByProgram.get(student.program_code) ?? 0) + 1,
    )
  }

  return programResponse.map((program) => {
    const collegeCode = program.college_code
    const collegeName = collegesByCode.get(collegeCode) ?? 'N/A'

    return {
      code: program.code,
      programName: program.name,
      collegeCode: collegeCode || 'N/A',
      collegeName,
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

