import { type FormEvent } from 'react'
import { Button, Card, Col, Container, Form, Row, Stack } from 'react-bootstrap'
import type { LoginFormValues } from '../models/AppModel'

type LoginPageViewProps = {
	values: LoginFormValues
	isSubmitting: boolean
	onChange: (field: keyof LoginFormValues, value: string) => void
	onSubmit: () => void
}

function LoginPageView({ values, isSubmitting, onChange, onSubmit }: LoginPageViewProps) {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onSubmit()
	}

	return (
		<Container className="py-5">
			<Card className="shadow-sm login-card">
				<Card.Body className="p-4">
					<Stack gap={3}>
						<div>
							<h1 className="h4 mb-1">Connect to MySQL</h1>
							<p className="text-muted mb-0">Enter the database credentials to continue.</p>
						</div>
						<Form onSubmit={handleSubmit}>
							<Row className="g-3">
								<Col md={8}>
									<Form.Group controlId="mysql-host">
										<Form.Label>Host</Form.Label>
										<Form.Control
											type="text"
											placeholder="localhost"
											value={values.host}
											disabled={isSubmitting}
											autoComplete="off"
											onChange={(event) => onChange('host', event.target.value)}
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="mysql-port">
										<Form.Label>Port</Form.Label>
										<Form.Control
											type="number"
											inputMode="numeric"
											min={1}
											placeholder="3306"
											value={values.port}
											disabled={isSubmitting}
											onChange={(event) => onChange('port', event.target.value)}
										/>
									</Form.Group>
								</Col>
								<Col md={12}>
									<Form.Group controlId="mysql-database">
										<Form.Label>Database</Form.Label>
										<Form.Control
											type="text"
											placeholder="acadex"
											value={values.database}
											disabled={isSubmitting}
											autoComplete="off"
											onChange={(event) => onChange('database', event.target.value)}
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group controlId="mysql-username">
										<Form.Label>Username</Form.Label>
										<Form.Control
											type="text"
											placeholder="root"
											value={values.username}
											disabled={isSubmitting}
											autoComplete="username"
											onChange={(event) => onChange('username', event.target.value)}
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group controlId="mysql-password">
										<Form.Label>Password</Form.Label>
										<Form.Control
											type="password"
											value={values.password}
											disabled={isSubmitting}
											autoComplete="current-password"
											onChange={(event) => onChange('password', event.target.value)}
										/>
									</Form.Group>
								</Col>
							</Row>
							<Button type="submit" className="mt-3" disabled={isSubmitting} aria-busy={isSubmitting}>
								{isSubmitting ? 'Connecting...' : 'Connect'}
							</Button>
						</Form>
					</Stack>
				</Card.Body>
			</Card>
		</Container>
	)
}

export default LoginPageView
