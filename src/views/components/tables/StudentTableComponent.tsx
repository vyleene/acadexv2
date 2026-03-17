import { useMemo, useState } from 'react'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
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

	const totalItems = placeholderStudents.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return placeholderStudents.slice(startIndex, startIndex + rowsPerPage)
	}, [safeCurrentPage])

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
			<div className="table-responsive">
				<table id="studentsTable" className="table table-striped table-hover align-middle w-100">
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
						{currentRows.map((student) => (
							<tr key={student.id}>
								<td>{student.id}</td>
								<td>{student.firstName}</td>
								<td>{student.lastName}</td>
								<td>{student.programCode}</td>
								<td>{student.year}</td>
								<td>{student.gender}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" aria-label="Edit student">
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</button>
										<button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" aria-label="Delete student">
											<TrashIcon className="heroicon-url" aria-hidden="true" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

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
