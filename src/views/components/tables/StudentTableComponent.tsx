import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

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
]

function StudentTableComponent() {
	return (
		<div className="table-responsive table-shell">
			<table id="studentsTable" className="table table-striped table-hover align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>ID</th>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Program Code</th>
						<th>Year</th>
						<th>Gender</th>
						<th className="text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{placeholderStudents.map((student) => (
						<tr key={student.id}>
							<td>{student.id}</td>
							<td>{student.firstName}</td>
							<td>{student.lastName}</td>
							<td>{student.programCode}</td>
							<td>{student.year}</td>
							<td>{student.gender}</td>
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

export default StudentTableComponent
