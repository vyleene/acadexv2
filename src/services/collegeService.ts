import { type CollegeRow, type CreateCollegePayload, type UpdateCollegePayload } from '../models/CollegeModel'
import { assertTauriRuntime, invokeTauri } from './tauriClient'

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

export async function fetchCollegeRows(): Promise<CollegeRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [collegeResponse, linkResponse, studentProgramLinks] = await Promise.all([
    invokeTauri<BackendCollege[]>('list_colleges'),
    invokeTauri<BackendCollegeProgramLink[]>('list_college_program_links'),
    invokeTauri<BackendStudentProgramLink[]>('list_student_program_links'),
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
      (studentCountsByProgram.get(link.program_code) ?? 0) + 1,
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
