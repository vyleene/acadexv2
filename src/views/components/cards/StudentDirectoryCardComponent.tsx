import { AcademicCapIcon, ArrowPathIcon, ArrowUpTrayIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import StudentTableComponent from '../tables/StudentTableComponent'


interface StudentDirectoryCardProps {
  isActive: boolean
}

function StudentDirectoryCardComponent({ isActive }: StudentDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

  return (
    <section className={sectionClassName} data-panel="students">
      <header className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <AcademicCapIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0" id="test">
              Student Directory
            </h1>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" id="btn-add-student" type="button">
            <UserPlusIcon className="heroicon-url" aria-hidden="true" />
            Add student
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center gap-2"
            id="btn-upload-student"
            type="button"
            aria-label="Import students"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center"
            id="btn-refresh-student"
            type="button"
            aria-label="Refresh students"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
          </button>
        </div>
      </header>
      <StudentTableComponent />
    </section>
  )
}

export default StudentDirectoryCardComponent
