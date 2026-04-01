import { useCallback, useEffect, useMemo, useState } from 'react'
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
  COLLEGE_ROWS_PER_PAGE,
  COLLEGES_REFRESH_EVENT,
  type CollegeRow,
  normalizeCollegeCode,
} from '../models/CollegeModel'
import {
  createCollege,
  deleteCollege,
  fetchCollegeRows,
  updateCollege,
} from '../services/collegeService'
import { useDirectoryData } from '../hooks/useDirectoryData'
import { getErrorMessage } from '../utils/errors'
import { dispatchToast } from '../models/AppModel'
import { PROGRAMS_REFRESH_EVENT } from '../models/ProgramModel'
import { STUDENTS_REFRESH_EVENT } from '../models/StudentModel'

type UseCollegeControllerProps = {
  columns: ColumnDef<CollegeRow>[]
}

type BootstrapModalInstance = {
  hide: () => void
}

type BootstrapModalConstructor = {
  new (element: Element): BootstrapModalInstance
  getInstance: (element: Element) => BootstrapModalInstance | null
  getOrCreateInstance?: (element: Element) => BootstrapModalInstance
}

function getBootstrapModal(): BootstrapModalConstructor | null {
  if (typeof window === 'undefined') {
    return null
  }

  const typedWindow = window as typeof window & {
    bootstrap?: { Modal?: BootstrapModalConstructor }
  }
  return typedWindow.bootstrap?.Modal ?? null
}

function closeModal(modalElement: HTMLElement) {
  const dismissButton = modalElement.querySelector(
    '[data-bs-dismiss="modal"]'
  ) as HTMLButtonElement | null

  if (dismissButton) {
    dismissButton.click()
    return
  }

  const modalConstructor = getBootstrapModal()

  if (modalConstructor) {
    const modalInstance =
      modalConstructor.getInstance(modalElement) ??
      (typeof modalConstructor.getOrCreateInstance === 'function'
        ? modalConstructor.getOrCreateInstance(modalElement)
        : new modalConstructor(modalElement))
    modalInstance.hide()
    return
  }

  modalElement.classList.remove('show')
  modalElement.setAttribute('aria-hidden', 'true')
  modalElement.style.display = 'none'
  document.body.classList.remove('modal-open')
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
}


function formatCount(value?: string) {
  if (!value || value === '0') {
    return 'N/A'
  }

  return value
}

