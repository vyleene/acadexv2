import { AcademicCapIcon, ArrowPathIcon, ArrowUpTrayIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import StudentTableComponent from '../tables/StudentTableComponent'


interface StudentDirectoryCardProps {
  isActive: boolean
}

function StudentDirectoryCardComponent({ isActive }: StudentDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

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
          <Stack direction="horizontal" gap={2} className="align-items-center flex-wrap">
            <Button variant="primary" className="d-inline-flex align-items-center gap-2" id="btn-add-student" type="button">
            <UserPlusIcon className="heroicon-url" aria-hidden="true" />
            Add student
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center gap-2"
            id="btn-upload-student"
            type="button"
            aria-label="Import students"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center"
            id="btn-refresh-student"
            type="button"
            aria-label="Refresh students"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
            </Button>
          </Stack>
        </Stack>
      </header>
      <StudentTableComponent />
    </section>
  )
}

export default StudentDirectoryCardComponent
