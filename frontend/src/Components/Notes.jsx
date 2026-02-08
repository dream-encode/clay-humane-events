import { useCallback, useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../inc/api'
import Modal from './Modal/Modal'
import { useToast } from '../context/ToastContext'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

/**
 * Notes drawer component with unread badge and per-user read tracking.
 *
 * @since [NEXT_VERSION]
 *
 * @param {Object} props
 * @param {string} props.entityType The entity type.
 * @param {string} props.entityId   The entity ID.
 */
const Notes = ( { entityType, entityId } ) => {
	const { showSuccess, showError } = useToast()
	const [ notes, setNotes ] = useState( [] )
	const [ loading, setLoading ] = useState( false )
	const [ unreadCount, setUnreadCount ] = useState( 0 )
	const [ isDrawerOpen, setIsDrawerOpen ] = useState( false )
	const [ isAddModalOpen, setIsAddModalOpen ] = useState( false )
	const [ noteText, setNoteText ] = useState( '' )
	const [ submitting, setSubmitting ] = useState( false )
	const drawerRef = useRef( null )

	const loadUnreadCount = useCallback( async () => {
		if ( !entityType || !entityId ) return

		const response = await API.getUnreadNotesCount( entityType, entityId )

		if ( response?.count !== undefined ) {
			setUnreadCount( response.count )
		}
	}, [ entityType, entityId ] )

	useEffect( () => {
		loadUnreadCount()
	}, [ loadUnreadCount ] )

	const loadNotes = useCallback( async () => {
		if ( !entityType || !entityId ) return

		setLoading( true )

		const response = await API.getNotesByEntity( entityType, entityId )

		if ( Array.isArray( response ) ) {
			setNotes( response )

			const unreadIds = response.filter( ( n ) => !n.isRead ).map( ( n ) => n._id )

			if ( unreadIds.length > 0 ) {
				await API.markNotesAsRead( unreadIds )
				setUnreadCount( 0 )
			}
		}

		setLoading( false )
	}, [ entityType, entityId ] )

	const handleOpenDrawer = () => {
		setIsDrawerOpen( true )
		loadNotes()
	}

	const handleCloseDrawer = () => {
		setIsDrawerOpen( false )
	}

	useEffect( () => {
		const handleEscape = ( e ) => {
			if ( e.key === 'Escape' && isDrawerOpen ) {
				handleCloseDrawer()
			}
		}

		document.addEventListener( 'keydown', handleEscape )
		return () => document.removeEventListener( 'keydown', handleEscape )
	}, [ isDrawerOpen ] )

	const handleAddNote = async () => {
		if ( !noteText.trim() ) return

		setSubmitting( true )

		try {
			const response = await API.insertEntity( 'note', {
				entityType,
				entityId,
				note: noteText.trim()
			} )

			if ( response?.error ) {
				showError( response.message || 'Failed to add note.' )
				return
			}

			showSuccess( 'Note added.' )
			setNoteText( '' )
			setIsAddModalOpen( false )
			loadNotes()
		} catch {
			showError( 'Failed to add note.' )
		} finally {
			setSubmitting( false )
		}
	}

	const getAuthorName = ( note ) => {
		if ( !note.createdBy ) return 'System'

		return `${ note.createdBy.firstName } ${ note.createdBy.lastName }`
	}

	return (
		<>
			<button className="btn btn-sm btn-ghost-grey btn-round notes-trigger" onClick={handleOpenDrawer}>
				<FontAwesomeIcon icon="sticky-note" /> Notes
				{ unreadCount > 0 && <span className="notes-badge">{unreadCount}</span> }
			</button>

			{ isDrawerOpen && (
				<>
					<div className="notes-drawer-overlay" onClick={handleCloseDrawer} />
					<div className={`notes-drawer ${ isDrawerOpen ? 'open' : '' }`} ref={drawerRef}>
						<div className="notes-drawer-header">
							<h3><FontAwesomeIcon icon="sticky-note" /> Notes</h3>
							<div className="notes-drawer-header-actions">
								<button className="btn btn-sm btn-filled-green btn-round" onClick={() => setIsAddModalOpen( true )}>
									<FontAwesomeIcon icon="plus" /> Add Note
								</button>
								<button className="notes-drawer-close" onClick={handleCloseDrawer}>
									<FontAwesomeIcon icon="times" />
								</button>
							</div>
						</div>
						<div className="notes-drawer-body">
							{ loading ? (
								<p className="notes-empty">Loading notes...</p>
							) : notes.length === 0 ? (
								<p className="notes-empty">No notes yet.</p>
							) : (
								notes.map( ( note ) => (
									<div className={`note-item${ !note.isRead ? ' unread' : '' }`} key={note._id}>
										<div className="note-item-header">
											<span className="note-item-author">{getAuthorName( note )}</span>
											<span className="note-item-date">{formatDate( note.createdAt )}</span>
										</div>
										<div className="note-item-body">{note.note}</div>
									</div>
								) )
							) }
						</div>
					</div>
				</>
			) }

			<Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen( false )} title="Add Note" size="md">
				<div className="notes-add-form">
					<textarea
						value={noteText}
						onChange={( e ) => setNoteText( e.target.value )}
						placeholder="Write your note..."
						rows={5}
						autoFocus
					/>
				</div>
				<div className="modal-footer">
					<div className="modal-actions">
						<button className="btn btn-md btn-ghost-grey btn-round" onClick={() => setIsAddModalOpen( false )} disabled={submitting}>Cancel</button>
						<button className="btn btn-md btn-filled-green btn-round" onClick={handleAddNote} disabled={submitting || !noteText.trim()}>
							{submitting ? 'Adding...' : 'Add Note'}
						</button>
					</div>
				</div>
			</Modal>
		</>
	)
}

export default Notes

