import { ArrowPathIcon, ArrowUpTrayIcon, ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/24/outline'
import ProgramTableComponent from '../tables/ProgramTableComponent'


interface ProgramDirectoryCardProps {
  isActive: boolean
}

function ProgramDirectoryCardComponent({ isActive }: ProgramDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

  return (
    <section className={sectionClassName} data-panel="programs">
      <header className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <ClipboardDocumentIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">Program Directory</h1>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" id="btn-add-program" type="button">
            <PlusIcon className="heroicon-url" aria-hidden="true" />
            Add program
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center gap-2"
            id="btn-upload-program"
            type="button"
            aria-label="Import programs"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center"
            id="btn-refresh-program"
            type="button"
            aria-label="Refresh programs"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
          </button>
        </div>
      </header>
      <ProgramTableComponent />
    </section>
  )
}

export default ProgramDirectoryCardComponent
