import { useMemo } from 'react'
import { BuildingLibraryIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import { type ColumnDef } from '@tanstack/react-table'
import AddCollegeModalComponent from '../modals/AddCollegeModalComponent.tsx'
import DeleteCollegeModalComponent from '../modals/DeleteCollegeModalComponent.tsx'
import InfoCollegeModalComponent from '../modals/InfoCollegeModalComponent.tsx'
import CollegeTableComponent from '../tables/CollegeTableComponent.tsx'
import { useCollegeController } from '../../../controllers/useCollegeController'
import { type CollegeRow } from '../../../models/CollegeModel'


interface CollegeDirectoryCardProps {
  isActive: boolean
}

function CollegeDirectoryCardComponent({ isActive }: CollegeDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`
  const columns = useMemo<ColumnDef<CollegeRow>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'collegeName', header: 'College Name' },
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
              aria-label="Edit college"
              data-bs-toggle="modal"
              data-bs-target="#collegeModal"
              data-modal-mode="edit"
              data-college-code={cellContext.row.original.code}
              data-college-name={cellContext.row.original.collegeName}
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
              aria-label="Delete college"
              data-bs-toggle="modal"
              data-bs-target="#deleteCollegeModal"
              data-college-code={cellContext.row.original.code}
              data-college-name={cellContext.row.original.collegeName}
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

  const collegeController = useCollegeController({ columns })

  return (
    <section className={sectionClassName} data-panel="colleges">
      <header className="page-header">
        <Stack direction="horizontal" className="align-items-center justify-content-between flex-wrap gap-3">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <BuildingLibraryIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">College Directory</h1>
          </Stack>
        </Stack>
      </header>
      <CollegeTableComponent {...collegeController} />
      <AddCollegeModalComponent />
      <DeleteCollegeModalComponent />
      <InfoCollegeModalComponent />
    </section>
  )
}

export default CollegeDirectoryCardComponent
