import { ArrowPathIcon, ArrowUpTrayIcon, BuildingLibraryIcon, PlusIcon } from '@heroicons/react/24/outline'
import CollegeTableComponent from '../tables/CollegeTableComponent'


interface CollegeDirectoryCardProps {
  isActive: boolean
}

function CollegeDirectoryCardComponent({ isActive }: CollegeDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

  return (
    <section className={sectionClassName} data-panel="colleges">
      <header className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <BuildingLibraryIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">College Directory</h1>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" id="btn-add-college" type="button">
            <PlusIcon className="heroicon-url" aria-hidden="true" />
            Add college
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center gap-2"
            id="btn-upload-college"
            type="button"
            aria-label="Import colleges"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
          </button>
          <button
            className="btn btn-secondary d-inline-flex align-items-center"
            id="btn-refresh-college"
            type="button"
            aria-label="Refresh colleges"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
          </button>
        </div>
      </header>
      <CollegeTableComponent />
    </section>
  )
}

export default CollegeDirectoryCardComponent
