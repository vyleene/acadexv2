import type { AppViewProps } from '../models/AppModel'
import { Card, Container } from 'react-bootstrap'
import ProgramDirectoryCard from './components/cards/ProgramDirectoryCardComponent'
import StudentDirectoryCard from './components/cards/StudentDirectoryCardComponent'
import CollegeDirectoryCard from './components/cards/CollegeDirectoryCardComponent'
import DirectoryNav from './components/DirectoryNavComponent'
import LoginPageView from './LoginPageView'
import LoadingScreenView from './LoadingScreenView'
import TitleBar from './components/TitleBarComponent'
import ToastComponent from './components/ToastComponent.tsx'

function AppView({
  activePanel,
  appStage,
  theme,
  toasts,
  isLoadingVisible,
  loadingStatus,
  loginForm,
  isLoginBusy,
  onToggleTheme,
  onMinimizeWindow,
  onCloseWindow,
  onSelectPanel,
  onDismissToast,
  onLoginFieldChange,
  onLoginSubmit,
}: AppViewProps) {
  const showLogin = appStage === 'login'
  const showAppContent = appStage === 'loading' || appStage === 'ready'

  return (
    <>
      <LoadingScreenView isVisible={isLoadingVisible} status={loadingStatus} />
      <TitleBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onMinimizeWindow={onMinimizeWindow}
        onCloseWindow={onCloseWindow}
      />
      <ToastComponent toasts={toasts} onDismissToast={onDismissToast} />

      {showLogin ? (
        <LoginPageView
          values={loginForm}
          isSubmitting={isLoginBusy}
          onChange={onLoginFieldChange}
          onSubmit={onLoginSubmit}
        />
      ) : null}

      {showAppContent ? (
        <>
          <DirectoryNav activePanel={activePanel} onSelectPanel={onSelectPanel} />
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
      ) : null}
    </>
  )
}

export default AppView