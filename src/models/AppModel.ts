export type PanelKey = 'students' | 'programs' | 'colleges'
export type ThemeMode = 'dark' | 'light'

export const DEFAULT_PANEL: PanelKey = 'students'
export const DEFAULT_THEME: ThemeMode = 'dark'

export interface AppViewModel {
  activePanel: PanelKey
  theme: ThemeMode
  showSplash: boolean
  hideSplash: boolean
}

export interface AppViewActions {
  onToggleTheme: () => void
  onSelectPanel: (panel: PanelKey) => void
  onMinimizeWindow: () => void
  onCloseWindow: () => void
}

export type AppViewProps = AppViewModel & AppViewActions
