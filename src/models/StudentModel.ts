import { invoke, isTauri } from '@tauri-apps/api/core'

export const STUDENT_ROWS_PER_PAGE = 10
export const STUDENTS_REFRESH_EVENT = 'students:refresh'

export type StudentRow = {
  id: number
  firstName: string
  lastName: string
  programCode: string
  year: string
  gender: string
  collegeCode: string
  collegeName: string
}

export type CreateStudentPayload = {
  id: number
  firstname: string
  lastname: string
  year: string
  gender: string
}

export type UpdateStudentPayload = {
  firstname: string
  lastname: string
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

function ensureTauriRuntime() {
  if (!isTauri()) {
    throw new Error(TAURI_REQUIRED_MESSAGE)
  }
}

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

export function formatStudentId(rawId?: string | number): string {
  if (rawId === null || rawId === undefined) {
    return 'N/A'
  }

  const digits = String(rawId).replace(/\D/g, '')

  if (digits.length !== 8) {
    return String(rawId)
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

export function formatGender(value?: string): string {
  if (!value) {
    return 'N/A'
  }

  if (value === 'M') {
    return 'Male'
  }

  if (value === 'F') {
    return 'Female'
  }

  return value
}

export function formatYearLevel(value?: string): string {
  switch (value) {
    case '1':
      return '1st Year'
    case '2':
      return '2nd Year'
    case '3':
      return '3rd Year'
    case '4':
      return '4th Year'
    default:
      return value ?? 'N/A'
  }
}

export function normalizeProgramCode(value?: string): string {
  if (!value || value === 'N/A') {
    return ''
  }

  return value
}

export function splitStudentId(studentIdRaw: string) {
  const digits = studentIdRaw.replace(/\D/g, '')
  const idYear = digits.slice(0, 4)
  const rawIdNumber = digits.slice(4, 8)
  const idNumber = rawIdNumber ? rawIdNumber.padStart(4, '0') : ''

  return {
    digits,
    idYear,
    idNumber,
  }
}

export function buildStudentId(idYear: string, idNumber: string): number | null {
  if (!/^\d{4}$/.test(idYear) || !/^\d{4}$/.test(idNumber)) {
    return null
  }

  const mergedId = `${idYear}${idNumber}`
  const parsedId = Number.parseInt(mergedId, 10)

  return Number.isFinite(parsedId) ? parsedId : null
}

export function getIdYearOptions(currentYear: number): number[] {
  const years: number[] = []

  for (let offset = 4; offset >= 0; offset -= 1) {
    years.push(currentYear - offset)
  }

  return years
}

export async function fetchStudentRows(): Promise<StudentRow[]> {
  ensureTauriRuntime()

  const [studentsResponse, linkResponse, collegesResponse] = await Promise.all([
    invoke<BackendStudent[]>('list_students'),
    invoke<BackendCollegeProgramLink[]>('list_college_program_links'),
    invoke<BackendCollege[]>('list_colleges'),
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

  if (!isTauri()) {
    return []
  }

  pendingProgramCodesRequest = invoke<BackendProgram[]>('list_programs')
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
  ensureTauriRuntime()

  const student = await invoke<BackendStudentProgram | null>('read_student', { id: studentId })
  return student?.program_code ?? null
}

export async function createStudent(payload: CreateStudentPayload) {
  ensureTauriRuntime()
  return invoke('create_student', { payload })
}

export async function updateStudent(id: number, payload: UpdateStudentPayload) {
  ensureTauriRuntime()
  return invoke('update_student', { id, payload })
}

export async function deleteStudent(id: number) {
  ensureTauriRuntime()
  return invoke('delete_student', { id })
}

export async function syncStudentProgramLink(
  studentId: number,
  previousProgramCode: string,
  nextProgramCode: string,
) {
  ensureTauriRuntime()

  const previousCode = normalizeProgramCode(previousProgramCode)
  const nextCode = normalizeProgramCode(nextProgramCode)

  if (previousCode === nextCode) {
    return
  }

  if (previousCode && nextCode) {
    try {
      await invoke('update_student_program_link', {
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

    await invoke('create_student_program_link', {
      payload: {
        student_id: studentId,
        program_code: nextCode,
      },
    })
    return
  }

  if (!previousCode && nextCode) {
    await invoke('create_student_program_link', {
      payload: {
        student_id: studentId,
        program_code: nextCode,
      },
    })
    return
  }

  if (previousCode && !nextCode) {
    await invoke('delete_student_program_link', {
      student_id: studentId,
      program_code: previousCode,
    })
  }
}
