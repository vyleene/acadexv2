import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_PANEL,
  DEFAULT_THEME,
  LOADING_STATUS_EVENT,
  TOAST_EVENT,
  type AppStage,
  type AppViewProps,
  type LoadingDirectoryKey,
  type LoadingStatusPayload,
  type LoginFormValues,
  type PanelKey,
  type ThemeMode,
  type ToastItem,
  type ToastPayload,
} from '../models/AppModel'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke, isTauri } from '@tauri-apps/api/core'
import { getErrorMessage } from '../utils/errors'

type TauriRuntimeWindow = {
  minimize: () => Promise<void>
  close: () => Promise<void>
}

type DatabaseConfigPayload = {
  host: string
  port: number
  database: string
  username: string
  password: string
  max_connections?: number
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
const DEFAULT_LOGIN_FORM: LoginFormValues = {
  host: 'localhost',
  port: '3306',
  database: 'acadex',
  username: 'root',
  password: 'password',
}
const CHECKING_STATUS = 'Checking database...'

const buildDatabasePayload = (
  values: LoginFormValues,
): { payload?: DatabaseConfigPayload; error?: string } => {
  const host = values.host.trim()
  if (!host) {
    return { error: 'Host is required.' }
  }

  const database = values.database.trim()
  if (!database) {
    return { error: 'Database name is required.' }
  }

  const username = values.username.trim()
  if (!username) {
    return { error: 'Username is required.' }
  }

  const password = values.password.trim()
  if (!password) {
    return { error: 'Password is required.' }
  }

  const port = Number.parseInt(values.port, 10)
  if (!Number.isFinite(port) || port <= 0) {
    return { error: 'Port must be a positive number.' }
  }

  return {
    payload: {
      host,
      port,
      database,
      username,
      password: values.password,
    },
  }
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

export function useAppViewModel(): AppViewProps {
  const [activePanel, setActivePanel] = useState<PanelKey>(DEFAULT_PANEL)
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [appStage, setAppStage] = useState<AppStage>('checking')
  const [isLoadingVisible, setLoadingVisible] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(CHECKING_STATUS)
  const [loginForm, setLoginForm] = useState<LoginFormValues>(() => ({ ...DEFAULT_LOGIN_FORM }))
  const [isLoginBusy, setLoginBusy] = useState(false)
  const [isDisconnecting, setDisconnecting] = useState(false)
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
    return () => {
      loadingTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      loadingTimersRef.current = []
    }
  }, [])

  const pushToast = useCallback((toast: ToastPayload) => {
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

  const resetLoadingSequence = useCallback((status: string) => {
    loadingTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    loadingTimersRef.current = []
    loadingSequenceRef.current = {
      index: 0,
      running: false,
      finished: false,
      failed: {},
    }
    hasHiddenLoadingRef.current = false
    setLoadingVisible(true)
    setLoadingStatus(status)
  }, [])

  const beginLoadingSequence = useCallback(() => {
    resetLoadingSequence('Loading students...')
    setAppStage('loading')
  }, [resetLoadingSequence])

  const hideLoadingScreen = useCallback(() => {
    if (hasHiddenLoadingRef.current) {
      return
    }

    hasHiddenLoadingRef.current = true
    setLoadingVisible(false)
    setAppStage('ready')
  }, [])

  const goToLoginStage = useCallback(() => {
    loadingTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    loadingTimersRef.current = []
    loadingSequenceRef.current = {
      index: 0,
      running: false,
      finished: false,
      failed: {},
    }
    hasHiddenLoadingRef.current = false
    setAppStage('login')
    setLoadingVisible(false)
    setLoadingStatus(CHECKING_STATUS)
  }, [])

  const showLogin = useCallback(
    (message?: string) => {
      goToLoginStage()

      if (message) {
        pushToast({
          type: 'warning',
          title: 'MySQL connection',
          message,
        })
      }
    },
    [goToLoginStage, pushToast],
  )

  const prepareDatabase = useCallback(
    async (payload: DatabaseConfigPayload) => {
      await invoke('test_mysql_database_connection', { payload })
      await invoke('configure_mysql_database', { payload })

      try {
        await invoke('initialize_mysql_schema')
      } catch (error) {
        const message = getErrorMessage(error)
        pushToast({
          type: 'error',
          title: 'Database initialization failed',
          message: message
            ? `MySQL: ${message}`
            : 'MySQL: Unable to initialize the schema.',
        })
      }
    },
    [pushToast],
  )

  useEffect(() => {
    let isActive = true

    const bootstrap = async () => {
      setAppStage('checking')
      setLoadingVisible(true)
      setLoadingStatus(CHECKING_STATUS)

      if (!isTauri()) {
        if (isActive) {
          beginLoadingSequence()
        }
        return
      }

      const { payload, error } = buildDatabasePayload(DEFAULT_LOGIN_FORM)
      if (!payload) {
        if (isActive) {
          showLogin(error ?? 'Database credentials are required.')
        }
        return
      }

      try {
        await prepareDatabase(payload)
        if (isActive) {
          beginLoadingSequence()
        }
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = getErrorMessage(error)
        showLogin(
          message
            ? `Unable to connect to MySQL. ${message}`
            : 'Unable to connect to MySQL. Please enter your credentials.',
        )
      }
    }

    void bootstrap()

    return () => {
      isActive = false
    }
  }, [beginLoadingSequence, prepareDatabase, showLogin])

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

  const onShowToast = pushToast

  const onDismissToast = (id: string) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id))
  }

  const onLoginFieldChange = useCallback(
    (field: keyof LoginFormValues, value: string) => {
      setLoginForm((previous) => ({
        ...previous,
        [field]: value,
      }))
    },
    [],
  )

  const onLoginSubmit = useCallback(async () => {
    if (isLoginBusy) {
      return
    }

    const { payload, error } = buildDatabasePayload(loginForm)
    if (!payload) {
      pushToast({
        type: 'warning',
        title: 'MySQL login',
        message: error ?? 'Please fill in all required fields.',
      })
      return
    }

    if (!isTauri()) {
      pushToast({
        type: 'error',
        title: 'MySQL login',
        message: 'MySQL login is only available in the Tauri runtime.',
      })
      return
    }

    setLoginBusy(true)
    setAppStage('checking')
    setLoadingVisible(true)
    setLoadingStatus(CHECKING_STATUS)

    try {
      await prepareDatabase(payload)
      beginLoadingSequence()
    } catch (error) {
      const message = getErrorMessage(error)
      setAppStage('login')
      setLoadingVisible(false)
      pushToast({
        type: 'error',
        title: 'MySQL connection failed',
        message: message ? `MySQL: ${message}` : 'MySQL: Unable to connect.',
      })
    } finally {
      setLoginBusy(false)
    }
  }, [beginLoadingSequence, isLoginBusy, loginForm, prepareDatabase, pushToast])

  const onDisconnectDatabase = useCallback(async () => {
    if (isDisconnecting) {
      return
    }

    if (!isTauri()) {
      pushToast({
        type: 'error',
        title: 'MySQL disconnect',
        message: 'MySQL disconnect is only available in the Tauri runtime.',
      })
      return
    }

    setDisconnecting(true)

    try {
      await invoke('disconnect_mysql_database')
      goToLoginStage()
      pushToast({
        type: 'success',
        title: 'MySQL disconnected',
        message: 'The database connection has been closed.',
      })
    } catch (error) {
      const message = getErrorMessage(error)
      pushToast({
        type: 'error',
        title: 'MySQL disconnect failed',
        message: message ? `MySQL: ${message}` : 'MySQL: Unable to disconnect.',
      })
    } finally {
      setDisconnecting(false)
    }
  }, [goToLoginStage, isDisconnecting, pushToast])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>
      if (!customEvent.detail) {
        return
      }

      pushToast(customEvent.detail)
    }

    window.addEventListener(TOAST_EVENT, handleToastEvent)

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent)
    }
  }, [pushToast])

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
        setLoadingStatus(`Loading ${label} failed.`)
        scheduleTimer(advanceSequence, 600)
        return
      }

      setLoadingStatus(`Loading ${label}...`)
      scheduleTimer(() => {
        setLoadingStatus(`Loaded ${label}.`)
      }, 450)
      scheduleTimer(advanceSequence, 800)
    }

    const handleStatusEvent = (event: Event) => {
      if (appStage !== 'loading' && appStage !== 'ready') {
        return
      }

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
  }, [appStage, hideLoadingScreen])

  return {
    activePanel,
    theme,
    toasts,
    appStage,
    isLoadingVisible,
    loadingStatus,
    loginForm,
    isLoginBusy,
    isDisconnecting,
    onToggleTheme,
    onSelectPanel,
    onMinimizeWindow,
    onCloseWindow,
    onShowToast,
    onDismissToast,
    onLoginFieldChange,
    onLoginSubmit,
    onDisconnectDatabase,
  }
}
