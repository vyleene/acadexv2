import { ArrowPathIcon, ArrowUpTrayIcon, ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button, Stack } from 'react-bootstrap'
import ProgramTableComponent from '../tables/ProgramTableComponent'


interface ProgramDirectoryCardProps {
  isActive: boolean
}

function ProgramDirectoryCardComponent({ isActive }: ProgramDirectoryCardProps) {
  const sectionClassName = `directory-panel${isActive ? ' is-active' : ''}`

  return (
    <section className={sectionClassName} data-panel="programs">
      <header className="page-header">
        <Stack direction="horizontal" className="align-items-center justify-content-between flex-wrap gap-3">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <ClipboardDocumentIcon className="heroicon-url heroicon--lg text-primary" aria-hidden="true" />
            <h1 className="h3 mb-0">Program Directory</h1>
          </Stack>
          <Stack direction="horizontal" gap={2} className="align-items-center flex-wrap">
            <Button variant="primary" className="d-inline-flex align-items-center gap-2" id="btn-add-program" type="button">
            <PlusIcon className="heroicon-url" aria-hidden="true" />
            Add program
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center gap-2"
            id="btn-upload-program"
            type="button"
            aria-label="Import programs"
          >
            <ArrowUpTrayIcon className="heroicon-url" aria-hidden="true" />
            Import
            </Button>
            <Button
              variant="secondary"
              className="d-inline-flex align-items-center"
            id="btn-refresh-program"
            type="button"
            aria-label="Refresh programs"
          >
            <ArrowPathIcon className="heroicon-url" aria-hidden="true" />
            </Button>
          </Stack>
        </Stack>
      </header>
      <ProgramTableComponent />
    </section>
  )
}

export default ProgramDirectoryCardComponent
