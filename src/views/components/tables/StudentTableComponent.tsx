import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Form, InputGroup, Table } from 'react-bootstrap'
import DirectoryTablePaginationComponent from './DirectoryTablePaginationComponent'

const rowsPerPage = 5

const placeholderStudents = [
	{
		id: 2024001,
		firstName: 'Alyssa',
		lastName: 'Reyes',
		programCode: 'BSCS',
		year: '2',
		gender: 'F',
	},
	{
		id: 2024002,
		firstName: 'Marco',
		lastName: 'Santos',
		programCode: 'BSIT',
		year: '3',
		gender: 'M',
	},
	{
		id: 2024003,
		firstName: 'Janelle',
		lastName: 'Garcia',
		programCode: 'BSIS',
		year: '1',
		gender: 'F',
	},
	{
		id: 2024004,
		firstName: 'Ethan',
		lastName: 'Villanueva',
		programCode: 'BSEDUC',
		year: '4',
		gender: 'M',
	},
	{
		id: 2024005,
		firstName: 'Sofia',
		lastName: 'Dizon',
		programCode: 'BSN',
		year: '2',
		gender: 'F',
	},
	{
		id: 2024006,
		firstName: 'Noah',
		lastName: 'Mendoza',
		programCode: 'BSBA',
		year: '1',
		gender: 'M',
	},
	{
		id: 2024007,
		firstName: 'Bianca',
		lastName: 'Cruz',
		programCode: 'BSCS',
		year: '3',
		gender: 'F',
	},
	{
		id: 2024008,
		firstName: 'Gabriel',
		lastName: 'Torres',
		programCode: 'BSIT',
		year: '4',
		gender: 'M',
	},
	{
		id: 2024009,
		firstName: 'Mika',
		lastName: 'Navarro',
		programCode: 'BSIS',
		year: '2',
		gender: 'F',
	},
	{
		id: 2024010,
		firstName: 'Liam',
		lastName: 'Aquino',
		programCode: 'BSBA',
		year: '3',
		gender: 'M',
	},
]

function StudentTableComponent() {
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')

	const filteredStudents = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase()

		if (!normalizedSearch) {
			return placeholderStudents
		}

		return placeholderStudents.filter((student) => {
			return (
				String(student.id).includes(normalizedSearch) ||
				student.firstName.toLowerCase().includes(normalizedSearch) ||
				student.lastName.toLowerCase().includes(normalizedSearch) ||
				student.programCode.toLowerCase().includes(normalizedSearch) ||
				student.year.toLowerCase().includes(normalizedSearch) ||
				student.gender.toLowerCase().includes(normalizedSearch)
			)
		})
	}, [searchQuery])

	const totalItems = filteredStudents.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return filteredStudents.slice(startIndex, startIndex + rowsPerPage)
	}, [filteredStudents, safeCurrentPage])

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
				<Form.Label htmlFor="studentsSearch" visuallyHidden>
					Search students
				</Form.Label>
				<InputGroup className="table-search">
					<InputGroup.Text>
						<MagnifyingGlassIcon className="table-search__icon" aria-hidden="true" />
					</InputGroup.Text>
					<Form.Control
						id="studentsSearch"
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

			<Table id="studentsTable" striped hover responsive className="align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>ID</th>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Program Code</th>
						<th>Year</th>
						<th>Gender</th>
						<th className="actions-col text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentRows.length > 0 ? (
						currentRows.map((student) => (
							<tr key={student.id}>
								<td>{student.id}</td>
								<td>{student.firstName}</td>
								<td>{student.lastName}</td>
								<td>{student.programCode}</td>
								<td>{student.year}</td>
								<td>{student.gender}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<Button
											type="button"
											size="sm"
											variant="outline-primary"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Edit student"
										>
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline-danger"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Delete student"
										>
											<TrashIcon className="heroicon-url" aria-hidden="true" />
										</Button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr className="table-empty-row">
							<td colSpan={7}>No matching students found.</td>
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

export default StudentTableComponent
