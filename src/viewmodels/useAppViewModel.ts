import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PANEL,
  DEFAULT_THEME,
  LOADING_STATUS_EVENT,
  TOAST_EVENT,
  type LoadingStatusPayload,
  type LoadingDirectoryKey,
  type AppViewProps,
  type PanelKey,
  type ThemeMode,
  type ToastItem,
  type ToastPayload,
} from '../models/AppModel'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke, isTauri } from '@tauri-apps/api/core'

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

const THEME_STORAGE_KEY = 'acadex-theme'
const LOADING_ORDER: LoadingDirectoryKey[] = ['students', 'programs', 'colleges']
const LOADING_LABELS: Record<LoadingDirectoryKey, string> = {
  students: 'students',
  programs: 'programs',
  colleges: 'colleges',
}

const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return getSystemTheme()
}

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-bs-theme', theme)
  document.documentElement.style.colorScheme = theme
  if (document.body) {
    document.body.style.colorScheme = theme
  }
}

const updateLoadingStatus = (message: string) => {
  if (typeof document === 'undefined') {
    return
  }

  const statusElement = document.getElementById('loading-status')
  if (!statusElement) {
    return
  }

  statusElement.textContent = message
}

export function useAppViewModel(): AppViewProps {
  const [activePanel, setActivePanel] = useState<PanelKey>(DEFAULT_PANEL)
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)
  const loadingSequenceRef = useRef({
    index: 0,
    running: false,
    finished: false,
    failed: {} as Partial<Record<LoadingDirectoryKey, boolean>>,
  })
  const loadingTimersRef = useRef<number[]>([])
  const hasHiddenLoadingRef = useRef(false)

  useEffect(() => {
    applyTheme(theme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  useEffect(() => {
    updateLoadingStatus('Loading students...')

    return () => {
      loadingTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      loadingTimersRef.current = []
    }
  }, [])

  const hideLoadingScreen = useCallback(() => {
    if (hasHiddenLoadingRef.current || typeof document === 'undefined') {
      return
    }

    const splashElement = document.getElementById('splash-screen')
    if (!splashElement) {
      return
    }

    hasHiddenLoadingRef.current = true
    splashElement.classList.add('hide')
    splashElement.setAttribute('aria-hidden', 'true')
  }, [])

  useEffect(() => {
    if (!isTauri()) {
      return
    }

    void invoke('initialize_mysql_schema').catch((error) => {
      console.error('Failed to initialize MySQL schema:', error)
    })
  }, [])

  const onSelectPanel = (panel: PanelKey) => {
    setActivePanel(panel)
  }

  const onToggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'dark' ? 'light' : 'dark'))
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const scheduleTimer = (callback: () => void, delay: number) => {
      const timerId = window.setTimeout(callback, delay)
      loadingTimersRef.current.push(timerId)
    }

    const advanceSequence = () => {
      const state = loadingSequenceRef.current
      state.running = false
      state.index += 1

      if (state.index >= LOADING_ORDER.length) {
        state.finished = true
        scheduleTimer(() => {
          hideLoadingScreen()
        }, 500)
        return
      }

      const nextKey = LOADING_ORDER[state.index]
      startSequence(nextKey)
    }

    const startSequence = (key: LoadingDirectoryKey) => {
      const state = loadingSequenceRef.current
      const failed = Boolean(state.failed[key])
      const label = LOADING_LABELS[key]

      state.running = true

      if (failed) {
        updateLoadingStatus(`Loading ${label} failed.`)
        scheduleTimer(advanceSequence, 600)
        return
      }

      updateLoadingStatus(`Loading ${label}...`)
      scheduleTimer(() => {
        updateLoadingStatus(`Loaded ${label}.`)
      }, 450)
      scheduleTimer(advanceSequence, 800)
    }

    const handleStatusEvent = (event: Event) => {
      const customEvent = event as CustomEvent<LoadingStatusPayload>
      if (!customEvent.detail) {
        return
      }

      const { key, failed } = customEvent.detail
      const state = loadingSequenceRef.current

      state.failed[key] = Boolean(failed)

      if (state.finished || state.running) {
        return
      }

      const currentKey = LOADING_ORDER[state.index]
      if (currentKey === key) {
        startSequence(key)
      }
    }

    window.addEventListener(LOADING_STATUS_EVENT, handleStatusEvent)

    return () => {
      window.removeEventListener(LOADING_STATUS_EVENT, handleStatusEvent)
    }
  }, [hideLoadingScreen])

  return {
    activePanel,
    theme,
    toasts,
    onToggleTheme,
    onSelectPanel,
    onMinimizeWindow,
    onCloseWindow,
    onShowToast,
    onDismissToast,
  }
}
