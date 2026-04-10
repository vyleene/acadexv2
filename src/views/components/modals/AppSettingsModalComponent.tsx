import {
	ArrowRightOnRectangleIcon,
	CircleStackIcon,
	Cog6ToothIcon,
	MoonIcon,
	SunIcon,
} from '@heroicons/react/24/outline'
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
			<Modal.Dialog centered className="app-settings-modal">
				<Modal.Header className="settings-modal__header">
					<Modal.Title className="modal-title--main" id="appSettingsModalLabel">
						<Cog6ToothIcon className="u-icon" aria-hidden="true" />
						<span className="u-modal-title-text">Settings</span>
					</Modal.Title>
					<CloseButton data-bs-dismiss="modal" aria-label="Close" />
				</Modal.Header>
				<Modal.Body className="settings-modal__body">
					<Stack gap={3}>
						<section className="settings-panel">
							<div className="settings-panel__head">
								<h3 className="settings-panel__title mb-0">Theme</h3>
								<div className="settings-theme-legend">
									<span className={`settings-theme-pill${theme === 'dark' ? ' is-current' : ''}`}>
										<MoonIcon className="u-icon" aria-hidden="true" />
										Dark
									</span>
									<span className={`settings-theme-pill${theme === 'light' ? ' is-current' : ''}`}>
										<SunIcon className="u-icon" aria-hidden="true" />
										Light
									</span>
								</div>
							</div>

							<Form.Check
								type="switch"
								id="settings-theme-switch"
								className="settings-theme-switch"
								label={theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
								checked={theme === 'dark'}
								onChange={onToggleTheme}
							/>
						</section>

						<section className="settings-panel">
							<div className="settings-panel__head">
								<div className="settings-panel__title-wrap">
									<CircleStackIcon className="u-icon settings-panel__title-icon" aria-hidden="true" />
									<h3 className="settings-panel__title mb-0">MySQL Credentials</h3>
								</div>
							</div>

							<Row className="g-3">
								<Col md={8}>
									<Form.Group className="settings-field" controlId="settings-mysql-host">
										<Form.Label>Host</Form.Label>
										<Form.Control
											className="settings-readonly"
											readOnly
											value={credentials.host || 'Not set'}
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group className="settings-field" controlId="settings-mysql-port">
										<Form.Label>Port</Form.Label>
										<Form.Control
											className="settings-readonly"
											readOnly
											value={credentials.port || 'Not set'}
										/>
									</Form.Group>
								</Col>
								<Col md={12}>
									<Form.Group className="settings-field" controlId="settings-mysql-database">
										<Form.Label>Database</Form.Label>
										<Form.Control
											className="settings-readonly"
											readOnly
											value={credentials.database || 'Not set'}
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="settings-field" controlId="settings-mysql-username">
										<Form.Label>Username</Form.Label>
										<Form.Control className="settings-readonly" readOnly value={maskedUsername} />
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="settings-field" controlId="settings-mysql-password">
										<Form.Label>Password</Form.Label>
										<Form.Control className="settings-readonly" readOnly value={maskedPassword} />
									</Form.Group>
								</Col>
							</Row>
						</section>
					</Stack>
				</Modal.Body>
				<Modal.Footer className="justify-content-between settings-modal__footer">
					<Button variant="secondary" type="button" data-bs-dismiss="modal">
						Close
					</Button>
					<Button
						variant="danger"
						type="button"
						disabled={!isConnected || isDisconnecting}
						aria-busy={isDisconnecting}
						data-bs-dismiss="modal"
						onClick={onDisconnect}
					>
						<ArrowRightOnRectangleIcon className="u-icon me-1" aria-hidden="true" />
						{isDisconnecting ? 'Disconnecting...' : 'Disconnect MySQL'}
					</Button>
				</Modal.Footer>
			</Modal.Dialog>
		</div>
	)
}

export default AppSettingsModalComponent
