import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

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
]

function CollegeTableComponent() {
	return (
		<div className="table-responsive table-shell">
			<table id="collegesTable" className="table table-striped table-hover align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>Code</th>
						<th>College Name</th>
						<th className="text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{placeholderColleges.map((college) => (
						<tr key={college.code}>
							<td>{college.code}</td>
							<td>{college.collegeName}</td>
							<td className="text-center">
								<div className="d-inline-flex gap-2">
									<button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
										<PencilSquareIcon className="heroicon-url" aria-hidden="true" />
									</button>
									<button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1">
										<TrashIcon className="heroicon-url" aria-hidden="true" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default CollegeTableComponent
