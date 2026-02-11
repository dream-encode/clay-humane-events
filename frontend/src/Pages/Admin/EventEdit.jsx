import { useCallback, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import API from '../../inc/api'
import CONFIG from '../../inc/config'
import Notes from '../../Components/Notes'
import RegistrationFormBuilder from '../../Components/RegistrationFormBuilder'
import ToggleSwitch from '../../Components/ToggleSwitch'
import { useToast } from '../../context/ToastContext'

const FRONTEND_URL = CONFIG.BASE_URL || ''

const quillModules = {
	toolbar: [
		[ { header: [ 1, 2, 3, false ] } ],
		[ 'bold', 'italic', 'underline', 'strike' ],
		[ { list: 'ordered' }, { list: 'bullet' } ],
		[ { align: [] } ],
		[ 'link' ],
		[ 'clean' ]
	]
}

const formatDateForInput = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toISOString().split( 'T' )[ 0 ]
}

const EventEdit = () => {
	const { eventId } = useParams()
	const navigate = useNavigate()
	const { showSuccess, showError } = useToast()

	const [ event, setEvent ] = useState( null )
	const [ loading, setLoading ] = useState( true )
	const [ isSaving, setIsSaving ] = useState( false )
	const [ eventName, setEventName ] = useState( '' )
	const [ eventDate, setEventDate ] = useState( '' )
	const [ eventDescription, setEventDescription ] = useState( '' )
	const [ registrationOpen, setRegistrationOpen ] = useState( false )
	const [ registrationFee, setRegistrationFee ] = useState( 0 )
	const [ uploadingLogo, setUploadingLogo ] = useState( false )
	const [ uploadingFlyer, setUploadingFlyer ] = useState( false )
	const [ uploadingWaiver, setUploadingWaiver ] = useState( false )

	const logoInputRef = useRef( null )
	const flyerInputRef = useRef( null )
	const waiverInputRef = useRef( null )

	const loadEvent = useCallback( async () => {
		setLoading( true )

		const response = await API.getEntityByID( 'event', eventId )

		if ( response?.error ) {
			showError( response.message || 'Failed to load event.' )
			navigate( '/admin/events' )
			return
		}

		setEvent( response )
		setEventName( response.eventName || '' )
		setEventDate( formatDateForInput( response.eventDate ) )
		setEventDescription( response.eventDescription || '' )
		setRegistrationOpen( !!response.registrationOpen )
		setRegistrationFee( response.registrationFee || 0 )
		setLoading( false )
	}, [ eventId, navigate, showError ] )

	useEffect( () => {
		loadEvent()
	}, [ loadEvent ] )

	const handleSave = async ( e ) => {
		e.preventDefault()
		setIsSaving( true )

		try {
			const response = await API.updateEntity( 'event', eventId, {
				eventName,
				eventDate,
				eventDescription,
				registrationFee
			} )

			if ( response?.error ) {
				showError( response.message || 'Failed to update event.' )
				return
			}

			setEvent( response )
			showSuccess( 'Event updated successfully.' )
		} catch ( error ) {
			showError( 'Failed to update event.' )
		} finally {
			setIsSaving( false )
		}
	}

	const handleLogoUpload = async ( e ) => {
		const file = e.target.files?.[ 0 ]
		if ( !file ) return
		setUploadingLogo( true )

		try {
			const result = await API.uploadEventLogo( eventId, file )
			if ( result?.error ) {
				showError( result.message || 'Failed to upload logo.' )
				return
			}
			setEvent( result )
			showSuccess( 'Logo uploaded successfully.' )
		} catch ( error ) {
			showError( 'Failed to upload logo.' )
		} finally {
			setUploadingLogo( false )
			e.target.value = ''
		}
	}

	const handleDeleteLogo = async () => {
		try {
			const result = await API.deleteEventLogo( eventId )
			if ( result?.error ) {
				showError( result.message || 'Failed to delete logo.' )
				return
			}
			setEvent( result )
			showSuccess( 'Logo removed.' )
		} catch ( error ) {
			showError( 'Failed to delete logo.' )
		}
	}

	const handleFlyerUpload = async ( e ) => {
		const file = e.target.files?.[ 0 ]
		if ( !file ) return
		setUploadingFlyer( true )

		try {
			const result = await API.uploadEventFlyer( eventId, file )
			if ( result?.error ) {
				showError( result.message || 'Failed to upload flyer.' )
				return
			}
			setEvent( result )
			showSuccess( 'Flyer uploaded successfully.' )
		} catch ( error ) {
			showError( 'Failed to upload flyer.' )
		} finally {
			setUploadingFlyer( false )
			e.target.value = ''
		}
	}

	const handleDeleteFlyer = async ( filePath ) => {
		try {
			const result = await API.deleteEventFlyer( eventId, filePath )
			if ( result?.error ) {
				showError( result.message || 'Failed to delete flyer.' )
				return
			}
			setEvent( result )
			showSuccess( 'Flyer removed.' )
		} catch ( error ) {
			showError( 'Failed to delete flyer.' )
		}
	}

	const handleWaiverUpload = async ( e ) => {
		const file = e.target.files?.[ 0 ]
		if ( !file ) return
		setUploadingWaiver( true )

		try {
			const result = await API.uploadEventWaiver( eventId, file )
			if ( result?.error ) {
				showError( result.message || 'Failed to upload waiver.' )
				return
			}
			setEvent( result )
			showSuccess( 'Waiver uploaded successfully.' )
		} catch ( error ) {
			showError( 'Failed to upload waiver.' )
		} finally {
			setUploadingWaiver( false )
			e.target.value = ''
		}
	}

	const handleDeleteWaiver = async ( filePath ) => {
		try {
			const result = await API.deleteEventWaiver( eventId, filePath )
			if ( result?.error ) {
				showError( result.message || 'Failed to delete waiver.' )
				return
			}
			setEvent( result )
			showSuccess( 'Waiver removed.' )
		} catch ( error ) {
			showError( 'Failed to delete waiver.' )
		}
	}

	const getFileName = ( filePath ) => {
		return filePath.split( '/' ).pop()
	}

	const handleToggleRegistration = async ( newValue ) => {
		const response = await API.updateEntity( 'event', eventId, { registrationOpen: newValue } )

		if ( response?.error ) {
			showError( response.message || 'Failed to update registration status.' )
			return
		}

		setEvent( response )
		setRegistrationOpen( newValue )
		showSuccess( `Registration ${ newValue ? 'opened' : 'closed' }.` )
	}

	const handleSaveRegFields = async ( eventId, data ) => {
		const response = await API.updateEntity( 'event', eventId, data )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'Registration configuration saved.' )
		loadEvent()
	}

	if ( loading ) {
		return (
			<section className="page event-edit">
				<div className="page-header">
					<h2>Edit Event</h2>
				</div>
				<div className="section">
					<p>Loading event...</p>
				</div>
			</section>
		)
	}

	if ( !event ) {
		return null
	}

	return (
		<section className="page event-edit">
			<div className="page-header">
				<h2>Edit Event</h2>
				<div className="page-header-actions">
					<Notes entityType="event" entityId={eventId} />
					<button className="btn btn-sm btn-ghost-grey btn-round" onClick={() => navigate( '/admin/events' )}>
						<FontAwesomeIcon icon="arrow-left" /> Back to Events
					</button>
				</div>
			</div>

			<div className="section">
				<form className="event-edit-form" onSubmit={handleSave}>
					<div className="event-edit-form-group">
						<label>Event Name</label>
						<input type="text" value={eventName} onChange={( e ) => setEventName( e.target.value )} required />
					</div>

					<div className="event-edit-form-group">
						<label>Event Date</label>
						<input type="date" value={eventDate} onChange={( e ) => setEventDate( e.target.value )} required />
					</div>

					<div className="event-edit-form-group">
						<label>Description</label>
						<div className="event-edit-wysiwyg">
							<ReactQuill theme="snow" value={eventDescription} onChange={setEventDescription} modules={quillModules} />
						</div>
					</div>

					<div className="event-edit-form-group">
						<label>Registration Fee</label>
						<div className="event-edit-currency-input">
							<span className="currency-symbol">$</span>
							<input type="number" value={registrationFee} onChange={( e ) => setRegistrationFee( parseFloat( e.target.value ) || 0 )} step="0.01" min="0" />
						</div>
					</div>

					<div className="event-edit-form-group event-edit-form-group-toggle">
						<label>Registration Open</label>
						<ToggleSwitch
							checked={registrationOpen}
							onChange={handleToggleRegistration}
						/>
					</div>

					{event.eventSlug && (
						<div className="event-edit-form-group">
							<label>Registration URL</label>
							<div className="event-edit-url-display">
								<input type="text" readOnly value={`${ FRONTEND_URL }/event/${ event.eventSlug }/register`} />
								<button type="button" className="btn btn-sm btn-ghost-blue btn-round" onClick={() => { navigator.clipboard.writeText( `${ FRONTEND_URL }/event/${ event.eventSlug }/register` ); showSuccess( 'URL copied to clipboard.' ) }}>
									<FontAwesomeIcon icon="copy" />
								</button>
							</div>
						</div>
					)}

					<div className="event-edit-form-actions">
						<button type="submit" disabled={isSaving}>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>

				<div className="event-edit-uploads">
					<div className="event-edit-upload-section">
						<h3>Event Logo</h3>
						<div className="upload-area">
							{event.eventLogo ? (
								<div className="upload-preview-single">
									<img src={`${ CONFIG.API_URL }${ event.eventLogo }`} alt="Event Logo" />
									<div className="upload-preview-actions">
										<button className="btn btn-xs btn-filled-blue btn-round" onClick={() => logoInputRef.current?.click()}>
											<FontAwesomeIcon icon="arrows-rotate" /> Replace
										</button>
										<button className="btn btn-xs btn-filled-red btn-round" onClick={handleDeleteLogo}>
											<FontAwesomeIcon icon="trash" /> Remove
										</button>
									</div>
								</div>
							) : (
								<div className="upload-placeholder" onClick={() => logoInputRef.current?.click()}>
									{uploadingLogo ? (
										<FontAwesomeIcon icon="spinner" spin />
									) : (
										<>
											<FontAwesomeIcon icon="image" />
											<span>Click to upload logo</span>
										</>
									)}
								</div>
							)}
							<input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogoUpload} hidden />
						</div>
					</div>

					<div className="event-edit-upload-section">
						<h3>Event Flyers</h3>
						<div className="upload-file-list">
							{( event.eventFlyers || [] ).map( ( flyer, index ) => (
								<div key={index} className="upload-file-item">
									{flyer.toLowerCase().endsWith( '.pdf' ) ? (
										<FontAwesomeIcon icon="file-pdf" className="file-icon" />
									) : (
										<img src={`${ CONFIG.API_URL }${ flyer }`} alt={`Flyer ${ index + 1 }`} />
									)}
									<a href={`${ CONFIG.API_URL }${ flyer }`} target="_blank" rel="noopener noreferrer" className="upload-file-name">{getFileName( flyer )}</a>
									<button className="btn btn-xs btn-filled-red btn-round" onClick={() => handleDeleteFlyer( flyer )}>
										<FontAwesomeIcon icon="trash" />
									</button>
								</div>
							) )}
						</div>
						<button className="btn btn-sm btn-filled-green btn-round upload-add-btn" onClick={() => flyerInputRef.current?.click()} disabled={uploadingFlyer}>
							{uploadingFlyer ? <FontAwesomeIcon icon="spinner" spin /> : <><FontAwesomeIcon icon="plus" /> Add Flyer</>}
						</button>
						<input ref={flyerInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" onChange={handleFlyerUpload} hidden />
					</div>

					<div className="event-edit-upload-section">
						<h3>Event Waivers</h3>
						<div className="upload-file-list">
							{( event.eventWaivers || [] ).map( ( waiver, index ) => (
								<div key={index} className="upload-file-item">
									<FontAwesomeIcon icon="file-pdf" className="file-icon" />
									<a href={`${ CONFIG.API_URL }${ waiver }`} target="_blank" rel="noopener noreferrer" className="upload-file-name">{getFileName( waiver )}</a>
									<button className="btn btn-xs btn-filled-red btn-round" onClick={() => handleDeleteWaiver( waiver )}>
										<FontAwesomeIcon icon="trash" />
									</button>
								</div>
							) )}
						</div>
						<button className="btn btn-sm btn-filled-green btn-round upload-add-btn" onClick={() => waiverInputRef.current?.click()} disabled={uploadingWaiver}>
							{uploadingWaiver ? <FontAwesomeIcon icon="spinner" spin /> : <><FontAwesomeIcon icon="plus" /> Add Waiver</>}
						</button>
						<input ref={waiverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" onChange={handleWaiverUpload} hidden />
					</div>
				</div>

				{event.eventSlug && (
					<div className="event-edit-qr-codes">
						<h3>QR Codes</h3>
						{event.eventPageQR && event.eventRegistrationQR ? (
							<div className="qr-codes-grid">
								<div className="qr-code-item">
									<label>Event Page</label>
									<img src={`${ CONFIG.API_URL }${ event.eventPageQR }`} alt="Event Page QR Code" />
									<a href={`${ CONFIG.API_URL }${ event.eventPageQR }`} download={`${ event.eventSlug }-event-page-qr.png`} className="btn btn-sm btn-ghost-blue btn-round">
										<FontAwesomeIcon icon="download" /> Download
									</a>
								</div>
								<div className="qr-code-item">
									<label>Registration Form</label>
									<img src={`${ CONFIG.API_URL }${ event.eventRegistrationQR }`} alt="Registration Form QR Code" />
									<a href={`${ CONFIG.API_URL }${ event.eventRegistrationQR }`} download={`${ event.eventSlug }-registration-qr.png`} className="btn btn-sm btn-ghost-blue btn-round">
										<FontAwesomeIcon icon="download" /> Download
									</a>
								</div>
							</div>
						) : (
							<p className="qr-codes-pending">QR codes will be generated when you save this event.</p>
						)}
					</div>
				)}

				<div className="event-edit-registration-config">
					<h3>Registration Configuration</h3>
					<RegistrationFormBuilder event={event} onSave={handleSaveRegFields} />
				</div>
			</div>


		</section>
	)
}

export default EventEdit

