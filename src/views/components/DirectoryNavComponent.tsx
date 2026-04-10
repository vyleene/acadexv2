import type { PanelKey } from '../../models/AppModel'
import { BuildingLibraryIcon, ClipboardDocumentIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Nav } from 'react-bootstrap'

interface DirectoryNavProps {
  activePanel: PanelKey
  onSelectPanel: (panel: PanelKey) => void
}

function DirectoryNavComponent({ activePanel, onSelectPanel }: DirectoryNavProps) {
  const getNavClassName = (panel: PanelKey) =>
    `app-nav__item${activePanel === panel ? ' is-active' : ''}`

  return (
    <Nav as="nav" className="app-nav" aria-label="Directory navigation">
      <div className="app-nav__container">
        <Nav.Item as="div">
          <Nav.Link
            as="button"
            className={getNavClassName('students')}
            type="button"
            data-panel="students"
            onClick={() => onSelectPanel('students')}
          >
            <UserGroupIcon className="u-icon" aria-hidden="true" />
            Student Directory
          </Nav.Link>
        </Nav.Item>

        <Nav.Item as="div">
          <Nav.Link
            as="button"
            className={getNavClassName('programs')}
            type="button"
            data-panel="programs"
            onClick={() => onSelectPanel('programs')}
          >
            <ClipboardDocumentIcon className="u-icon" aria-hidden="true" />
            Program Directory
          </Nav.Link>
        </Nav.Item>

        <Nav.Item as="div">
          <Nav.Link
            as="button"
            className={getNavClassName('colleges')}
            type="button"
            data-panel="colleges"
            onClick={() => onSelectPanel('colleges')}
          >
            <BuildingLibraryIcon className="u-icon" aria-hidden="true" />
            College Directory
          </Nav.Link>
        </Nav.Item>
      </div>
    </Nav>
  )
}

export default DirectoryNavComponent
