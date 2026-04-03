import { type CollegeRow, type CreateCollegePayload, type UpdateCollegePayload } from '../models/CollegeModel'
import { assertTauriRuntime, invokeTauri } from './tauriClient'

type BackendCollege = {
  code: string
  name: string
}
type BackendProgram = {
  code: string
  college_code: string
}

type BackendStudent = {
  program_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to manage college data.'

export async function fetchCollegeRows(): Promise<CollegeRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [collegeResponse, programResponse, studentResponse] = await Promise.all([
    invokeTauri<BackendCollege[]>('list_colleges'),
    invokeTauri<BackendProgram[]>('list_programs'),
    invokeTauri<BackendStudent[]>('list_students'),
  ])

  const programsByCollege = new Map<string, Set<string>>()
  for (const program of programResponse) {
    if (!programsByCollege.has(program.college_code)) {
      programsByCollege.set(program.college_code, new Set<string>())
    }
    programsByCollege.get(program.college_code)?.add(program.code)
  }

  const studentCountsByProgram = new Map<string, number>()
  for (const student of studentResponse) {
    studentCountsByProgram.set(
      student.program_code,
      (studentCountsByProgram.get(student.program_code) ?? 0) + 1,
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
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('create_college', { payload })
}

export async function updateCollege(code: string, payload: UpdateCollegePayload) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('update_college', { code, payload })
}

export async function deleteCollege(code: string) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('delete_college', { code })
}
