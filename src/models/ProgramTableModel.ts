import { invoke, isTauri } from '@tauri-apps/api/core'

export const PROGRAM_ROWS_PER_PAGE = 10

export type ProgramRow = {
  code: string
  programName: string
  college: string
}

type BackendProgram = {
  code: string
  name: string
}

type BackendCollegeProgramLink = {
  college_code: string
  program_code: string
}

const TAURI_REQUIRED_MESSAGE = 'Tauri runtime is required to load MySQL-backed program data.'

export async function fetchProgramRows(): Promise<ProgramRow[]> {
  if (!isTauri()) {
    throw new Error(TAURI_REQUIRED_MESSAGE)
  }

  const [programResponse, linkResponse] = await Promise.all([
    invoke<BackendProgram[]>('list_programs'),
    invoke<BackendCollegeProgramLink[]>('list_college_program_links'),
  ])

  const collegesByProgram = new Map<string, Set<string>>()
  for (const link of linkResponse) {
    if (!collegesByProgram.has(link.program_code)) {
      collegesByProgram.set(link.program_code, new Set<string>())
    }

    collegesByProgram.get(link.program_code)?.add(link.college_code)
  }

  return programResponse.map((program) => {
    const codes = Array.from(collegesByProgram.get(program.code) ?? []).sort((a, b) =>
      a.localeCompare(b)
    )

    return {
      code: program.code,
      programName: program.name,
      college: codes.length > 0 ? codes.join(', ') : 'N/A',
    }
  })
}