export function useCollegeController({ columns }: UseCollegeControllerProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: COLLEGE_ROWS_PER_PAGE,
  })
  const handleLoadError = useCallback((message: string) => {
    dispatchToast({
      type: 'error',
      title: 'Colleges',
      message: message
        ? `College: Failed to load colleges. ${message}`
        : 'College: Failed to load colleges.',
    })
  }, [])

  const {
    rows: colleges,
    isLoading,
    loadError,
    refresh: refreshColleges,
  } = useDirectoryData<CollegeRow>({
    fetcher: fetchCollegeRows,
    refreshEvent: COLLEGES_REFRESH_EVENT,
    loadingKey: 'colleges',
    onError: handleLoadError,
  })

  const normalizedFilter = useMemo(() => {
    const rawFilter = String(globalFilter ?? '').trim().toLowerCase()
    const filterNoSpace = rawFilter.replace(/\s+/g, '')
    const tokens = rawFilter.split(/\s+/).filter(Boolean)

    return {
      rawFilter,
      filterNoSpace,
      tokens,
    }
  }, [globalFilter])

  const globalFilterFn = useCallback((row: { original: CollegeRow }) => {
    const { rawFilter, filterNoSpace, tokens } = normalizedFilter

    if (!rawFilter) {
      return true
    }

    const fieldValues = [
      row.original.code,
      row.original.collegeName,
      String(row.original.programCount),
      String(row.original.studentCount),
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())

    const combined = fieldValues.join(' ')
    const combinedNoSpace = combined.replace(/\s+/g, '')

    if (combinedNoSpace.includes(filterNoSpace)) {
      return true
    }

    return tokens.every((token) => combined.includes(token))
  }, [normalizedFilter])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('collegeModal')
    const titleElement = document.getElementById('collegeModalLabel')
    const submitButton = document.getElementById('college-submit') as HTMLButtonElement | null
    const form = document.getElementById('college-form') as HTMLFormElement | null
    const codeInput = document.getElementById('college-code') as HTMLInputElement | null
    const nameInput = document.getElementById('college-name') as HTMLInputElement | null

    if (!modalElement || !titleElement || !submitButton || !form) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const mode = trigger?.dataset.modalMode === 'edit' ? 'edit' : 'add'

      if (mode === 'add') {
        form.dataset.mode = 'add'
        form.dataset.collegeCode = ''
        titleElement.textContent = 'Add College'
        submitButton.textContent = 'Add College'

        if (codeInput) {
          codeInput.readOnly = false
          codeInput.value = ''
        }

        if (nameInput) {
          nameInput.value = ''
        }

        return
      }

      form.dataset.mode = 'edit'
      const collegeCode = normalizeCollegeCode(trigger?.dataset.collegeCode)
      form.dataset.collegeCode = collegeCode
      titleElement.textContent = 'Edit College'
      submitButton.textContent = 'Save Changes'

      if (codeInput) {
        codeInput.readOnly = true
        codeInput.value = collegeCode
      }

      if (nameInput) {
        nameInput.value = trigger?.dataset.collegeName ?? ''
      }
    }

    const handleSubmit = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!form.checkValidity()) {
        form.reportValidity()
        dispatchToast({
          type: 'warning',
          title: 'College form incomplete',
          message: 'College: Please complete the required fields before saving.',
        })
        return
      }

      const collegeCode = codeInput?.value.trim() ?? ''
      const collegeName = nameInput?.value.trim() ?? ''
      const mode = form.dataset.mode === 'edit' ? 'edit' : 'add'
      const actionVerb = mode === 'add' ? 'add' : 'update'
      const actionResult = mode === 'add' ? 'added' : 'updated'

      if (!collegeCode) {
        console.error('College code is required to save changes.')
        dispatchToast({
          type: 'error',
          title: 'College code required',
          message: 'College: Enter a college code before saving.',
        })
        return
      }

      submitButton.setAttribute('disabled', 'true')

      try {
        if (mode === 'add') {
          await createCollege({ code: collegeCode, name: collegeName })
        } else {
          await updateCollege(collegeCode, { name: collegeName })
        }

        const collegeLabel = collegeName ? `${collegeName} (${collegeCode})` : collegeCode
        dispatchToast({
          type: 'success',
          title: `College ${actionResult}`,
          message: collegeLabel
            ? `College: ${collegeLabel} was ${actionResult}.`
            : `College: College was ${actionResult}.`,
        })

        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        const message = getErrorMessage(error)
        console.error('Failed to save college:', error)
        dispatchToast({
          type: 'error',
          title: `College ${actionVerb} failed`,
          message: message
            ? `College: Unable to ${actionVerb} college. ${message}`
            : `College: Unable to ${actionVerb} college.`,
        })
      } finally {
        submitButton.removeAttribute('disabled')
      }
    }

    modalElement.addEventListener('show.bs.modal', handleShow)
    form.addEventListener('submit', handleSubmit)

    return () => {
      modalElement.removeEventListener('show.bs.modal', handleShow)
      form.removeEventListener('submit', handleSubmit)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('deleteCollegeModal')
    const hiddenInput = document.getElementById('delete-college-id') as HTMLInputElement | null
    const warningElement = document.getElementById('delete-college-warning')
    const confirmButton = document.getElementById('confirm-delete-college') as HTMLButtonElement | null

    if (!modalElement || !hiddenInput || !warningElement || !confirmButton) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const collegeCode = trigger?.dataset.collegeCode ?? ''
      const collegeName = trigger?.dataset.collegeName ?? ''

      hiddenInput.value = collegeCode
      warningElement.textContent = collegeCode
        ? `College: ${collegeName || 'Unknown'} (${collegeCode})`
        : ''
    }

    const handleConfirm = async () => {
      const collegeCode = hiddenInput.value.trim()

      if (!collegeCode) {
        console.error('Invalid college code for delete.')
        dispatchToast({
          type: 'error',
          title: 'Invalid college code',
          message: 'College: Unable to delete because the code is invalid.',
        })
        return
      }

      confirmButton.setAttribute('disabled', 'true')

      try {
        await deleteCollege(collegeCode)
        dispatchToast({
          type: 'success',
          title: 'College deleted',
          message: collegeCode
            ? `College: ${collegeCode} was deleted.`
            : 'College: College was deleted.',
        })
        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        const message = getErrorMessage(error)
        console.error('Failed to delete college:', error)
        dispatchToast({
          type: 'error',
          title: 'College delete failed',
          message: message
            ? `College: Unable to delete college. ${message}`
            : 'College: Unable to delete college.',
        })
      } finally {
        confirmButton.removeAttribute('disabled')
      }
    }

    modalElement.addEventListener('show.bs.modal', handleShow)
    confirmButton.addEventListener('click', handleConfirm)

    return () => {
      modalElement.removeEventListener('show.bs.modal', handleShow)
      confirmButton.removeEventListener('click', handleConfirm)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('collegeInfoModal')
    const codeElement = document.getElementById('college-info-code')
    const nameElement = document.getElementById('college-info-name')
    const programCountElement = document.getElementById('college-info-program-count')
    const studentCountElement = document.getElementById('college-info-student-count')

    if (
      !modalElement ||
      !codeElement ||
      !nameElement ||
      !programCountElement ||
      !studentCountElement
    ) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget

      codeElement.textContent = trigger?.dataset.collegeCode ?? 'N/A'
      nameElement.textContent = trigger?.dataset.collegeName ?? 'N/A'
      programCountElement.textContent = formatCount(trigger?.dataset.collegeProgramCount)
      studentCountElement.textContent = formatCount(trigger?.dataset.collegeStudentCount)
    }

    modalElement.addEventListener('show.bs.modal', handleShow)

    return () => {
      modalElement.removeEventListener('show.bs.modal', handleShow)
    }
  }, [])

  const table = useReactTable({
    data: colleges,
    columns,
    autoResetPageIndex: false,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const paginationSummary = useMemo(() => {
    const totalItems = table.getFilteredRowModel().rows.length
    const totalPages = Math.max(1, table.getPageCount())
    const currentPage = pagination.pageIndex + 1
    const rangeStart = totalItems === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
    const rangeEnd = totalItems === 0 ? 0 : Math.min(currentPage * pagination.pageSize, totalItems)

    return {
      totalItems,
      totalPages,
      currentPage,
      rangeStart,
      rangeEnd,
    }
  }, [table, pagination.pageIndex, pagination.pageSize, globalFilter, colleges])

  const { totalItems, totalPages, currentPage, rangeStart, rangeEnd } = paginationSummary

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) {
      return
    }

    table.setPageIndex(page - 1)
  }, [table, totalPages])

  return {
    table,
    globalFilter,
    setGlobalFilter,
    isLoading,
    loadError,
    refreshColleges,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    handlePageChange,
  }
}
