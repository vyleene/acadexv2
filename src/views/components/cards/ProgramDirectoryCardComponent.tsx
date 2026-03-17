import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { Stack } from 'react-bootstrap'
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
        </Stack>
      </header>
      <ProgramTableComponent />
    </section>
  )
}

export default ProgramDirectoryCardComponent
