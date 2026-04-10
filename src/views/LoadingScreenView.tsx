type LoadingScreenViewProps = {
	isVisible: boolean
	status: string
}

function LoadingScreenView({ isVisible, status }: LoadingScreenViewProps) {
	const containerClassName = isVisible ? '' : 'hide'

	return (
		<div id="splash-screen" className={containerClassName} aria-hidden={!isVisible}>
			<div className="loading-screen__content">
				<div className="loading-screen__title" aria-label="Acadex">
					<span className="loading-screen__icon" aria-hidden="true" />
					<span className="loading-screen__title-text" aria-hidden="true">
						cadex
					</span>
				</div>
				<div className="loading-screen__bar" aria-hidden="true">
					<span className="loading-screen__bar-fill" />
				</div>
				<div className="loading-screen__status" role="status" aria-live="polite">
					{status}
				</div>
			</div>
		</div>
	)
}

export default LoadingScreenView
