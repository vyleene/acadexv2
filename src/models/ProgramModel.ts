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
