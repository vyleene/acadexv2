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
  PROGRAM_ROWS_PER_PAGE,
  PROGRAMS_REFRESH_EVENT,
  type ProgramRow,
  normalizeCollegeCode,
  normalizeProgramCode,
} from '../models/ProgramModel'
import {
  createProgram,
  deleteProgram,
  fetchCollegeCodes,
  fetchProgramRows,
  updateProgram,
} from '../services/programService'
import { useDirectoryData } from '../hooks/useDirectoryData'
import { getErrorMessage } from '../utils/errors'
import { dispatchToast } from '../models/AppModel'
import { COLLEGES_REFRESH_EVENT } from '../models/CollegeModel'
import { STUDENTS_REFRESH_EVENT } from '../models/StudentModel'

type UseProgramViewModelProps = {
  columns: ColumnDef<ProgramRow>[]
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

function setCollegeOptions(
  selectElement: HTMLSelectElement,
  collegeCodes: string[],
  selectedCollegeCode?: string,
) {
  const normalizedSelectedCode = normalizeCollegeCode(selectedCollegeCode)
  selectElement.replaceChildren()

  const placeholderOption = document.createElement('option')
  placeholderOption.value = ''
  placeholderOption.textContent = 'Select college code'
  placeholderOption.hidden = true
  selectElement.append(placeholderOption)

  for (const code of collegeCodes) {
    const option = document.createElement('option')
    option.value = code
    option.textContent = code
    selectElement.append(option)
  }

  if (
    normalizedSelectedCode &&
    !collegeCodes.some((collegeCode) => collegeCode === normalizedSelectedCode)
  ) {
    const currentOption = document.createElement('option')
    currentOption.value = normalizedSelectedCode
    currentOption.textContent = normalizedSelectedCode
    selectElement.append(currentOption)
  }

  selectElement.value = normalizedSelectedCode
}

function normalizeDirectoryCodeInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]+/g, '').slice(0, 16)
}

