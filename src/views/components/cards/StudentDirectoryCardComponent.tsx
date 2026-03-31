import { useMemo } from 'react'
import { AcademicCapIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import { type ColumnDef } from '@tanstack/react-table'
import AddStudentModalComponent from '../modals/AddStudentModalComponent'
import DeleteStudentModalComponent from '../modals/DeleteStudentModalComponent'
import InfoStudentModalComponent from '../modals/InfoStudentModalComponent'
import StudentTableComponent from '../tables/StudentTableComponent'
import { useStudentController } from '../../../controllers/useStudentController'
import {
  formatGender,
  formatStudentId,
  formatYearLevel,
  type StudentRow,
} from '../../../models/StudentModel'


interface StudentDirectoryCardProps {
  isActive: boolean
}

function StudentDirectoryCardComponent({ isActive }: StudentDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`
  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => formatStudentId(row.original.id),
      },
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' },
      { accessorKey: 'programCode', header: 'Program Code' },
      {
        accessorKey: 'year',
        header: 'Year',
        cell: ({ row }) => formatYearLevel(row.original.year),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => formatGender(row.original.gender),
      },
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
              aria-label="Edit student"
              data-bs-toggle="modal"
              data-bs-target="#studentModal"
              data-modal-mode="edit"
              data-student-id={String(cellContext.row.original.id)}
              data-student-first-name={cellContext.row.original.firstName}
              data-student-last-name={cellContext.row.original.lastName}
              data-student-program-code={cellContext.row.original.programCode}
              data-student-year={cellContext.row.original.year}
              data-student-gender={cellContext.row.original.gender}
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
              aria-label="Delete student"
              data-bs-toggle="modal"
              data-bs-target="#deleteStudentModal"
              data-student-id={String(cellContext.row.original.id)}
              data-student-first-name={cellContext.row.original.firstName}
              data-student-last-name={cellContext.row.original.lastName}
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

  const studentController = useStudentController({ columns })

  return (
    <section className={sectionClassName} data-panel="students">
      <header className="page-header">
        <Stack direction="horizontal" className="align-items-center justify-content-between flex-wrap gap-3">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <AcademicCapIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0" id="test">
              Student Directory
            </h1>
          </Stack>
        </Stack>
      </header>
      <StudentTableComponent {...studentController} />
      <AddStudentModalComponent />
      <DeleteStudentModalComponent />
      <InfoStudentModalComponent />
    </section>
  )
}

export default StudentDirectoryCardComponent
