import { BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { Stack } from 'react-bootstrap'
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
        </Stack>
      </header>
      <CollegeTableComponent />
    </section>
  )
}

export default CollegeDirectoryCardComponent
