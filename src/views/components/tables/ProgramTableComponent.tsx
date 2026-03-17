import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

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
]

function ProgramTableComponent() {
	return (
		<div className="table-responsive table-shell">
			<table id="programsTable" className="table table-striped table-hover align-middle w-100">
				<thead className="table-light">
					<tr>
						<th>Code</th>
						<th>Program Name</th>
						<th>College</th>
						<th className="text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{placeholderPrograms.map((program) => (
						<tr key={program.code}>
							<td>{program.code}</td>
							<td>{program.programName}</td>
							<td>{program.college}</td>
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

export default ProgramTableComponent
