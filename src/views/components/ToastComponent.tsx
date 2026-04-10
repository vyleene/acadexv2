import type { CSSProperties } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Toast, ToastContainer } from 'react-bootstrap'
import type { ToastItem, ToastType } from '../../models/AppModel'

type ToastComponentProps = {
	toasts: ToastItem[]
	onDismissToast: (id: string) => void
}

const DEFAULT_TOAST_DURATION = 4000

const TYPE_LABELS: Record<ToastType, string> = {
	success: 'Success',
	warning: 'Warning',
	error: 'Error',
}

const TYPE_ICONS: Record<ToastType, typeof CheckCircleIcon> = {
	success: CheckCircleIcon,
	warning: ExclamationTriangleIcon,
	error: XCircleIcon,
}

const TYPE_VARIANTS: Record<ToastType, string> = {
	success: 'success',
	warning: 'warning',
	error: 'danger',
}

function ToastComponent({ toasts, onDismissToast }: ToastComponentProps) {
	return (
		<ToastContainer className="toast-container" aria-live="polite" aria-atomic="true">
			{toasts.map((toast) => {
				const Icon = TYPE_ICONS[toast.type]
				const duration = toast.duration ?? DEFAULT_TOAST_DURATION
				const progressStyle: CSSProperties = {
					animationDuration: `${duration}ms`,
				}
				const variant = TYPE_VARIANTS[toast.type]
				const displayMessage = toast.message || TYPE_LABELS[toast.type]

				return (
					<Toast
						key={toast.id}
						onClose={() => onDismissToast(toast.id)}
						animation
						autohide
						delay={duration}
						className={`align-items-center text-bg-${variant} border-0`}
						role="alert"
						aria-live="assertive"
						aria-atomic="true"
					>
						<Toast.Body className="p-0">
							<div className="toast-content d-flex align-items-center gap-2">
								<Icon className="toast-icon" aria-hidden="true" />
								<span className="toast-message">{displayMessage}</span>
								<button
									type="button"
									className="btn-close btn-close-white ms-auto me-2"
									aria-label="Close"
									onClick={() => onDismissToast(toast.id)}
								></button>
							</div>
							<div className="toast-progress progress" role="presentation" aria-hidden="true">
								<div
									className="progress-bar toast-progress__bar"
									role="progressbar"
									style={progressStyle}
								></div>
							</div>
						</Toast.Body>
					</Toast>
				)
			})}
		</ToastContainer>
	)
}

export default ToastComponent
