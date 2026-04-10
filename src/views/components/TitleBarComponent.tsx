import { Cog6ToothIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Stack } from 'react-bootstrap'

interface TitleBarProps {
  onMinimizeWindow: () => void
  onCloseWindow: () => void
}

function TitleBarComponent({ onMinimizeWindow, onCloseWindow }: TitleBarProps) {
  const handleTitleBarDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <header
      className="app-titlebar"
      id="app-titlebar"
      data-tauri-drag-region
      onDoubleClick={handleTitleBarDoubleClick}
    >
      <div className="app-titlebar__drag-area">
        <div className="app-titlebar__brand">
          <img src="/img/appIcon.ico" alt="Acadex logo" className="app-titlebar__logo" draggable={false} />
          <span className="app-titlebar__title">cadex</span>
        </div>
      </div>

      <div className="app-titlebar__system">
        <span className="app-titlebar__system-text">Simple Student Information System</span>
      </div>

      <Stack direction="horizontal" gap={2} className="app-titlebar__actions">
        <Button
          variant="link"
          className="titlebar-btn"
          id="btn-settings"
          type="button"
          aria-label="Open settings"
          data-bs-toggle="modal"
          data-bs-target="#appSettingsModal"
        >
          <Cog6ToothIcon className="u-icon u-titlebar-icon" aria-hidden="true" />
        </Button>
        <Button
          variant="link"
          className="titlebar-btn"
          id="btn-minimize"
          aria-label="Minimize window"
          type="button"
          onClick={onMinimizeWindow}
        >
          <MinusIcon className="u-icon u-titlebar-icon" aria-hidden="true" />
        </Button>
        <Button
          variant="link"
          className="titlebar-btn titlebar-btn--close"
          id="btn-close"
          aria-label="Close window"
          type="button"
          onClick={onCloseWindow}
        >
          <XMarkIcon className="u-icon u-titlebar-icon" aria-hidden="true" />
        </Button>
      </Stack>
    </header>
  )
}

export default TitleBarComponent
