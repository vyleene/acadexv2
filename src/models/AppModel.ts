export type PanelKey = 'students' | 'programs' | 'colleges'
export type ThemeMode = 'dark' | 'light'
export type ToastType = 'success' | 'warning' | 'error'

export const DEFAULT_PANEL: PanelKey = 'students'
export const DEFAULT_THEME: ThemeMode = 'dark'

export type ToastItem = {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

export type ToastPayload = Omit<ToastItem, 'id'> & { id?: string }

export interface AppViewModel {
  activePanel: PanelKey
  theme: ThemeMode
  showSplash: boolean
  hideSplash: boolean
  toasts: ToastItem[]
}

export interface AppViewActions {
  onToggleTheme: () => void
  onSelectPanel: (panel: PanelKey) => void
  onMinimizeWindow: () => void
  onCloseWindow: () => void
  onShowToast: (toast: ToastPayload) => void
  onDismissToast: (id: string) => void
}

export type AppViewProps = AppViewModel & AppViewActions
