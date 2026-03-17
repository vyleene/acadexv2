import type { PanelKey } from '../../models/AppModel'
import { BuildingLibraryIcon, ClipboardDocumentIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface DirectoryNavProps {
  activePanel: PanelKey
  onSelectPanel: (panel: PanelKey) => void
}

function DirectoryNavComponent({ activePanel, onSelectPanel }: DirectoryNavProps) {
  const getNavClassName = (panel: PanelKey) =>
    `app-nav__item${activePanel === panel ? ' is-active' : ''}`

  return (
    <nav className="app-nav" aria-label="Directory navigation">
      <div className="app-nav__container">
        <div className="app-nav__logo">
          <img src="/img/appIcon.ico" width="48" height="48" alt="A" />
          <span>cadex.</span>
        </div>

        <button
          className={getNavClassName('students')}
          type="button"
          data-panel="students"
          onClick={() => onSelectPanel('students')}
        >
          <UserGroupIcon className="heroicon-url" aria-hidden="true" />
          Student Directory
        </button>

        <button
          className={getNavClassName('programs')}
          type="button"
          data-panel="programs"
          onClick={() => onSelectPanel('programs')}
        >
          <ClipboardDocumentIcon className="heroicon-url" aria-hidden="true" />
          Program Directory
        </button>

        <button
          className={getNavClassName('colleges')}
          type="button"
          data-panel="colleges"
          onClick={() => onSelectPanel('colleges')}
        >
          <BuildingLibraryIcon className="heroicon-url" aria-hidden="true" />
          College Directory
        </button>
      </div>
    </nav>
  )
}

export default DirectoryNavComponent
