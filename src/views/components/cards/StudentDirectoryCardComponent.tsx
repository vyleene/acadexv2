import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { Stack } from 'react-bootstrap'
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
        </Stack>
      </header>
      <StudentTableComponent />
    </section>
  )
}

export default StudentDirectoryCardComponent
