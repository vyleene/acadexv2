import { useMemo, useState } from 'react'
import { ArrowPathIcon, MagnifyingGlassIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Form, InputGroup, Table } from 'react-bootstrap'
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
	const [searchQuery, setSearchQuery] = useState('')

	const filteredColleges = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase()

		if (!normalizedSearch) {
			return placeholderColleges
		}

		return placeholderColleges.filter((college) => {
			return college.code.toLowerCase().includes(normalizedSearch) || college.collegeName.toLowerCase().includes(normalizedSearch)
		})
	}, [searchQuery])

	const totalItems = filteredColleges.length
	const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
	const safeCurrentPage = Math.min(currentPage, totalPages)

	const currentRows = useMemo(() => {
		const startIndex = (safeCurrentPage - 1) * rowsPerPage
		return filteredColleges.slice(startIndex, startIndex + rowsPerPage)
	}, [filteredColleges, safeCurrentPage])

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
				<div className="table-toolbar__search">
					<Form.Label htmlFor="collegesSearch" visuallyHidden>
						Search colleges
					</Form.Label>
					<InputGroup className="table-search">
						<InputGroup.Text>
							<MagnifyingGlassIcon className="table-search__icon" aria-hidden="true" />
						</InputGroup.Text>
						<Form.Control
							id="collegesSearch"
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

				<div className="table-toolbar__actions" role="group" aria-label="College directory actions">
					<Button
						variant="primary"
						className="d-inline-flex align-items-center gap-2"
						id="btn-add-college"
						type="button"
					>
						<PlusIcon className="heroicon-url" aria-hidden="true" />
					</Button>
					<Button
						variant="secondary"
						className="d-inline-flex align-items-center table-toolbar__icon-btn"
						id="btn-refresh-college"
						type="button"
						aria-label="Refresh colleges"
					>
						<ArrowPathIcon className="heroicon-url" aria-hidden="true" />
					</Button>
				</div>
			</div>

			<Table id="collegesTable" striped hover responsive className="align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>Code</th>
						<th>College Name</th>
						<th className="actions-col text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{currentRows.length > 0 ? (
						currentRows.map((college) => (
							<tr key={college.code}>
								<td>{college.code}</td>
								<td>{college.collegeName}</td>
								<td className="text-center">
									<div className="d-inline-flex gap-2">
										<Button
											type="button"
											size="sm"
											variant="outline-primary"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Edit college"
										>
											<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline-danger"
											className="d-inline-flex align-items-center gap-1"
											aria-label="Delete college"
										>
											<TrashIcon className="heroicon-url" aria-hidden="true" />
										</Button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr className="table-empty-row">
							<td colSpan={3}>No matching colleges found.</td>
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

export default CollegeTableComponent
