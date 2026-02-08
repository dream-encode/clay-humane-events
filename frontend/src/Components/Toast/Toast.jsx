import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'

const Toast = ( { id, type, message, duration = 4000, onRemove, icon } ) => {
	const [ isVisible, setIsVisible ] = useState( false )
	const [ isRemoving, setIsRemoving ] = useState( false )

	useEffect( () => {
		const showTimer = setTimeout( () => setIsVisible( true ), 10 )

		const removeTimer = setTimeout( () => {
			handleRemove()
		}, duration )

		return () => {
			clearTimeout( showTimer )
			clearTimeout( removeTimer )
		}
	}, [ duration ] )

	const handleRemove = () => {
		setIsRemoving( true )

		setTimeout( () => {
			onRemove( id )
		}, 300 )
	}

	const getIcon = () => {
		if ( icon ) {
			return icon
		}

		switch ( type ) {
			case 'success':
				return 'check-circle'
			case 'error':
				return 'exclamation-circle'
			case 'warning':
				return 'exclamation-triangle'
			case 'info':
			default:
				return 'info-circle'
		}
	}

	return (
		<div
			className={`toast toast-${ type } ${ isVisible ? 'toast-visible' : '' } ${ isRemoving ? 'toast-removing' : '' }`}
			onClick={handleRemove}
		>
			<div className="toast-icon">
				<FontAwesomeIcon icon={getIcon()} />
			</div>
			<div className="toast-message">
				{message}
			</div>
			<button className="toast-close" onClick={handleRemove}>
				<FontAwesomeIcon icon="times" />
			</button>
		</div>
	)
}

export default Toast

