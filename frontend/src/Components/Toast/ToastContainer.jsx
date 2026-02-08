import Toast from './Toast'

const ToastContainer = ( { toasts, removeToast } ) => {
	if ( !toasts || toasts.length === 0 ) {
		return null
	}

	return (
		<div className="toast-container">
			{toasts.map( toast => (
				<Toast
					key={toast.id}
					id={toast.id}
					type={toast.type}
					message={toast.message}
					duration={toast.duration}
					icon={toast.icon}
					onRemove={removeToast}
				/>
			) )}
		</div>
	)
}

export default ToastContainer

