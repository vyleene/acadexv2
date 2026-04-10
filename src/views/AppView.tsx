import { Fragment } from 'react'
import type { AppViewProps } from '../models/AppModel'
import { Card, Container } from 'react-bootstrap'
import ProgramDirectoryCard from './components/cards/ProgramDirectoryCardComponent'
import StudentDirectoryCard from './components/cards/StudentDirectoryCardComponent'
import CollegeDirectoryCard from './components/cards/CollegeDirectoryCardComponent'
import DirectoryNav from './components/DirectoryNavComponent'
import LoginPageView from './LoginPageView'
import LoadingScreenView from './LoadingScreenView'
import AppSettingsModal from './components/modals/AppSettingsModalComponent'
import TitleBar from './components/TitleBarComponent'
import ToastComponent from './components/ToastComponent.tsx'

function AppView({
  viewResetKey,
  activePanel,
  appStage,
  theme,
  toasts,
  isLoadingVisible,
  loadingStatus,
  loginForm,
  isLoginBusy,
  isDisconnecting,
  onToggleTheme,
  onMinimizeWindow,
  onCloseWindow,
  onSelectPanel,
  onDismissToast,
  onLoginFieldChange,
  onLoginSubmit,
  onDisconnectDatabase,
}: AppViewProps) {
  const showLogin = appStage === 'login'
  const showAppContent = appStage === 'loading' || appStage === 'ready'
  const isConnected = appStage === 'loading' || appStage === 'ready'

  return (
    <>
      <LoadingScreenView isVisible={isLoadingVisible} status={loadingStatus} />
      <TitleBar
        onMinimizeWindow={onMinimizeWindow}
        onCloseWindow={onCloseWindow}
      />
      <ToastComponent toasts={toasts} onDismissToast={onDismissToast} />
      <AppSettingsModal
        theme={theme}
        credentials={loginForm}
        isConnected={isConnected}
        isDisconnecting={isDisconnecting}
        onToggleTheme={onToggleTheme}
        onDisconnect={onDisconnectDatabase}
      />

      {showLogin ? (
        <LoginPageView
          values={loginForm}
          isSubmitting={isLoginBusy}
          onChange={onLoginFieldChange}
          onSubmit={onLoginSubmit}
        />
      ) : null}

      {showAppContent ? (
        <Fragment key={viewResetKey}>
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
        </Fragment>
      ) : null}
    </>
  )
}

export default AppView