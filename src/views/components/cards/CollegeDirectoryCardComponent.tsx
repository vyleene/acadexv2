import { ArrowPathIcon, ArrowUpTrayIcon, BuildingLibraryIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import CollegeTableComponent from '../tables/CollegeTableComponent'


interface CollegeDirectoryCardProps {
  isActive: boolean
}

function CollegeDirectoryCardComponent({ isActive }: CollegeDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

  return (
    <section className={sectionClassName} data-panel="colleges">
      <header className="page-header">
        <Stack direction="horizontal" className="align-items-center justify-content-between flex-wrap gap-3">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <BuildingLibraryIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">College Directory</h1>
          </Stack>
          <Stack direction="horizontal" gap={2} className="align-items-center flex-wrap">
            <Button variant="primary" className="d-inline-flex align-items-center gap-2" id="btn-add-college" type="button">
            <PlusIcon className="heroicon-url" aria-hidden="true" />
            Add college
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center gap-2"
            id="btn-upload-college"
            type="button"
            aria-label="Import colleges"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center"
            id="btn-refresh-college"
            type="button"
            aria-label="Refresh colleges"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
            </Button>
          </Stack>
        </Stack>
      </header>
      <CollegeTableComponent />
    </section>
  )
}

export default CollegeDirectoryCardComponent
