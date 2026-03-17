import type { AppViewProps } from '../models/AppModel'
import ProgramDirectoryCard from './components/cards/ProgramDirectoryCardComponent'
import StudentDirectoryCard from './components/cards/StudentDirectoryCardComponent'
import CollegeDirectoryCard from './components/cards/CollegeDirectoryCardComponent'
import DirectoryNav from './components/DirectoryNavComponent'
import TitleBar from './components/TitleBarComponent'

function AppView({
  activePanel,
  theme,
  showSplash,
  hideSplash,
  onToggleTheme,
  onMinimizeWindow,
  onCloseWindow,
  onSelectPanel,
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

      <div className="toast-container" aria-live="polite" aria-atomic="true"></div>

      <main className="container py-4 app-content">
        <div className="card shadow-sm app-card">
          <div className="card-body">
            <StudentDirectoryCard isActive={activePanel === 'students'} />
            <ProgramDirectoryCard isActive={activePanel === 'programs'} />
            <CollegeDirectoryCard isActive={activePanel === 'colleges'} />
          </div>
        </div>
      </main>
    </>
  )
}

export default AppView