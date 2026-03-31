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
  STUDENT_ROWS_PER_PAGE,
  STUDENTS_REFRESH_EVENT,
  type StudentRow,
  buildStudentId,
  createStudent,
  deleteStudent,
  fetchProgramCodes,
  fetchStudentProgramCode,
  fetchStudentRows,
  formatGender,
  formatStudentId,
  formatYearLevel,
  getIdYearOptions,
  normalizeProgramCode,
  splitStudentId,
  syncStudentProgramLink,
  updateStudent,
} from '../models/StudentModel'

type UseStudentControllerProps = {
  columns: ColumnDef<StudentRow>[]
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

function populateIdYearOptions(
  selectElement: HTMLSelectElement,
  currentYear: number,
  selectedYear?: string,
) {
  const years = getIdYearOptions(currentYear)
  selectElement.replaceChildren()

  for (const year of years) {
    const option = document.createElement('option')
    option.value = String(year)
    option.textContent = String(year)
    selectElement.append(option)
  }

  const hasSelectedYear =
    typeof selectedYear === 'string' && years.some((year) => String(year) === selectedYear)

  selectElement.value = hasSelectedYear ? selectedYear : String(currentYear)
}

function setProgramOptions(
  selectElement: HTMLSelectElement,
  programCodes: string[],
  selectedProgramCode?: string,
) {
  const normalizedSelectedCode = normalizeProgramCode(selectedProgramCode)
  selectElement.replaceChildren()

  const placeholderOption = document.createElement('option')
  placeholderOption.value = ''
  placeholderOption.textContent = 'Select program code'
  placeholderOption.hidden = true
  selectElement.append(placeholderOption)

  for (const code of programCodes) {
    const option = document.createElement('option')
    option.value = code
    option.textContent = code
    selectElement.append(option)
  }

  if (
    normalizedSelectedCode &&
    !programCodes.some((programCode) => programCode === normalizedSelectedCode)
  ) {
    const currentOption = document.createElement('option')
    currentOption.value = normalizedSelectedCode
    currentOption.textContent = normalizedSelectedCode
    selectElement.append(currentOption)
  }

  selectElement.value = normalizedSelectedCode
}

export function useStudentController({ columns }: UseStudentControllerProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: STUDENT_ROWS_PER_PAGE,
  })
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshStudents = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const rows = await fetchStudentRows()
      setStudents(rows)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setLoadError(message)
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshStudents()
  }, [refreshStudents])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleRefresh = () => {
      void refreshStudents()
    }

    window.addEventListener(STUDENTS_REFRESH_EVENT, handleRefresh)

    return () => {
      window.removeEventListener(STUDENTS_REFRESH_EVENT, handleRefresh)
    }
  }, [refreshStudents])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('studentModal')
    const titleElement = document.getElementById('studentModalLabel')
    const submitButton = document.getElementById('student-submit') as HTMLButtonElement | null
    const form = document.getElementById('student-form') as HTMLFormElement | null
    const idYearSelect = document.getElementById('student-id-year') as HTMLSelectElement | null
    const idNumberInput = document.getElementById('student-id-number') as HTMLInputElement | null
    const firstNameInput = document.getElementById('student-first-name') as HTMLInputElement | null
    const lastNameInput = document.getElementById('student-last-name') as HTMLInputElement | null
    const programSelect = document.getElementById('student-program') as HTMLSelectElement | null
    const yearSelect = document.getElementById('student-year') as HTMLSelectElement | null
    const genderSelect = document.getElementById('student-gender') as HTMLSelectElement | null

    if (!modalElement || !titleElement || !submitButton || !form) {
      return
    }

    const populateProgramSelect = async (selectedProgramCode?: string) => {
      if (!programSelect) {
        return
      }

      programSelect.disabled = true

      try {
        const programCodes = await fetchProgramCodes()
        setProgramOptions(programSelect, programCodes, selectedProgramCode)
      } finally {
        programSelect.disabled = false
      }
    }

    const handleShow = async (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const mode = trigger?.dataset.modalMode === 'edit' ? 'edit' : 'add'
      const currentYear = new Date().getFullYear()

      if (mode === 'add') {
        form.dataset.mode = 'add'
        form.dataset.studentId = ''
        form.dataset.studentProgramCode = ''
        titleElement.textContent = 'Add Student'
        submitButton.textContent = 'Add Student'

        if (idYearSelect) {
          populateIdYearOptions(idYearSelect, currentYear, String(currentYear))
        }

        if (idNumberInput) {
          idNumberInput.value = ''
          idNumberInput.placeholder = 'NNNN'
        }

        if (firstNameInput) {
          firstNameInput.value = ''
          firstNameInput.placeholder = 'First name'
        }

        if (lastNameInput) {
          lastNameInput.value = ''
          lastNameInput.placeholder = 'Last name'
        }

        if (yearSelect) {
          yearSelect.value = ''
        }

        if (genderSelect) {
          genderSelect.value = ''
        }

        await populateProgramSelect('')

        return
      }

      form.dataset.mode = 'edit'
      form.dataset.studentId = ''
      titleElement.textContent = 'Edit Student'
      submitButton.textContent = 'Save Changes'

      const studentIdRaw = trigger?.dataset.studentId ?? ''
      const { digits, idYear, idNumber } = splitStudentId(studentIdRaw)

      form.dataset.studentId = digits

      if (idYearSelect) {
        populateIdYearOptions(idYearSelect, currentYear, idYear.length === 4 ? idYear : String(currentYear))
      }

      if (idNumberInput) {
        idNumberInput.value = idNumber
        idNumberInput.placeholder = 'NNNN'
      }

      if (firstNameInput) {
        firstNameInput.value = trigger?.dataset.studentFirstName ?? ''
        firstNameInput.placeholder = 'First name'
      }

      if (lastNameInput) {
        lastNameInput.value = trigger?.dataset.studentLastName ?? ''
        lastNameInput.placeholder = 'Last name'
      }

      if (yearSelect) {
        yearSelect.value = trigger?.dataset.studentYear ?? ''
      }

      if (genderSelect) {
        genderSelect.value = trigger?.dataset.studentGender ?? ''
      }

      let selectedProgramCode = normalizeProgramCode(trigger?.dataset.studentProgramCode)

      if (digits) {
        const parsedStudentId = Number.parseInt(digits, 10)

        if (Number.isFinite(parsedStudentId)) {
          try {
            const programCode = await fetchStudentProgramCode(parsedStudentId)
            selectedProgramCode = normalizeProgramCode(programCode ?? selectedProgramCode)
          } catch (error) {
            console.error('Failed to refresh student program for edit modal:', error)
          }
        }
      }

      form.dataset.studentProgramCode = selectedProgramCode

      await populateProgramSelect(selectedProgramCode)
    }

    const handleSubmit = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!form.checkValidity()) {
        form.reportValidity()
        return
      }

      const idYearValue = idYearSelect?.value ?? ''
      const idNumberValue = idNumberInput?.value ?? ''
      const studentId = buildStudentId(idYearValue, idNumberValue)

      if (!studentId) {
        console.error('Invalid student ID format. Expected YYYY-NNNN.')
        return
      }

      const firstName = firstNameInput?.value.trim() ?? ''
      const lastName = lastNameInput?.value.trim() ?? ''
      const year = yearSelect?.value ?? ''
      const gender = genderSelect?.value ?? ''
      const programCode = programSelect?.value ?? ''
      const mode = form.dataset.mode === 'edit' ? 'edit' : 'add'

      submitButton.setAttribute('disabled', 'true')

      try {
        if (mode === 'add') {
          await createStudent({
            id: studentId,
            firstname: firstName,
            lastname: lastName,
            year,
            gender,
          })

          await syncStudentProgramLink(studentId, '', programCode)
        } else {
          await updateStudent(studentId, {
            firstname: firstName,
            lastname: lastName,
            year,
            gender,
          })

          await syncStudentProgramLink(
            studentId,
            form.dataset.studentProgramCode ?? '',
            programCode,
          )
        }

        form.dataset.studentProgramCode = normalizeProgramCode(programCode)
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to save student:', error)
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

    const modalElement = document.getElementById('deleteStudentModal')
    const hiddenInput = document.getElementById('delete-student-id') as HTMLInputElement | null
    const messageElement = modalElement?.querySelector('.modal-body p.mb-0') as HTMLParagraphElement | null
    const confirmButton = document.getElementById('confirm-delete-student') as HTMLButtonElement | null

    if (!modalElement || !hiddenInput || !messageElement || !confirmButton) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget
      const studentId = trigger?.dataset.studentId ?? ''
      const firstName = trigger?.dataset.studentFirstName ?? ''
      const lastName = trigger?.dataset.studentLastName ?? ''
      const studentName = `${firstName} ${lastName}`.trim()

      hiddenInput.value = studentId
      messageElement.textContent = studentName
        ? `Are you sure you want to delete ${studentName}?`
        : 'Are you sure you want to delete this student?'
    }

    const handleConfirm = async () => {
      const studentIdRaw = hiddenInput.value.trim()
      const studentId = Number.parseInt(studentIdRaw, 10)

      if (!Number.isFinite(studentId)) {
        console.error('Invalid student id for delete:', studentIdRaw)
        return
      }

      confirmButton.setAttribute('disabled', 'true')

      try {
        await deleteStudent(studentId)
        window.dispatchEvent(new CustomEvent(STUDENTS_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to delete student:', error)
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

    const modalElement = document.getElementById('studentInfoModal')
    const idElement = document.getElementById('student-info-id')
    const nameElement = document.getElementById('student-info-name')
    const genderElement = document.getElementById('student-info-gender')
    const yearElement = document.getElementById('student-info-year')
    const programCodeElement = document.getElementById('student-info-program-code')
    const programNameElement = document.getElementById('student-info-program-name')
    const collegeCodeElement = document.getElementById('student-info-college-code')
    const collegeNameElement = document.getElementById('student-info-college-name')

    if (
      !modalElement ||
      !idElement ||
      !nameElement ||
      !genderElement ||
      !yearElement ||
      !programCodeElement ||
      !programNameElement ||
      !collegeCodeElement ||
      !collegeNameElement
    ) {
      return
    }

    const handleShow = (event: Event) => {
      const customEvent = event as Event & { relatedTarget?: HTMLElement | null }
      const trigger = customEvent.relatedTarget

      idElement.textContent = formatStudentId(trigger?.dataset.studentId)
      nameElement.textContent = trigger?.dataset.studentName ?? 'N/A'
      genderElement.textContent = formatGender(trigger?.dataset.studentGender)
      yearElement.textContent = formatYearLevel(trigger?.dataset.studentYear)
      programCodeElement.textContent = trigger?.dataset.studentProgramCode ?? 'N/A'
      programNameElement.textContent = trigger?.dataset.studentProgramName ?? 'N/A'
      collegeCodeElement.textContent = trigger?.dataset.studentCollegeCode ?? 'N/A'
      collegeNameElement.textContent = trigger?.dataset.studentCollegeName ?? 'N/A'
    }

    modalElement.addEventListener('show.bs.modal', handleShow)

    return () => {
      modalElement.removeEventListener('show.bs.modal', handleShow)
    }
  }, [])

  const table = useReactTable({
    data: students,
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const rawFilter = String(filterValue ?? '').trim().toLowerCase()

      if (!rawFilter) {
        return true
      }

      const fieldValues = [
        row.original.firstName,
        row.original.lastName,
        row.original.programCode,
        row.original.gender,
        row.original.year,
        String(row.original.id),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())

      const combined = fieldValues.join(' ')
      const combinedNoSpace = combined.replace(/\s+/g, '')
      const filterNoSpace = rawFilter.replace(/\s+/g, '')
      const tokens = rawFilter.split(/\s+/).filter(Boolean)

      if (combinedNoSpace.includes(filterNoSpace)) {
        return true
      }

      return tokens.every((token) => combined.includes(token))
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
    refreshStudents,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    handlePageChange,
  }
}
