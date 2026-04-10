export const STUDENT_ROWS_PER_PAGE = 10
export const STUDENTS_REFRESH_EVENT = 'students:refresh'

export type StudentRow = {
  id: number
  firstName: string
  lastName: string
  programCode: string
  programName: string
  year: string
  gender: string
  collegeCode: string
  collegeName: string
}

export type CreateStudentPayload = {
  id: number
  program_code: string
  firstname: string
  lastname: string
  year: string
  gender: string
}

export type UpdateStudentPayload = {
  program_code: string
  firstname: string
  lastname: string
  year: string
  gender: string
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
