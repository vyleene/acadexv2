import { Cog6ToothIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Button, Stack } from 'react-bootstrap'

interface TitleBarProps {
  onMinimizeWindow: () => void
  onCloseWindow: () => void
}

function TitleBarComponent({ onMinimizeWindow, onCloseWindow }: TitleBarProps) {
  return (
    <header className="app-titlebar" id="app-titlebar">
      <div className="app-titlebar__drag-area" data-tauri-drag-region>
        <div className="app-titlebar__brand">
          <span className="app-titlebar__dot"></span>
          <span className="app-titlebar__title">Acadex</span>
        </div>
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
          <Cog6ToothIcon className="heroicon-url titlebar-icon" aria-hidden="true" />
        </Button>
        <Button
          variant="link"
          className="titlebar-btn"
          id="btn-minimize"
          aria-label="Minimize window"
          type="button"
          onClick={onMinimizeWindow}
        >
          <MinusIcon className="heroicon-url titlebar-icon" aria-hidden="true" />
        </Button>
        <Button
          variant="link"
          className="titlebar-btn titlebar-btn--close"
          id="btn-close"
          aria-label="Close window"
          type="button"
          onClick={onCloseWindow}
        >
          <XMarkIcon className="heroicon-url titlebar-icon" aria-hidden="true" />
        </Button>
      </Stack>
    </header>
  )
}

export default TitleBarComponent
