import { useState } from 'react'
import {
	ArrowPathIcon,
	ArrowsUpDownIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	MagnifyingGlassIcon,
	PlusIcon,
} from '@heroicons/react/24/outline'
import { type Table as ReactTable, flexRender } from '@tanstack/react-table'
import { Button, Form, InputGroup, Table } from 'react-bootstrap'
import { type ProgramRow } from '../../../models/ProgramModel'
import DirectoryTablePaginationComponent from './DirectoryTablePaginationComponent'

function renderSortIcon(sortState: false | 'asc' | 'desc') {
	if (sortState === 'asc') {
		return <ChevronUpIcon className="table-sort-icon" aria-hidden="true" />
	}

	if (sortState === 'desc') {
		return <ChevronDownIcon className="table-sort-icon" aria-hidden="true" />
	}

	return <ArrowsUpDownIcon className="table-sort-icon table-sort-icon--muted" aria-hidden="true" />
}

type ProgramTableProps = {
	table: ReactTable<ProgramRow>
	globalFilter: string
	setGlobalFilter: (value: string) => void
	isLoading: boolean
	loadError: string | null
	refreshPrograms: () => Promise<void>
	currentPage: number
	totalPages: number
	totalItems: number
	rangeStart: number
	rangeEnd: number
	handlePageChange: (page: number) => void
}

function ProgramTableComponent({
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
}: ProgramTableProps) {
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		if (isRefreshing || isLoading) {
			return
		}

		setIsRefreshing(true)
		try {
			await refreshPrograms()
		} finally {
			setIsRefreshing(false)
		}
	}

	const emptyStateMessage = loadError
		? `Failed to load programs: ${loadError}`
		: isLoading
			? 'Loading programs...'
			: 'No matching programs found.'

	return (
		<div className={`table-shell${isLoading ? ' is-loading' : ''}${isRefreshing ? ' is-refreshing' : ''}`}>
			<div className="table-toolbar">
				<div className="table-toolbar__search">
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
							value={globalFilter}
							onChange={(event) => {
								setGlobalFilter(event.currentTarget.value)
								table.setPageIndex(0)
							}}
						/>
					</InputGroup>
				</div>

				<div className="table-toolbar__actions" role="group" aria-label="Program directory actions">
					<Button
						variant="primary"
						className="u-btn-icon table-toolbar__icon-btn"
						id="btn-add-program"
						type="button"
						data-bs-toggle="modal"
						data-bs-target="#programModal"
						data-modal-mode="add"
					>
						<PlusIcon className="u-icon" aria-hidden="true" />
					</Button>
					<Button
						variant="secondary"
						className="u-btn-icon table-toolbar__icon-btn"
						id="btn-refresh-program"
						type="button"
						aria-label="Refresh programs"
						onClick={() => {
							void handleRefresh()
						}}
						disabled={isLoading || isRefreshing}
					>
						<ArrowPathIcon className="u-icon" aria-hidden="true" />
					</Button>
				</div>
			</div>

			<Table id="programsTable" striped hover responsive className="align-middle w-100">
				<thead className="table-light">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const isActionsColumn = header.column.id === 'actions'
								const canSort = header.column.getCanSort()
								const sortState = header.column.getIsSorted()
								const headerLabel =
									typeof header.column.columnDef.header === 'string'
										? header.column.columnDef.header
										: header.column.id
								const headerContent = header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())

								return (
									<th
										key={header.id}
										className={isActionsColumn ? 'actions-col text-center' : undefined}
									>
										{canSort ? (
											<button
												type="button"
												className="table-sort-btn"
												onClick={header.column.getToggleSortingHandler()}
												aria-label={`Sort by ${headerLabel}`}
											>
												<span>{headerContent}</span>
												{renderSortIcon(sortState)}
											</button>
										) : (
											headerContent
										)}
									</th>
								)
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="table-row-clickable"
								role="button"
								tabIndex={0}
								data-bs-toggle="modal"
								data-bs-target="#programInfoModal"
								data-program-code={row.original.code}
								data-program-name={row.original.programName}
								data-program-student-count={String(row.original.studentCount)}
								data-college-code={row.original.collegeCode}
								data-college-name={row.original.collegeName}
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className={cell.column.id === 'actions' ? 'text-center' : undefined}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					) : (
						<tr className="table-empty-row">
							<td colSpan={4}>{emptyStateMessage}</td>
						</tr>
					)}
				</tbody>
			</Table>

			<DirectoryTablePaginationComponent
				currentPage={currentPage}
				totalPages={totalPages}
				totalItems={totalItems}
				rangeStart={rangeStart}
				rangeEnd={rangeEnd}
				onPageChange={handlePageChange}
			/>

			<div
				className="table-overlay"
				role="status"
				aria-live="polite"
				aria-hidden={!isRefreshing}
			>
				<div className="table-overlay__spinner" aria-hidden="true" />
			</div>
		</div>
	)
}

export default ProgramTableComponent
