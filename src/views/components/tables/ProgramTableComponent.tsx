import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Form, InputGroup, Table } from 'react-bootstrap'
import DirectoryTablePaginationComponent from './DirectoryTablePaginationComponent'

const rowsPerPage = 5

const placeholderPrograms = [
	{
		code: 'BSCS',
		programName: 'Bachelor of Science in Computer Science',
		college: 'CCIS',
	},
	{
		code: 'BSIT',
		programName: 'Bachelor of Science in Information Technology',
		college: 'CCIS',
	},
	{
		code: 'BSEDUC',
		programName: 'Bachelor of Secondary Education',
		college: 'CED',
	},
	{
		code: 'BSN',
		programName: 'Bachelor of Science in Nursing',
		college: 'CHS',
	},
	{
		code: 'BSBA',
		programName: 'Bachelor of Science in Business Administration',
		college: 'CBA',
	},
	{
		code: 'BSCE',
		programName: 'Bachelor of Science in Civil Engineering',
		college: 'COE',
	},
	{
		code: 'BSEDMATH',
		programName: 'Bachelor of Secondary Education Major in Math',
		college: 'CED',
	},
	{
		code: 'BSPHARM',
		programName: 'Bachelor of Science in Pharmacy',
		college: 'CHS',
	},
	{
		code: 'BSENTREP',
		programName: 'Bachelor of Science in Entrepreneurship',
		college: 'CBA',
	},
]

function ProgramTableComponent() {
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')

	const filteredPrograms = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase()

		if (!normalizedSearch) {
			return placeholderPrograms
		}

		return placeholderPrograms.filter((program) => {
			return (
				program.code.toLowerCase().includes(normalizedSearch) ||
				program.programName.toLowerCase().includes(normalizedSearch) ||
				program.college.toLowerCase().includes(normalizedSearch)
			)
		})
	}, [searchQuery])

	const totalItems = filteredPrograms.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return filteredPrograms.slice(startIndex, startIndex + rowsPerPage)
	}, [filteredPrograms, safeCurrentPage])

	const rangeStart = totalItems === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage + 1
	const rangeEnd = totalItems === 0 ? 0 : Math.min(safeCurrentPage * rowsPerPage, totalItems)

	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) {
			return
		}

		setCurrentPage(page)
	}

	return (
		<div className="table-shell">
			<div className="table-toolbar">
				<Form.Label htmlFor="programsSearch" visuallyHidden>
					Search programs
				</Form.Label>
				<InputGroup className="table-search">
					<InputGroup.Text>
						<MagnifyingGlassIcon className="table-search__icon" aria-hidden="true" />
					</InputGroup.Text>
					<Form.Control
						id="programsSearch"
						type="search"
						className="table-search__input"
						placeholder="Search..."
						value={searchQuery}
						onChange={(event) => {
							setSearchQuery(event.currentTarget.value)
							setCurrentPage(1)
						}}
					/>
				</InputGroup>
			</div>

			<Table id="programsTable" striped hover responsive className="align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>Code</th>
						<th>Program Name</th>
						<th>College</th>
						<th className="actions-col text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentRows.length > 0 ? (
						currentRows.map((program) => (
							<tr key={program.code}>
								<td>{program.code}</td>
								<td>{program.programName}</td>
								<td>{program.college}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<Button
											type="button"
											size="sm"
											variant="outline-primary"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Edit program"
										>
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline-danger"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Delete program"
										>
											<TrashIcon className="heroicon-url" aria-hidden="true" />
										</Button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr className="table-empty-row">
							<td colSpan={4}>No matching programs found.</td>
						</tr>
					)}
				</tbody>
			</Table>

			<DirectoryTablePaginationComponent
				currentPage={safeCurrentPage}
				totalPages={totalPages}
				totalItems={totalItems}
				rangeStart={rangeStart}
				rangeEnd={rangeEnd}
				onPageChange={handlePageChange}
			/>
		</div>
	)
}

export default ProgramTableComponent
