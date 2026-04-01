import { useCallback, useEffect, useState } from 'react'
import { dispatchLoadingStatus, type LoadingDirectoryKey } from '../models/AppModel'
import { getErrorMessage } from '../utils/errors'

type UseDirectoryDataOptions<T> = {
  fetcher: () => Promise<T[]>
  refreshEvent: string
  loadingKey: LoadingDirectoryKey
  onError?: (message: string) => void
}

export function useDirectoryData<T>({
  fetcher,
  refreshEvent,
  loadingKey,
  onError,
}: UseDirectoryDataOptions<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetcher()
      setRows(data)
      dispatchLoadingStatus({ key: loadingKey })
    } catch (error) {
      const message = getErrorMessage(error)
      setLoadError(message)
      setRows([])
      dispatchLoadingStatus({ key: loadingKey, failed: true })
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, loadingKey, onError])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleRefresh = () => {
      void refresh()
    }

    window.addEventListener(refreshEvent, handleRefresh)

    return () => {
      window.removeEventListener(refreshEvent, handleRefresh)
    }
  }, [refreshEvent, refresh])

  return {
    rows,
    isLoading,
    loadError,
    refresh,
  }
}
