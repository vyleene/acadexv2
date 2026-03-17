import { useMemo, useState } from 'react'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import DirectoryTablePaginationComponent from './DirectoryTablePaginationComponent'

const rowsPerPage = 5

const placeholderColleges = [
	{
		code: 'CCIS',
		collegeName: 'College of Computing and Information Sciences',
	},
	{
		code: 'CED',
		collegeName: 'College of Education',
	},
	{
		code: 'CHS',
		collegeName: 'College of Health Sciences',
	},
	{
		code: 'CBA',
		collegeName: 'College of Business and Accountancy',
	},
	{
		code: 'COE',
		collegeName: 'College of Engineering',
	},
	{
		code: 'CASS',
		collegeName: 'College of Arts and Social Sciences',
	},
	{
		code: 'CAS',
		collegeName: 'College of Arts and Sciences',
	},
	{
		code: 'CTE',
		collegeName: 'College of Teacher Education',
	},
	{
		code: 'CN',
		collegeName: 'College of Nursing',
	},
]

function CollegeTableComponent() {
	const [currentPage, setCurrentPage] = useState(1)

	const totalItems = placeholderColleges.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return placeholderColleges.slice(startIndex, startIndex + rowsPerPage)
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
				<table id="collegesTable" className="table table-striped table-hover align-middle w-100">
					<thead className="table-light">
						<tr>
							<th>Code</th>
							<th>College Name</th>
							<th className="actions-col text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{currentRows.map((college) => (
							<tr key={college.code}>
								<td>{college.code}</td>
								<td>{college.collegeName}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" aria-label="Edit college">
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</button>
										<button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" aria-label="Delete college">
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

export default CollegeTableComponent
