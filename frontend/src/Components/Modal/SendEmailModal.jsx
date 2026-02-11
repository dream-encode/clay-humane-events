import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { useToast } from '../../context/ToastContext'
import Modal from './Modal'

const EMAIL_TYPES = [
	{ value: 'notification', label: 'Notification' },
	{ value: 'marketing', label: 'Marketing' },
	{ value: 'system', label: 'System' },
]

const defaultFormState = {
	to: '',
	subject: '',
	body: '',
	emailType: '',
	bodyType: 'html',
}

const SendEmailModal = ( { isOpen, onClose, onSuccess } ) => {
	const { showSuccess, showError } = useToast()

	const [ formState, setFormState ] = useState( { ...defaultFormState } )
	const [ sending, setSending ] = useState( false )

	useEffect( () => {
		if ( isOpen ) {
			setFormState( { ...defaultFormState } )
		}
	}, [ isOpen ] )

	const handleFieldChange = ( e ) => {
		const { name, value } = e.target

		setFormState( ( prev ) => ( {
			...prev,
			[ name ]: value,
		} ) )
	}

	const handleSubmit = async () => {
		if ( !formState.to || !formState.subject || !formState.body || !formState.emailType ) {
			showError( 'Please fill in all required fields.' )
			return
		}

		setSending( true )

		try {
			const result = await API.sendEmail( formState )

			if ( result?.error ) {
				showError( result.message || 'Failed to send email.' )
				return
			}

			showSuccess( 'Email sent successfully.' )
			onClose()

			if ( onSuccess ) {
				onSuccess()
			}
		} catch {
			showError( 'Failed to send email.' )
		} finally {
			setSending( false )
		}
	}

	const handleCancel = () => {
		setFormState( { ...defaultFormState } )
		onClose()
	}

	return (
		<Modal isOpen={isOpen} onClose={handleCancel} title="Send Email" size="lg">
			<div className="send-email-form">
				<div className="send-email-form-fields">
					<div className="send-email-form-row">
						<label className="send-email-form-label required" htmlFor="to">To</label>
						<div className="send-email-form-field">
							<input type="email" id="to" name="to" value={formState.to} onChange={handleFieldChange} disabled={sending} placeholder="recipient@example.com" />
						</div>
					</div>

					<div className="send-email-form-row">
						<label className="send-email-form-label required" htmlFor="emailType">Type</label>
						<div className="send-email-form-field">
							<select id="emailType" name="emailType" value={formState.emailType} onChange={handleFieldChange} disabled={sending}>
								<option value="">Select type...</option>
								{EMAIL_TYPES.map( ( type ) => (
									<option key={type.value} value={type.value}>{type.label}</option>
								) )}
							</select>
						</div>
					</div>

					<div className="send-email-form-row">
						<label className="send-email-form-label required" htmlFor="subject">Subject</label>
						<div className="send-email-form-field">
							<input type="text" id="subject" name="subject" value={formState.subject} onChange={handleFieldChange} disabled={sending} placeholder="Email subject" />
						</div>
					</div>

					<div className="send-email-form-row">
						<label className="send-email-form-label" htmlFor="bodyType">Format</label>
						<div className="send-email-form-field">
							<select id="bodyType" name="bodyType" value={formState.bodyType} onChange={handleFieldChange} disabled={sending}>
								<option value="html">HTML</option>
								<option value="text">Plain Text</option>
							</select>
						</div>
					</div>

					<div className="send-email-form-row">
						<label className="send-email-form-label required" htmlFor="body">Body</label>
						<div className="send-email-form-field">
							<textarea id="body" name="body" value={formState.body} onChange={handleFieldChange} disabled={sending} rows={10} placeholder="Email body content..." />
						</div>
					</div>
				</div>
			</div>
			<div className="modal-footer">
				<div className="modal-actions">
					<button className="btn btn-md btn-ghost-grey btn-round" onClick={handleCancel} disabled={sending}>
						Cancel
					</button>
					<button className="btn btn-md btn-filled-green btn-round" onClick={handleSubmit} disabled={sending}>
						{sending ? 'Sending...' : <><FontAwesomeIcon icon="paper-plane" /> Send Email</>}
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default SendEmailModal

