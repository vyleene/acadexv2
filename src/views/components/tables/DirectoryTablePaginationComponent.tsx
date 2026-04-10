import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Button, Form, InputGroup, Pagination } from 'react-bootstrap'

interface DirectoryTablePaginationProps {
	currentPage: number
	totalPages: number
	totalItems: number
	rangeStart: number
	rangeEnd: number
	onPageChange: (page: number) => void
}

function getPageWindow(currentPage: number, totalPages: number): number[] {
	const maxVisiblePages = 5
	let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
	let end = Math.min(totalPages, start + maxVisiblePages - 1)

	if (end - start + 1 < maxVisiblePages) {
		start = Math.max(1, end - maxVisiblePages + 1)
	}

	const pages: number[] = []
	for (let page = start; page <= end; page += 1) {
		pages.push(page)
	}

	return pages
}

function DirectoryTablePaginationComponent({
	currentPage,
	totalPages,
	totalItems,
	rangeStart,
	rangeEnd,
	onPageChange,
}: DirectoryTablePaginationProps) {
	const [isJumpOpen, setIsJumpOpen] = useState(false)
	const [jumpPageValue, setJumpPageValue] = useState(String(currentPage))

	useEffect(() => {
		setJumpPageValue(String(currentPage))
	}, [currentPage])

	useEffect(() => {
		if (totalPages <= 1) {
			setIsJumpOpen(false)
		}
	}, [totalPages])

	const handleJumpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const parsedPage = Number.parseInt(jumpPageValue, 10)
		if (!Number.isFinite(parsedPage)) {
			return
		}

		const targetPage = Math.min(totalPages, Math.max(1, parsedPage))
		onPageChange(targetPage)
		setIsJumpOpen(false)
	}

	const pageWindow = getPageWindow(currentPage, totalPages)

	return (
		<div className="table-pagination-bar">
			<p className="table-pagination-meta mb-0">
				{totalItems > 0 ? `Showing ${rangeStart}-${rangeEnd} of ${totalItems}` : 'No records available'}
			</p>

			<div className="table-pagination-actions">
				<Pagination size="sm" className="table-pagination mb-0" aria-label="Directory table pagination">
					<Pagination.Item
						className="page-link--icon"
						onClick={() => onPageChange(1)}
						disabled={currentPage === 1}
						aria-label="First page"
					>
						<ChevronDoubleLeftIcon className="u-icon" aria-hidden="true" />
					</Pagination.Item>

					<Pagination.Item
						className="page-link--icon"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						aria-label="Previous page"
					>
						<ChevronLeftIcon className="u-icon" aria-hidden="true" />
					</Pagination.Item>

					{pageWindow.map((page) => (
						<Pagination.Item
							key={page}
							active={page === currentPage}
							onClick={() => onPageChange(page)}
							aria-current={page === currentPage ? 'page' : undefined}
						>
							{page}
						</Pagination.Item>
					))}

					<Pagination.Item
						className="page-link--jump"
						onClick={() => {
							setJumpPageValue(String(currentPage))
							setIsJumpOpen((previous) => !previous)
						}}
						disabled={totalPages <= 1}
						active={isJumpOpen}
						aria-label="Jump to page"
						title="Jump to page"
					>
						...
					</Pagination.Item>

					<Pagination.Item
						className="page-link--icon"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						aria-label="Next page"
					>
						<ChevronRightIcon className="u-icon" aria-hidden="true" />
					</Pagination.Item>

					<Pagination.Item
						className="page-link--icon"
						onClick={() => onPageChange(totalPages)}
						disabled={currentPage === totalPages}
						aria-label="Last page"
					>
						<ChevronDoubleRightIcon className="u-icon" aria-hidden="true" />
					</Pagination.Item>
				</Pagination>

				{isJumpOpen ? (
					<Form className="table-pagination-jump" onSubmit={handleJumpSubmit}>
						<InputGroup size="sm">
							<Form.Control
								type="number"
								inputMode="numeric"
								min={1}
								max={totalPages}
								value={jumpPageValue}
								onChange={(event) => {
									setJumpPageValue(event.currentTarget.value)
								}}
								aria-label="Page number"
							/>
							<Button type="submit" variant="outline-secondary" className="u-btn-icon">
								Go
							</Button>
						</InputGroup>
					</Form>
				) : null}
			</div>
		</div>
	)
}

export default DirectoryTablePaginationComponent