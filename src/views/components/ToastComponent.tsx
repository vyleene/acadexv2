import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid'
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

function ToastComponent({ toasts, onDismissToast }: ToastComponentProps) {
	return (
		<ToastContainer className="toast-container" aria-live="polite" aria-atomic="true">
			{toasts.map((toast) => {
				const Icon = TYPE_ICONS[toast.type]
				const title = toast.title || TYPE_LABELS[toast.type]

				return (
					<Toast
						key={toast.id}
						className={`app-toast app-toast--${toast.type}`}
						onClose={() => onDismissToast(toast.id)}
						autohide
						delay={toast.duration ?? DEFAULT_TOAST_DURATION}
					>
						<Toast.Header closeButton>
							<Icon className="heroicon-url app-toast__icon" aria-hidden="true" />
							<strong className="me-auto">{title}</strong>
						</Toast.Header>
						<Toast.Body>{toast.message}</Toast.Body>
					</Toast>
				)
			})}
		</ToastContainer>
	)
}

export default ToastComponent
