import { type CreateStudentPayload, type StudentRow, type UpdateStudentPayload } from '../models/StudentModel'
import { assertTauriRuntime, invokeTauri, isTauriRuntime } from './tauriClient'

type BackendStudent = {
  id: number
  firstname: string
  lastname: string
  year: string
  gender: string
  program_code: string
}

type BackendCollege = {
  code: string
  name: string
}

type BackendProgram = {
  code: string
  name: string
  college_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to manage student data.'
const PROGRAM_CODES_CACHE_TTL_MS = 60_000

let cachedProgramCodes: string[] | null = null
let pendingProgramCodesRequest: Promise<string[]> | null = null
let programCodesCachedAt = 0

function mapStudentRow(student: BackendStudent): StudentRow {
  return {
    id: student.id,
    firstName: student.firstname,
    lastName: student.lastname,
    programCode: student.program_code || 'N/A',
    programName: 'N/A',
    year: student.year,
    gender: student.gender,
    collegeCode: 'N/A',
    collegeName: 'N/A',
  }
}

export async function fetchStudentRows(): Promise<StudentRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [studentsResponse, programsResponse, collegesResponse] = await Promise.all([
    invokeTauri<BackendStudent[]>('list_students'),
    invokeTauri<BackendProgram[]>('list_programs'),
    invokeTauri<BackendCollege[]>('list_colleges'),
  ])

  const collegesByCode = new Map<string, string>()
  for (const college of collegesResponse) {
    collegesByCode.set(college.code, college.name)
  }

  const programsByCode = new Map<string, { programName: string; collegeCode: string }>()
  for (const program of programsResponse) {
    programsByCode.set(program.code, {
      programName: program.name,
      collegeCode: program.college_code,
    })
  }

  return studentsResponse.map((student) => {
    const row = mapStudentRow(student)
    if (row.programCode === 'N/A') {
      return row
    }

    const program = programsByCode.get(row.programCode)

    if (!program) {
      return row
    }

    const collegeCode = program.collegeCode
    const collegeName = collegeCode ? collegesByCode.get(collegeCode) ?? 'N/A' : 'N/A'

    return {
      ...row,
      programName: program.programName || 'N/A',
      collegeCode: collegeCode || 'N/A',
      collegeName,
    }
  })
}

export async function fetchProgramCodes(forceRefresh = false): Promise<string[]> {
  if (!forceRefresh && cachedProgramCodes && Date.now() - programCodesCachedAt < PROGRAM_CODES_CACHE_TTL_MS) {
    return cachedProgramCodes
  }

  if (!forceRefresh && pendingProgramCodesRequest) {
    return pendingProgramCodesRequest
  }

  if (!isTauriRuntime()) {
    return []
  }

  pendingProgramCodesRequest = invokeTauri<BackendProgram[]>('list_programs')
    .then((programs) => {
      cachedProgramCodes = programs
        .map((program) => program.code)
        .sort((left, right) => left.localeCompare(right))
      programCodesCachedAt = Date.now()

      return cachedProgramCodes
    })
    .catch((error) => {
      console.error('Failed to load program codes for student modal:', error)
      return []
    })
    .finally(() => {
      pendingProgramCodesRequest = null
    })

  return pendingProgramCodesRequest
}

export async function createStudent(payload: CreateStudentPayload) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('create_student', { payload })
}

export async function updateStudent(id: number, payload: UpdateStudentPayload) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('update_student', { id, payload })
}

export async function deleteStudent(id: number) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)
  return invokeTauri('delete_student', { id })
}
