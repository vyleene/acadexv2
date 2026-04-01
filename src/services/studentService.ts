import {
  normalizeProgramCode,
  type CreateStudentPayload,
  type StudentRow,
  type UpdateStudentPayload,
} from '../models/StudentModel'
import { assertTauriRuntime, invokeTauri, isTauriRuntime } from './tauriClient'

type BackendStudent = {
  id: number
  firstname: string
  lastname: string
  year: string
  gender: string
  program_code: string | null
}

type BackendCollegeProgramLink = {
  college_code: string
  program_code: string
}

type BackendCollege = {
  code: string
  name: string
}

type BackendProgram = {
  code: string
}

type BackendStudentProgram = {
  program_code: string | null
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
    programCode: student.program_code ?? 'N/A',
    year: student.year,
    gender: student.gender,
    collegeCode: 'N/A',
    collegeName: 'N/A',
  }
}

export async function fetchStudentRows(): Promise<StudentRow[]> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const [studentsResponse, linkResponse, collegesResponse] = await Promise.all([
    invokeTauri<BackendStudent[]>('list_students'),
    invokeTauri<BackendCollegeProgramLink[]>('list_college_program_links'),
    invokeTauri<BackendCollege[]>('list_colleges'),
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

  return studentsResponse.map((student) => {
    const row = mapStudentRow(student)
    if (row.programCode === 'N/A') {
      return row
    }

    const codes = Array.from(collegesByProgram.get(row.programCode) ?? []).sort((a, b) =>
      a.localeCompare(b)
    )

    if (codes.length === 0) {
      return row
    }

    const names = codes.map((code) => collegesByCode.get(code) ?? 'N/A')

    return {
      ...row,
      collegeCode: codes.join(', '),
      collegeName: names.join(', '),
    }
  })
}

export async function fetchProgramCodes(): Promise<string[]> {
  if (cachedProgramCodes && Date.now() - programCodesCachedAt < PROGRAM_CODES_CACHE_TTL_MS) {
    return cachedProgramCodes
  }

  if (pendingProgramCodesRequest) {
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

export async function fetchStudentProgramCode(studentId: number): Promise<string | null> {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const student = await invokeTauri<BackendStudentProgram | null>('read_student', { id: studentId })
  return student?.program_code ?? null
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

export async function syncStudentProgramLink(
  studentId: number,
  previousProgramCode: string,
  nextProgramCode: string,
) {
  assertTauriRuntime(TAURI_REQUIRED_MESSAGE)

  const previousCode = normalizeProgramCode(previousProgramCode)
  const nextCode = normalizeProgramCode(nextProgramCode)

  if (previousCode === nextCode) {
    return
  }

  if (previousCode && nextCode) {
    try {
      await invokeTauri('update_student_program_link', {
        student_id: studentId,
        program_code: previousCode,
        payload: {
          new_student_id: studentId,
          new_program_code: nextCode,
        },
      })
      return
    } catch (error) {
      console.error('Failed to update student program link:', error)
    }

    await invokeTauri('create_student_program_link', {
      payload: {
        student_id: studentId,
        program_code: nextCode,
      },
    })
    return
  }

  if (!previousCode && nextCode) {
    await invokeTauri('create_student_program_link', {
      payload: {
        student_id: studentId,
        program_code: nextCode,
      },
    })
    return
  }

  if (previousCode && !nextCode) {
    await invokeTauri('delete_student_program_link', {
      student_id: studentId,
      program_code: previousCode,
    })
  }
}
