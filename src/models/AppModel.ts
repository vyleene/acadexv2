export type PanelKey = 'students' | 'programs' | 'colleges'
export type ThemeMode = 'dark' | 'light'
export type ToastType = 'success' | 'warning' | 'error'

export const DEFAULT_PANEL: PanelKey = 'students'
export const DEFAULT_THEME: ThemeMode = 'dark'
export const TOAST_EVENT = 'app:toast'
export const LOADING_STATUS_EVENT = 'app:loading-status'

export type ToastItem = {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

export type ToastPayload = Omit<ToastItem, 'id'> & { id?: string }

export type LoadingDirectoryKey = 'students' | 'programs' | 'colleges'

export type LoadingStatusPayload = {
  key: LoadingDirectoryKey
  failed?: boolean
}

export type AppStage = 'checking' | 'login' | 'loading' | 'ready'

export type LoginFormValues = {
  host: string
  port: string
  database: string
  username: string
  password: string
}

export function dispatchToast(toast: ToastPayload) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: toast }))
}

export function dispatchLoadingStatus(payload: LoadingStatusPayload) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<LoadingStatusPayload>(LOADING_STATUS_EVENT, { detail: payload }))
}

export interface AppViewModel {
  activePanel: PanelKey
  theme: ThemeMode
  toasts: ToastItem[]
  appStage: AppStage
  isLoadingVisible: boolean
  loadingStatus: string
  loginForm: LoginFormValues
  isLoginBusy: boolean
}

export interface AppViewActions {
  onToggleTheme: () => void
  onSelectPanel: (panel: PanelKey) => void
  onMinimizeWindow: () => void
  onCloseWindow: () => void
  onShowToast: (toast: ToastPayload) => void
  onDismissToast: (id: string) => void
  onLoginFieldChange: (field: keyof LoginFormValues, value: string) => void
  onLoginSubmit: () => void
}

export type AppViewProps = AppViewModel & AppViewActions
