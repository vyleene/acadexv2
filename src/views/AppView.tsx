import type { AppViewProps } from '../models/AppModel'
import { Card, Container } from 'react-bootstrap'
import ProgramDirectoryCard from './components/cards/ProgramDirectoryCardComponent'
import StudentDirectoryCard from './components/cards/StudentDirectoryCardComponent'
import CollegeDirectoryCard from './components/cards/CollegeDirectoryCardComponent'
import DirectoryNav from './components/DirectoryNavComponent'
import TitleBar from './components/TitleBarComponent'
import ToastComponent from './components/ToastComponent.tsx'

function AppView({
  activePanel,
  theme,
  showSplash,
  hideSplash,
  toasts,
  onToggleTheme,
  onMinimizeWindow,
  onCloseWindow,
  onSelectPanel,
  onDismissToast,
}: AppViewProps) {
  return (
    <>
      {showSplash && <div id="splash-screen" className={hideSplash ? 'hide' : ''}></div>}

      <TitleBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onMinimizeWindow={onMinimizeWindow}
        onCloseWindow={onCloseWindow}
      />

      <DirectoryNav activePanel={activePanel} onSelectPanel={onSelectPanel} />

      <ToastComponent toasts={toasts} onDismissToast={onDismissToast} />

      <Container as="main" className="py-4 app-content">
        <Card className="shadow-sm app-card">
          <Card.Body>
            <StudentDirectoryCard isActive={activePanel === 'students'} />
            <ProgramDirectoryCard isActive={activePanel === 'programs'} />
            <CollegeDirectoryCard isActive={activePanel === 'colleges'} />
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default AppView