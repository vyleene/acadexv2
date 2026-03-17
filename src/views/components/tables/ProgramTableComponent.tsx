import { useMemo } from 'react'
import {
	ArrowPathIcon,
	ArrowsUpDownIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	MagnifyingGlassIcon,
	PencilSquareIcon,
	PlusIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import { type ColumnDef, flexRender } from '@tanstack/react-table'
import { Button, Form, InputGroup, Table } from 'react-bootstrap'
import { useProgramTableController } from '../../../controllers/useProgramTableController'
import { type ProgramRow } from '../../../models/ProgramTableModel'
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

function ProgramTableComponent() {
	const columns = useMemo<ColumnDef<ProgramRow>[]>(
		() => [
			{ accessorKey: 'code', header: 'Code' },
			{ accessorKey: 'programName', header: 'Program Name' },
			{ accessorKey: 'college', header: 'College' },
			{
				id: 'actions',
				header: 'Actions',
				enableSorting: false,
				enableGlobalFilter: false,
				cell: () => (
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
				),
			},
		],
		[]
	)

	const {
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
	} = useProgramTableController({ columns })

	const emptyStateMessage = loadError
		? `Failed to load programs: ${loadError}`
		: isLoading
			? 'Loading programs...'
			: 'No matching programs found.'

	return (
		<div className={`table-shell${isLoading ? ' is-loading' : ''}`}>
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
						className="d-inline-flex align-items-center gap-2"
						id="btn-add-program"
						type="button"
					>
						<PlusIcon className="heroicon-url" aria-hidden="true" />
					</Button>
					<Button
						variant="secondary"
						className="d-inline-flex align-items-center table-toolbar__icon-btn"
						id="btn-refresh-program"
						type="button"
						aria-label="Refresh programs"
						onClick={() => {
							void refreshPrograms()
						}}
						disabled={isLoading}
					>
						<ArrowPathIcon className="heroicon-url" aria-hidden="true" />
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
							<tr key={row.id}>
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
		</div>
	)
}

export default ProgramTableComponent
