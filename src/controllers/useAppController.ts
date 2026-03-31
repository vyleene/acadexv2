import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PANEL,
  DEFAULT_THEME,
  TOAST_EVENT,
  type AppViewProps,
  type PanelKey,
  type ThemeMode,
  type ToastItem,
  type ToastPayload,
} from '../models/AppModel'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke, isTauri } from '@tauri-apps/api/core'

const THEME_STORAGE_KEY = 'lexian-theme'

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  const htmlTheme = document.documentElement.getAttribute('data-bs-theme')
  return htmlTheme === 'dark' || htmlTheme === 'light' ? htmlTheme : DEFAULT_THEME
}

type TauriRuntimeWindow = {
  minimize: () => Promise<void>
  close: () => Promise<void>
}

const runWindowAction = async (action: (appWindow: TauriRuntimeWindow) => Promise<void>) => {
  if (!isTauri()) {
    return
  }

  await action(getCurrentWindow())
}

export function AppController(): AppViewProps {
  const [activePanel, setActivePanel] = useState<PanelKey>(DEFAULT_PANEL)
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())
  const [showSplash, setShowSplash] = useState(true)
  const [hideSplash, setHideSplash] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setHideSplash(true)
    }, 2000)

    const removeTimer = window.setTimeout(() => {
      setShowSplash(false)
    }, 2300)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  useEffect(() => {
    if (!isTauri()) {
      return
    }

    void invoke('initialize_mysql_schema').catch((error) => {
      console.error('Failed to initialize MySQL schema:', error)
    })
  }, [])

  const onToggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'dark' ? 'light' : 'dark'))
  }

  const onSelectPanel = (panel: PanelKey) => {
    setActivePanel(panel)
  }

  const onMinimizeWindow = () => {
    void runWindowAction((appWindow) => appWindow.minimize())
  }

  const onCloseWindow = () => {
    void runWindowAction((appWindow) => appWindow.close())
  }

  const onShowToast = useCallback((toast: ToastPayload) => {
    const nextId = toast.id ?? `toast-${Date.now()}-${toastIdRef.current}`
    toastIdRef.current += 1

    setToasts((previousToasts) => [
      ...previousToasts,
      {
        ...toast,
        id: nextId,
      },
    ])
  }, [])

  const onDismissToast = (id: string) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>
      if (!customEvent.detail) {
        return
      }

      onShowToast(customEvent.detail)
    }

    window.addEventListener(TOAST_EVENT, handleToastEvent)

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent)
    }
  }, [onShowToast])

  return {
    activePanel,
    theme,
    showSplash,
    hideSplash,
    toasts,
    onToggleTheme,
    onSelectPanel,
    onMinimizeWindow,
    onCloseWindow,
    onShowToast,
    onDismissToast,
  }
}
