import { useCallback, useEffect, useState } from 'react'
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  PROGRAM_ROWS_PER_PAGE,
  type ProgramRow,
  fetchProgramRows,
} from '../models/ProgramTableModel'

type UseProgramTableControllerProps = {
  columns: ColumnDef<ProgramRow>[]
}

export function useProgramTableController({ columns }: UseProgramTableControllerProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PROGRAM_ROWS_PER_PAGE,
  })
  const [programs, setPrograms] = useState<ProgramRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshPrograms = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const rows = await fetchProgramRows()
      setPrograms(rows)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setLoadError(message)
      setPrograms([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshPrograms()
  }, [refreshPrograms])

  const table = useReactTable({
    data: programs,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      return String(value ?? '')
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalItems = table.getFilteredRowModel().rows.length
  const totalPages = Math.max(1, table.getPageCount())
  const currentPage = table.getState().pagination.pageIndex + 1
  const pageSize = table.getState().pagination.pageSize
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return
    }

    table.setPageIndex(page - 1)
  }

  return {
    table,
    globalFilter,
    setGlobalFilter,
    isLoading,
    loadError,
    refreshPrograms,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    handlePageChange,
  }
}