export function useProgramViewModel({ columns }: UseProgramViewModelProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PROGRAM_ROWS_PER_PAGE,
  })
  const handleLoadError = useCallback((_message: string) => {
    dispatchToast({
      type: 'error',
      message: 'Unable to load programs.',
    })
  }, [])

  const {
    rows: programs,
    isLoading,
    loadError,
    refresh: refreshPrograms,
  } = useDirectoryData<ProgramRow>({
    fetcher: fetchProgramRows,
    refreshEvent: PROGRAMS_REFRESH_EVENT,
    loadingKey: 'programs',
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

  const globalFilterFn = useCallback((row: { original: ProgramRow }) => {
    const { rawFilter, filterNoSpace, tokens } = normalizedFilter

    if (!rawFilter) {
      return true
    }

    const fieldValues = [
      row.original.code,
      row.original.programName,
      row.original.collegeCode,
      row.original.collegeName,
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

    const modalElement = document.getElementById('programModal')
    const titleTextElement = document.getElementById('programModalTitleText')
    const submitButton = document.getElementById('program-submit') as HTMLButtonElement | null
    const form = document.getElementById('program-form') as HTMLFormElement | null
    const codeInput = document.getElementById('program-code') as HTMLInputElement | null
    const nameInput = document.getElementById('program-name') as HTMLInputElement | null
    const collegeSelect = document.getElementById('program-college') as HTMLSelectElement | null

    if (!modalElement || !titleTextElement || !submitButton || !form) {
      return
    }

    const handleCodeInput = () => {
      if (!codeInput) {
        return
      }

      const normalizedCode = normalizeDirectoryCodeInput(codeInput.value)
      if (codeInput.value !== normalizedCode) {
        codeInput.value = normalizedCode
      }
    }

    const populateCollegeSelect = async (selectedCollegeCode?: string) => {
      if (!collegeSelect) {
        return
      }

      collegeSelect.disabled = true

      try {
        const collegeCodes = await fetchCollegeCodes()
        setCollegeOptions(collegeSelect, collegeCodes, selectedCollegeCode)
      } finally {
        collegeSelect.disabled = false
      }
    }

    const handleShow = async (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const mode = trigger?.dataset.modalMode === 'edit' ? 'edit' : 'add'

      if (mode === 'add') {
        form.dataset.mode = 'add'
        form.dataset.programCode = ''
        titleTextElement.textContent = 'Add Program'
        submitButton.textContent = 'Add Program'

        if (codeInput) {
          codeInput.readOnly = false
          codeInput.value = ''
        }

        if (nameInput) {
          nameInput.value = ''
        }

        if (collegeSelect) {
          collegeSelect.value = ''
        }

        await populateCollegeSelect('')
        return
      }

      form.dataset.mode = 'edit'
      form.dataset.programCode = ''
      titleTextElement.textContent = 'Edit Program'
      submitButton.textContent = 'Save Changes'

      const programCode = normalizeProgramCode(trigger?.dataset.programCode)
      const programName = trigger?.dataset.programName ?? ''

      if (codeInput) {
        codeInput.readOnly = false
        codeInput.value = normalizeDirectoryCodeInput(programCode)
      }

      if (nameInput) {
        nameInput.value = programName
      }

      const selectedCollegeCode = normalizeCollegeCode(trigger?.dataset.collegeCode)
      form.dataset.programCode = programCode
      await populateCollegeSelect(selectedCollegeCode)
    }

    const handleSubmit = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!form.checkValidity()) {
        form.reportValidity()
        dispatchToast({
          type: 'warning',
          message: 'Complete all required program fields.',
        })
        return
      }

      const enteredProgramCode = normalizeDirectoryCodeInput(codeInput?.value ?? '')
      const programName = nameInput?.value.trim() ?? ''
      const collegeCode = collegeSelect?.value ?? ''
      const mode = form.dataset.mode === 'edit' ? 'edit' : 'add'
      const originalProgramCode = normalizeProgramCode(form.dataset.programCode)
      const targetProgramCode = enteredProgramCode
      const actionVerb = mode === 'add' ? 'add' : 'edit'

      if (codeInput) {
        codeInput.value = enteredProgramCode
      }

      if (!targetProgramCode) {
        console.error('Program code is required to save changes.')
        dispatchToast({
          type: 'error',
          message: 'Enter program code.',
        })
        return
      }

      if (mode === 'edit' && !originalProgramCode) {
        console.error('Original program code is missing for update.')
        dispatchToast({
          type: 'error',
          message: 'Unable to edit program with invalid original code.',
        })
        return
      }

      submitButton.setAttribute('disabled', 'true')

      try {
        if (mode === 'add') {
          await createProgram({ code: targetProgramCode, name: programName, college_code: collegeCode })
        } else {
          await updateProgram(originalProgramCode, {
            code: targetProgramCode,
            name: programName,
            college_code: collegeCode,
          })
        }

        const programLabel =
          programName ? `${programName} (${targetProgramCode})` : targetProgramCode
        dispatchToast({
          type: 'success',
          message:
            mode === 'add'
              ? `Added program: ${programLabel}`
              : `Edited program: ${programLabel}`,
        })

        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to save program:', error)
        const rawErrorMessage = getErrorMessage(error, '').toLowerCase()

        let message = `Unable to ${actionVerb} program.`

        if (rawErrorMessage.includes('duplicate entry') || rawErrorMessage.includes('1062')) {
          message = `Unable to ${actionVerb} program with duplicate code: ${targetProgramCode}`
        } else if (rawErrorMessage.includes('foreign key') || rawErrorMessage.includes('1452')) {
          message = `Unable to ${actionVerb} program with invalid college code.`
        } else if (rawErrorMessage.includes('not found')) {
          message = `Unable to ${actionVerb} program with missing code: ${originalProgramCode}`
        }

        dispatchToast({
          type: 'error',
          message,
        })
      } finally {
        submitButton.removeAttribute('disabled')
      }
    }

    const handleCollegesRefresh = () => {
      if (!modalElement.classList.contains('show')) {
        return
      }

      const selectedCollegeCode = normalizeCollegeCode(collegeSelect?.value)
      void populateCollegeSelect(selectedCollegeCode)
    }

    codeInput?.addEventListener('input', handleCodeInput)
    modalElement.addEventListener('show.bs.modal', handleShow)
    form.addEventListener('submit', handleSubmit)
    window.addEventListener(COLLEGES_REFRESH_EVENT, handleCollegesRefresh)

    return () => {
      codeInput?.removeEventListener('input', handleCodeInput)
      modalElement.removeEventListener('show.bs.modal', handleShow)
      form.removeEventListener('submit', handleSubmit)
      window.removeEventListener(COLLEGES_REFRESH_EVENT, handleCollegesRefresh)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('deleteProgramModal')
    const hiddenInput = document.getElementById('delete-program-id') as HTMLInputElement | null
    const warningElement = document.getElementById('delete-program-warning')
    const confirmButton = document.getElementById('confirm-delete-program') as HTMLButtonElement | null

    if (!modalElement || !hiddenInput || !warningElement || !confirmButton) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const programCode = trigger?.dataset.programCode ?? ''
      const programName = trigger?.dataset.programName ?? ''

      hiddenInput.value = programCode
      warningElement.textContent = programCode
        ? `${programName || 'Unknown'} (${programCode})`
        : ''
    }

    const handleConfirm = async () => {
      const programCode = hiddenInput.value.trim()

      if (!programCode) {
        console.error('Invalid program code for delete.')
        dispatchToast({
          type: 'error',
          message: 'Unable to delete program with invalid code.',
        })
        return
      }

      confirmButton.setAttribute('disabled', 'true')

      try {
        await deleteProgram(programCode)
        dispatchToast({
          type: 'success',
          message: `Deleted program: ${programCode}`,
        })
        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to delete program:', error)
        const rawErrorMessage = getErrorMessage(error, '').toLowerCase()

        let message = 'Unable to delete program.'

        if (rawErrorMessage.includes('1451') || rawErrorMessage.includes('foreign key')) {
          message = 'Unable to delete program referenced by existing students.'
        } else if (rawErrorMessage.includes('not found')) {
          message = `Unable to delete program with missing code: ${programCode}`
        }

        dispatchToast({
          type: 'error',
          message,
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

    const modalElement = document.getElementById('programInfoModal')
    const codeElement = document.getElementById('program-info-code')
    const nameElement = document.getElementById('program-info-name')
    const studentCountElement = document.getElementById('program-info-student-count')
    const collegeCodeElement = document.getElementById('program-info-college-code')
    const collegeNameElement = document.getElementById('program-info-college-name')

    if (
      !modalElement ||
      !codeElement ||
      !nameElement ||
      !studentCountElement ||
      !collegeCodeElement ||
      !collegeNameElement
    ) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget

      codeElement.textContent = trigger?.dataset.programCode ?? 'N/A'
      nameElement.textContent = trigger?.dataset.programName ?? 'N/A'
      const rawStudentCount = trigger?.dataset.programStudentCount ?? 'N/A'
      studentCountElement.textContent = rawStudentCount === '0' ? 'N/A' : rawStudentCount
      collegeCodeElement.textContent = trigger?.dataset.collegeCode ?? 'N/A'
      collegeNameElement.textContent = trigger?.dataset.collegeName ?? 'N/A'
    }

    modalElement.addEventListener('show.bs.modal', handleShow)

    return () => {
      modalElement.removeEventListener('show.bs.modal', handleShow)
    }
  }, [])

  const table = useReactTable({
    data: programs,
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
  }, [table, pagination.pageIndex, pagination.pageSize, globalFilter, programs])

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
    refreshPrograms,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    handlePageChange,
  }
}
