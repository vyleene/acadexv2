import { type FormEvent } from 'react'
import {
	CircleStackIcon,
	GlobeAltIcon,
	IdentificationIcon,
	KeyIcon,
	UserIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
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
		<Container className="login-shell">
			<Card className="shadow-sm login-card">
				<Card.Body className="p-0">
					<div className="login-card__layout">
						<section className="login-card__intro">
							<h1 className="login-card__title mb-0">Connect to MySQL</h1>
							<p className="login-card__description mb-0">
								Authenticate to continue to the academic directory workspace.
							</p>
						</section>

						<section className="login-card__form-pane">
							<Form className="login-form" onSubmit={handleSubmit}>
								<Row className="g-3">
									<Col md={8}>
										<Form.Group className="login-field" controlId="mysql-host">
											<Form.Label>Host</Form.Label>
											<InputGroup className="login-input-group">
												<InputGroup.Text>
													<GlobeAltIcon className="u-icon" aria-hidden="true" />
												</InputGroup.Text>
												<Form.Control
													type="text"
													placeholder="localhost"
													value={values.host}
													disabled={isSubmitting}
													autoComplete="off"
													onChange={(event) => onChange('host', event.target.value)}
												/>
											</InputGroup>
										</Form.Group>
									</Col>

									<Col md={4}>
										<Form.Group className="login-field" controlId="mysql-port">
											<Form.Label>Port</Form.Label>
											<InputGroup className="login-input-group">
												<InputGroup.Text>
													<IdentificationIcon className="u-icon" aria-hidden="true" />
												</InputGroup.Text>
												<Form.Control
													type="number"
													inputMode="numeric"
													min={1}
													placeholder="3306"
													value={values.port}
													disabled={isSubmitting}
													onChange={(event) => onChange('port', event.target.value)}
												/>
											</InputGroup>
										</Form.Group>
									</Col>

									<Col md={12}>
										<Form.Group className="login-field" controlId="mysql-database">
											<Form.Label>Database</Form.Label>
											<InputGroup className="login-input-group">
												<InputGroup.Text>
													<CircleStackIcon className="u-icon" aria-hidden="true" />
												</InputGroup.Text>
												<Form.Control
													type="text"
													placeholder="acadex"
													value={values.database}
													disabled={isSubmitting}
													autoComplete="off"
													onChange={(event) => onChange('database', event.target.value)}
												/>
											</InputGroup>
										</Form.Group>
									</Col>

									<Col md={6}>
										<Form.Group className="login-field" controlId="mysql-username">
											<Form.Label>Username</Form.Label>
											<InputGroup className="login-input-group">
												<InputGroup.Text>
													<UserIcon className="u-icon" aria-hidden="true" />
												</InputGroup.Text>
												<Form.Control
													type="text"
													placeholder="root"
													value={values.username}
													disabled={isSubmitting}
													autoComplete="username"
													onChange={(event) => onChange('username', event.target.value)}
												/>
											</InputGroup>
										</Form.Group>
									</Col>

									<Col md={6}>
										<Form.Group className="login-field" controlId="mysql-password">
											<Form.Label>Password</Form.Label>
											<InputGroup className="login-input-group">
												<InputGroup.Text>
													<KeyIcon className="u-icon" aria-hidden="true" />
												</InputGroup.Text>
												<Form.Control
													type="password"
													value={values.password}
													disabled={isSubmitting}
													autoComplete="current-password"
													onChange={(event) => onChange('password', event.target.value)}
												/>
											</InputGroup>
										</Form.Group>
									</Col>
								</Row>

								<p className="login-form__footnote mb-0">
									Credentials are stored for this app session only.
								</p>

								<Button
									type="submit"
									className="login-submit"
									disabled={isSubmitting}
									aria-busy={isSubmitting}
								>
									{isSubmitting ? 'Connecting...' : 'Connect to Database'}
								</Button>
							</Form>
						</section>
					</div>
				</Card.Body>
			</Card>
		</Container>
	)
}

export default LoginPageView
