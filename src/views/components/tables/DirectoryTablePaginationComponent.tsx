import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Pagination } from 'react-bootstrap'

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
	const pageWindow = getPageWindow(currentPage, totalPages)

	return (
		<div className="table-pagination-bar">
			<p className="table-pagination-meta mb-0">
				{totalItems > 0 ? `Showing ${rangeStart}-${rangeEnd} of ${totalItems}` : 'No records available'}
			</p>

			<Pagination size="sm" className="table-pagination mb-0" aria-label="Directory table pagination">
				<Pagination.Item
					className="page-link--icon"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
					aria-label="First page"
				>
					<ChevronDoubleLeftIcon className="heroicon-url" aria-hidden="true" />
				</Pagination.Item>

				<Pagination.Item
					className="page-link--icon"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Previous page"
				>
					<ChevronLeftIcon className="heroicon-url" aria-hidden="true" />
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
					className="page-link--icon"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label="Next page"
				>
					<ChevronRightIcon className="heroicon-url" aria-hidden="true" />
				</Pagination.Item>

				<Pagination.Item
					className="page-link--icon"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
					aria-label="Last page"
				>
					<ChevronDoubleRightIcon className="heroicon-url" aria-hidden="true" />
				</Pagination.Item>
			</Pagination>
		</div>
	)
}

export default DirectoryTablePaginationComponent