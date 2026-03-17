import { useMemo, useState } from 'react'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
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

	const totalItems = placeholderPrograms.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return placeholderPrograms.slice(startIndex, startIndex + rowsPerPage)
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
				<table id="programsTable" className="table table-striped table-hover align-middle w-100">
					<thead className="table-light">
						<tr>
							<th>Code</th>
							<th>Program Name</th>
							<th>College</th>
							<th className="actions-col text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{currentRows.map((program) => (
							<tr key={program.code}>
								<td>{program.code}</td>
								<td>{program.programName}</td>
								<td>{program.college}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" aria-label="Edit program">
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</button>
										<button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" aria-label="Delete program">
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

export default ProgramTableComponent
