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
  STUDENT_ROWS_PER_PAGE,
  STUDENTS_REFRESH_EVENT,
  type StudentRow,
  buildStudentId,
  formatGender,
  formatStudentId,
  formatYearLevel,
  getIdYearOptions,
  normalizeProgramCode,
  splitStudentId,
} from '../models/StudentModel'
import {
  createStudent,
  deleteStudent,
  fetchProgramCodes,
  fetchStudentRows,
  updateStudent,
} from '../services/studentService'
import { useDirectoryData } from '../hooks/useDirectoryData'
import { getErrorMessage } from '../utils/errors'
import { dispatchToast } from '../models/AppModel'
import { COLLEGES_REFRESH_EVENT } from '../models/CollegeModel'
import { PROGRAMS_REFRESH_EVENT } from '../models/ProgramModel'

type UseStudentViewModelProps = {
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

  if (typeof selectedYear === 'string' && /^\d{4}$/.test(selectedYear)) {
    const selectedYearNumber = Number.parseInt(selectedYear, 10)

    if (!years.includes(selectedYearNumber)) {
      years.push(selectedYearNumber)
      years.sort((left, right) => left - right)
    }
  }

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

function sanitizeStudentNameInput(value: string): string {
  return value.replace(/[^A-Za-z ]+/g, '').slice(0, 32)
}

export function useStudentViewModel({ columns }: UseStudentViewModelProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: STUDENT_ROWS_PER_PAGE,
  })
  const handleLoadError = useCallback((_message: string) => {
    dispatchToast({
      type: 'error',
      message: 'Unable to load students.',
    })
  }, [])

  const {
    rows: students,
    isLoading,
    loadError,
    refresh: refreshStudents,
  } = useDirectoryData<StudentRow>({
    fetcher: fetchStudentRows,
    refreshEvent: STUDENTS_REFRESH_EVENT,
    loadingKey: 'students',
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

  const globalFilterFn = useCallback((row: { original: StudentRow }) => {
    const { rawFilter, filterNoSpace, tokens } = normalizedFilter

    if (!rawFilter) {
      return true
    }

    const fieldValues = [
      row.original.firstName,
      row.original.lastName,
      row.original.programCode,
      row.original.gender,
      formatGender(row.original.gender),
      row.original.year,
      formatYearLevel(row.original.year),
      String(row.original.id),
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())

    const combined = fieldValues.join(' ')
    const combinedNoSpace = combined.replace(/\s+/g, '')
    const hasGenderToken = tokens.some((token) => token === 'male' || token === 'female')
    const genderValue = formatGender(row.original.gender).toLowerCase()
    const genderCode = String(row.original.gender ?? '').toLowerCase()

    if (!hasGenderToken && combinedNoSpace.includes(filterNoSpace)) {
      return true
    }

    return tokens.every((token) => {
      if (token === 'male' || token === 'female') {
        return token === genderValue || token === genderCode
      }

      return combined.includes(token)
    })
  }, [normalizedFilter])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const modalElement = document.getElementById('studentModal')
    const titleTextElement = document.getElementById('studentModalTitleText')
    const submitButton = document.getElementById('student-submit') as HTMLButtonElement | null
    const form = document.getElementById('student-form') as HTMLFormElement | null
    const idYearSelect = document.getElementById('student-id-year') as HTMLSelectElement | null
    const idNumberInput = document.getElementById('student-id-number') as HTMLInputElement | null
    const firstNameInput = document.getElementById('student-first-name') as HTMLInputElement | null
    const lastNameInput = document.getElementById('student-last-name') as HTMLInputElement | null
    const programSelect = document.getElementById('student-program') as HTMLSelectElement | null
    const yearSelect = document.getElementById('student-year') as HTMLSelectElement | null
    const genderSelect = document.getElementById('student-gender') as HTMLSelectElement | null

    if (!modalElement || !titleTextElement || !submitButton || !form) {
      return
    }

    const handleFirstNameInput = () => {
      if (!firstNameInput) {
        return
      }

      const sanitizedValue = sanitizeStudentNameInput(firstNameInput.value)
      if (firstNameInput.value !== sanitizedValue) {
        firstNameInput.value = sanitizedValue
      }
    }

    const handleLastNameInput = () => {
      if (!lastNameInput) {
        return
      }

      const sanitizedValue = sanitizeStudentNameInput(lastNameInput.value)
      if (lastNameInput.value !== sanitizedValue) {
        lastNameInput.value = sanitizedValue
      }
    }

    const populateProgramSelect = async (selectedProgramCode?: string) => {
      if (!programSelect) {
        return
      }

      programSelect.disabled = true

      try {
        const programCodes = await fetchProgramCodes(true)
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
        titleTextElement.textContent = 'Add Student'
        submitButton.textContent = 'Add Student'

        if (idYearSelect) {
          idYearSelect.disabled = false
          populateIdYearOptions(idYearSelect, currentYear, String(currentYear))
        }

        if (idNumberInput) {
          idNumberInput.disabled = false
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
      titleTextElement.textContent = 'Edit Student'
      submitButton.textContent = 'Save Changes'

      const studentIdRaw = trigger?.dataset.studentId ?? ''
      const { digits, idYear, idNumber } = splitStudentId(studentIdRaw)

      form.dataset.studentId = digits

      if (idYearSelect) {
        idYearSelect.disabled = true
        populateIdYearOptions(idYearSelect, currentYear, idYear.length === 4 ? idYear : String(currentYear))
      }

      if (idNumberInput) {
        idNumberInput.disabled = true
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

      const selectedProgramCode = normalizeProgramCode(trigger?.dataset.studentProgramCode)
      await populateProgramSelect(selectedProgramCode)
    }

    const handleSubmit = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!form.checkValidity()) {
        form.reportValidity()
        dispatchToast({
          type: 'warning',
          message: 'Complete all required student fields.',
        })
        return
      }

      const mode = form.dataset.mode === 'edit' ? 'edit' : 'add'
      const idYearValue = idYearSelect?.value ?? ''
      const idNumberValue = idNumberInput?.value ?? ''
      const studentId = buildStudentId(idYearValue, idNumberValue)

      const firstName = sanitizeStudentNameInput(firstNameInput?.value ?? '').trim()
      const lastName = sanitizeStudentNameInput(lastNameInput?.value ?? '').trim()
      const year = yearSelect?.value ?? ''
      const gender = genderSelect?.value ?? ''
      const programCode = programSelect?.value ?? ''

      if (mode === 'add' && !studentId) {
        console.error('Invalid student ID format. Expected YYYY-NNNN.')
        dispatchToast({
          type: 'error',
          message: 'Enter student ID in YYYY-NNNN format.',
        })
        return
      }

      const originalStudentId = Number.parseInt(form.dataset.studentId ?? '', 10)
      let targetStudentId: number

      if (mode === 'edit') {
        if (!Number.isFinite(originalStudentId)) {
          dispatchToast({
            type: 'error',
            message: 'Unable to edit student with invalid ID.',
          })
          return
        }

        targetStudentId = originalStudentId
      } else {
        if (!studentId) {
          dispatchToast({
            type: 'error',
            message: 'Enter student ID in YYYY-NNNN format.',
          })
          return
        }

        targetStudentId = studentId
      }
      const actionVerb = mode === 'add' ? 'add' : 'edit'

      if (!firstName || !lastName) {
        dispatchToast({
          type: 'warning',
          message: 'Student names must contain letters only.',
        })
        return
      }

      if (firstNameInput) {
        firstNameInput.value = firstName
      }

      if (lastNameInput) {
        lastNameInput.value = lastName
      }

      submitButton.setAttribute('disabled', 'true')

      try {
        if (mode === 'add') {
          await createStudent({
            id: targetStudentId,
            program_code: programCode,
            firstname: firstName,
            lastname: lastName,
            year,
            gender,
          })
        } else {
          await updateStudent(targetStudentId, {
            program_code: programCode,
            firstname: firstName,
            lastname: lastName,
            year,
            gender,
          })
        }

        await refreshStudents()

        const formattedStudentId = formatStudentId(targetStudentId)
        dispatchToast({
          type: 'success',
          message:
            mode === 'add'
              ? `Added student ID: ${formattedStudentId}`
              : `Edited student ID: ${formattedStudentId}`,
        })

        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to save student:', error)
        const rawErrorMessage = getErrorMessage(error, '').toLowerCase()
        const formattedStudentId = formatStudentId(targetStudentId)

        let message = `Unable to ${actionVerb} student.`

        if (rawErrorMessage.includes('duplicate entry') || rawErrorMessage.includes('1062')) {
          message = `Unable to ${actionVerb} student with duplicate ID: ${formattedStudentId}`
        } else if (rawErrorMessage.includes('foreign key') || rawErrorMessage.includes('1452')) {
          message = `Unable to ${actionVerb} student with invalid program code.`
        } else if (rawErrorMessage.includes('not found')) {
          message = `Unable to ${actionVerb} student with missing ID: ${formattedStudentId}`
        }

        dispatchToast({
          type: 'error',
          message,
        })
      } finally {
        submitButton.removeAttribute('disabled')
      }
    }

    const handleProgramsRefresh = () => {
      if (!modalElement.classList.contains('show')) {
        return
      }

      const selectedProgramCode = normalizeProgramCode(programSelect?.value)
      void populateProgramSelect(selectedProgramCode)
    }

    firstNameInput?.addEventListener('input', handleFirstNameInput)
    lastNameInput?.addEventListener('input', handleLastNameInput)
    modalElement.addEventListener('show.bs.modal', handleShow)
    form.addEventListener('submit', handleSubmit)
    window.addEventListener(PROGRAMS_REFRESH_EVENT, handleProgramsRefresh)

    return () => {
      firstNameInput?.removeEventListener('input', handleFirstNameInput)
      lastNameInput?.removeEventListener('input', handleLastNameInput)
      modalElement.removeEventListener('show.bs.modal', handleShow)
      form.removeEventListener('submit', handleSubmit)
      window.removeEventListener(PROGRAMS_REFRESH_EVENT, handleProgramsRefresh)
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
        dispatchToast({
          type: 'error',
          message: 'Unable to delete student with invalid ID.',
        })
        return
      }

      confirmButton.setAttribute('disabled', 'true')

      try {
        await deleteStudent(studentId)
        await refreshStudents()
        const studentLabel = formatStudentId(studentId)
        dispatchToast({
          type: 'success',
          message: `Deleted student ID: ${studentLabel}`,
        })
        window.dispatchEvent(new CustomEvent(PROGRAMS_REFRESH_EVENT))
        window.dispatchEvent(new CustomEvent(COLLEGES_REFRESH_EVENT))
        closeModal(modalElement)
      } catch (error) {
        console.error('Failed to delete student:', error)
        const rawErrorMessage = getErrorMessage(error, '').toLowerCase()

        let message = 'Unable to delete student.'

        if (rawErrorMessage.includes('not found')) {
          message = `Unable to delete student with missing ID: ${formatStudentId(studentId)}`
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
      const rawCollegeCode = trigger?.dataset.studentCollegeCode?.trim() ?? ''
      const collegeCode = rawCollegeCode && rawCollegeCode !== 'N/A' ? rawCollegeCode.toUpperCase() : ''

      idElement.textContent = formatStudentId(trigger?.dataset.studentId)
      nameElement.textContent = trigger?.dataset.studentName ?? 'N/A'
      genderElement.textContent = formatGender(trigger?.dataset.studentGender)
      yearElement.textContent = formatYearLevel(trigger?.dataset.studentYear)
      programCodeElement.textContent = trigger?.dataset.studentProgramCode ?? 'N/A'
      programNameElement.textContent = trigger?.dataset.studentProgramName ?? 'N/A'
      collegeCodeElement.textContent = rawCollegeCode || 'N/A'
      collegeNameElement.textContent = trigger?.dataset.studentCollegeName ?? 'N/A'

      if (collegeCode) {
        collegeCodeElement.setAttribute('data-college', collegeCode)
      } else {
        collegeCodeElement.removeAttribute('data-college')
      }
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
  }, [table, pagination.pageIndex, pagination.pageSize, globalFilter, students])

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
    refreshStudents,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    handlePageChange,
  }
}
