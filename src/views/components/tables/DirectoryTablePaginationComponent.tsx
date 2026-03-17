import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/24/outline'

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

			<nav aria-label="Directory table pagination">
				<ul className="pagination pagination-sm table-pagination mb-0">
					<li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
						<button
							type="button"
							className="page-link page-link--icon"
							onClick={() => onPageChange(1)}
							aria-label="First page"
							disabled={currentPage === 1}
						>
							<ChevronDoubleLeftIcon className="heroicon-url" aria-hidden="true" />
						</button>
					</li>

					<li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
						<button
							type="button"
							className="page-link page-link--icon"
							onClick={() => onPageChange(currentPage - 1)}
							aria-label="Previous page"
							disabled={currentPage === 1}
						>
							<ChevronLeftIcon className="heroicon-url" aria-hidden="true" />
						</button>
					</li>

					{pageWindow.map((page) => (
						<li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
							<button
								type="button"
								className="page-link"
								onClick={() => onPageChange(page)}
								aria-current={page === currentPage ? 'page' : undefined}
							>
								{page}
							</button>
						</li>
					))}

					<li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
						<button
							type="button"
							className="page-link page-link--icon"
							onClick={() => onPageChange(currentPage + 1)}
							aria-label="Next page"
							disabled={currentPage === totalPages}
						>
							<ChevronRightIcon className="heroicon-url" aria-hidden="true" />
						</button>
					</li>

					<li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
						<button
							type="button"
							className="page-link page-link--icon"
							onClick={() => onPageChange(totalPages)}
							aria-label="Last page"
							disabled={currentPage === totalPages}
						>
							<ChevronDoubleRightIcon className="heroicon-url" aria-hidden="true" />
						</button>
					</li>
				</ul>
			</nav>
		</div>
	)
}

export default DirectoryTablePaginationComponent