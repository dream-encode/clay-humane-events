import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from 'react'

const Modal = ( { isOpen, onClose, title, children, size = 'md' } ) => {
	const mouseDownTargetRef = useRef( null )

	useEffect( () => {
		if ( isOpen ) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [ isOpen ] )

	useEffect( () => {
		const handleEscape = ( e ) => {
			if ( e.key === 'Escape' && isOpen ) {
				onClose()
			}
		}

		document.addEventListener( 'keydown', handleEscape )
		return () => document.removeEventListener( 'keydown', handleEscape )
	}, [ isOpen, onClose ] )

	if ( !isOpen ) return null

	const handleMouseDown = ( e ) => {
		mouseDownTargetRef.current = e.target
	}

	const handleMouseUp = ( e ) => {
		if ( e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget ) {
			onClose()
		}
		mouseDownTargetRef.current = null
	}

	return (
		<div
			className="modal-overlay"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
		>
			<div className={`modal-content modal-${ size }`}>
				<div className="modal-header">
					<h2 className="modal-title">{title}</h2>
					<button className="modal-close" onClick={onClose}>
						<FontAwesomeIcon icon="times" />
					</button>
				</div>
				<div className="modal-body">
					{children}
				</div>
			</div>
		</div>
	)
}

export default Modal

