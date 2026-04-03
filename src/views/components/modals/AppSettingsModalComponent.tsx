import { ArrowRightOnRectangleIcon, Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Button, CloseButton, Col, Form, Modal, Row, Stack } from 'react-bootstrap'
import type { LoginFormValues, ThemeMode } from '../../../models/AppModel'

type AppSettingsModalProps = {
	theme: ThemeMode
	credentials: LoginFormValues
	isConnected: boolean
	isDisconnecting: boolean
	onToggleTheme: () => void
	onDisconnect: () => void
}

const maskValue = (value: string, showLast: boolean) => {
	const trimmed = value.trim()

	if (!trimmed) {
		return 'Not set'
	}

	if (trimmed.length === 1) {
		return `${trimmed[0]}***`
	}

	if (showLast) {
		const stars = '*'.repeat(Math.max(3, trimmed.length - 2))
		return `${trimmed[0]}${stars}${trimmed[trimmed.length - 1]}`
	}

	const stars = '*'.repeat(Math.max(3, trimmed.length - 1))
	return `${trimmed[0]}${stars}`
}

function AppSettingsModalComponent({
	theme,
	credentials,
	isConnected,
	isDisconnecting,
	onToggleTheme,
	onDisconnect,
}: AppSettingsModalProps) {
	const maskedUsername = maskValue(credentials.username, false)
	const maskedPassword = maskValue(credentials.password, true)

	return (
		<div
			className="modal fade"
			id="appSettingsModal"
			tabIndex={-1}
			aria-labelledby="appSettingsModalLabel"
			aria-hidden="true"
		>
			<Modal.Dialog centered>
				<Modal.Header>
					<Modal.Title className="d-flex align-items-center gap-2" id="appSettingsModalLabel">
						<Cog6ToothIcon className="heroicon-url" aria-hidden="true" />
						App Settings
					</Modal.Title>
					<CloseButton data-bs-dismiss="modal" aria-label="Close" />
				</Modal.Header>
				<Modal.Body>
					<Stack gap={3}>
						<section>
							<Form.Label className="mb-2">Theme</Form.Label>
							<Form.Check
								type="switch"
								id="settings-theme-switch"
								label={theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
								checked={theme === 'dark'}
								onChange={onToggleTheme}
							/>
							<div className="d-flex align-items-center gap-2 mt-2 text-muted">
								<MoonIcon className="heroicon-url" aria-hidden="true" />
								<span>Dark</span>
								<SunIcon className="heroicon-url" aria-hidden="true" />
								<span>Light</span>
							</div>
						</section>

						<section>
							<Form.Label className="mb-2">MySQL Credentials</Form.Label>
							<Row className="g-3">
								<Col md={8}>
									<Form.Group controlId="settings-mysql-host">
										<Form.Label>Host</Form.Label>
										<Form.Control readOnly value={credentials.host || 'Not set'} />
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="settings-mysql-port">
										<Form.Label>Port</Form.Label>
										<Form.Control readOnly value={credentials.port || 'Not set'} />
									</Form.Group>
								</Col>
								<Col md={12}>
									<Form.Group controlId="settings-mysql-database">
										<Form.Label>Database</Form.Label>
										<Form.Control readOnly value={credentials.database || 'Not set'} />
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group controlId="settings-mysql-username">
										<Form.Label>Username</Form.Label>
										<Form.Control readOnly value={maskedUsername} />
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group controlId="settings-mysql-password">
										<Form.Label>Password</Form.Label>
										<Form.Control readOnly value={maskedPassword} />
									</Form.Group>
								</Col>
							</Row>
						</section>
					</Stack>
				</Modal.Body>
				<Modal.Footer className="justify-content-between">
					<Button variant="outline-secondary" type="button" data-bs-dismiss="modal">
						Close
					</Button>
					<Button
						variant="outline-danger"
						type="button"
						disabled={!isConnected || isDisconnecting}
						aria-busy={isDisconnecting}
						data-bs-dismiss="modal"
						onClick={onDisconnect}
					>
						<ArrowRightOnRectangleIcon className="heroicon-url me-1" aria-hidden="true" />
						{isDisconnecting ? 'Disconnecting...' : 'Disconnect MySQL'}
					</Button>
				</Modal.Footer>
			</Modal.Dialog>
		</div>
	)
}

export default AppSettingsModalComponent
