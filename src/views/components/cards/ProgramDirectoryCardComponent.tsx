import { useMemo } from 'react'
import { ClipboardDocumentIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import { type ColumnDef } from '@tanstack/react-table'
import AddProgramModalComponent from '../modals/AddProgramModalComponent.tsx'
import DeleteProgramModalComponent from '../modals/DeleteProgramModalComponent.tsx'
import InfoProgramModalComponent from '../modals/InfoProgramModalComponent.tsx'
import ProgramTableComponent from '../tables/ProgramTableComponent.tsx'
import { useProgramViewModel } from '../../../viewmodels/useProgramViewModel'
import { type ProgramRow } from '../../../models/ProgramModel'


interface ProgramDirectoryCardProps {
  isActive: boolean
}

function ProgramDirectoryCardComponent({ isActive }: ProgramDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`
  const columns = useMemo<ColumnDef<ProgramRow>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'programName', header: 'Program Name' },
      { accessorKey: 'collegeCode', header: 'College' },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (cellContext) => (
          <div className="d-inline-flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              className="d-inline-flex align-items-center gap-1"
              aria-label="Edit program"
              data-bs-toggle="modal"
              data-bs-target="#programModal"
              data-modal-mode="edit"
              data-program-code={cellContext.row.original.code}
              data-program-name={cellContext.row.original.programName}
              data-college-code={cellContext.row.original.collegeCode}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <PencilSquareIcon className="heroicon-url" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-danger"
              className="d-inline-flex align-items-center gap-1"
              aria-label="Delete program"
              data-bs-toggle="modal"
              data-bs-target="#deleteProgramModal"
              data-program-code={cellContext.row.original.code}
              data-program-name={cellContext.row.original.programName}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <TrashIcon className="heroicon-url" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const programViewModel = useProgramViewModel({ columns })

  return (
    <section className={sectionClassName} data-panel="programs">
      <header className="page-header">
        <Stack direction="horizontal" className="align-items-center justify-content-between flex-wrap gap-3">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <ClipboardDocumentIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">Program Directory</h1>
          </Stack>
        </Stack>
      </header>
      <ProgramTableComponent {...programViewModel} />
      <AddProgramModalComponent />
      <DeleteProgramModalComponent />
      <InfoProgramModalComponent />
    </section>
  )
}

export default ProgramDirectoryCardComponent
