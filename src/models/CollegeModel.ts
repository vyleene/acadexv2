export const COLLEGE_ROWS_PER_PAGE = 10
export const COLLEGES_REFRESH_EVENT = 'colleges:refresh'

export type CollegeRow = {
  code: string
  collegeName: string
  programCount: number
  studentCount: number
}

export type CreateCollegePayload = {
  code: string
  name: string
}

export type UpdateCollegePayload = {
  code: string
  name: string
}

export function normalizeCollegeCode(value?: string): string {
  if (!value || value === 'N/A') {
    return ''
  }

  return value
}
