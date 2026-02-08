import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { useToast } from '../../context/ToastContext'

const EmailTemplates = () => {
	const { showSuccess, showError } = useToast()

	const [ templateTypes, setTemplateTypes ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ editingType, setEditingType ] = useState( null )
	const [ editSubject, setEditSubject ] = useState( '' )
	const [ editBody, setEditBody ] = useState( '' )
	const [ editEventId, setEditEventId ] = useState( '' )
	const [ events, setEvents ] = useState( [] )
	const [ saving, setSaving ] = useState( false )
	const [ previewHtml, setPreviewHtml ] = useState( '' )
	const [ showPreview, setShowPreview ] = useState( false )

	const loadTemplateTypes = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEmailTemplateTypes()

			if ( Array.isArray( response ) ) {
				setTemplateTypes( response )
			}
		} catch ( error ) {
			showError( 'Failed to load email templates.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	const loadEvents = useCallback( async () => {
		try {
			const response = await API.getEntities( 'event', { all: true } )

			if ( Array.isArray( response ) ) {
				setEvents( response )
			}
		} catch ( error ) {
			// Silently fail.
		}
	}, [] )

	useEffect( () => {
		loadTemplateTypes()
		loadEvents()
	}, [ loadTemplateTypes, loadEvents ] )

	const handleEdit = async ( templateType ) => {
		setEditingType( templateType )
		setEditEventId( '' )
		setShowPreview( false )
		setPreviewHtml( '' )

		try {
			const resolved = await API.resolveEmailTemplate( templateType )

			if ( resolved && !resolved.error ) {
				setEditSubject( resolved.subject || '' )
				setEditBody( resolved.body || '' )
			} else {
				const typeData = templateTypes.find( ( t ) => t.templateType === templateType )
				setEditSubject( '' )
				setEditBody( '' )

				if ( typeData ) {
					setEditSubject( typeData.label ? `Default subject for ${typeData.label}` : '' )
				}
			}
		} catch ( error ) {
			showError( 'Failed to load template.' )
		}
	}

	const handleEventChange = async ( eventId ) => {
		setEditEventId( eventId )
		setShowPreview( false )

		try {
			const resolved = await API.resolveEmailTemplate( editingType, eventId || null )

			if ( resolved && !resolved.error ) {
				setEditSubject( resolved.subject || '' )
				setEditBody( resolved.body || '' )
			}
		} catch ( error ) {
			showError( 'Failed to load template.' )
		}
	}

	const handleSave = async () => {
		if ( !editSubject.trim() || !editBody.trim() ) {
			showError( 'Subject and body are required.' )
			return
		}

		setSaving( true )

		try {
			const typeData = templateTypes.find( ( t ) => t.templateType === editingType )
			const data = {
				templateType: editingType,
				eventId: editEventId || null,
				subject: editSubject,
				body: editBody,
				variables: typeData ? typeData.variables : []
			}

			const result = await API.saveEmailTemplate( data )

			if ( result && !result.error ) {
				showSuccess( 'Template saved successfully.' )
				loadTemplateTypes()
			} else {
				showError( result?.message || 'Failed to save template.' )
			}
		} catch ( error ) {
			showError( 'Failed to save template.' )
		} finally {
			setSaving( false )
		}
	}

	const handleReset = async () => {
		if ( !window.confirm( 'Reset this template to default? The custom template will be deactivated.' ) ) {
			return
		}

		try {
			const result = await API.resetEmailTemplate( editingType, editEventId || null )

			if ( result && !result.error ) {
				showSuccess( 'Template reset to default.' )
				handleEdit( editingType )
				loadTemplateTypes()
			} else {
				showError( 'Failed to reset template.' )
			}
		} catch ( error ) {
			showError( 'Failed to reset template.' )
		}
	}

	const handlePreview = async () => {
		try {
			const typeData = templateTypes.find( ( t ) => t.templateType === editingType )
			const sampleVars = {}

			if ( typeData && typeData.variables ) {
				typeData.variables.forEach( ( v ) => {
					sampleVars[ v ] = `[Sample ${v}]`
				} )
			}

			const result = await API.previewEmailTemplate( editSubject, editBody, sampleVars )

			if ( result && !result.error ) {
				setPreviewHtml( result.html || '' )
				setShowPreview( true )
			} else {
				showError( 'Failed to generate preview.' )
			}
		} catch ( error ) {
			showError( 'Failed to generate preview.' )
		}
	}

	const currentTypeData = editingType ? templateTypes.find( ( t ) => t.templateType === editingType ) : null

	return (
		<section className="page email-templates">
			<div className="page-header">
				<h2>Email Templates</h2>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading templates...</p>
				) : !editingType ? (
					<div className="email-templates-list">
						{templateTypes.map( ( tmpl ) => (
							<div key={tmpl.templateType} className="email-templates-card" onClick={() => handleEdit( tmpl.templateType )}>
								<div className="email-templates-card-header">
									<h3>{tmpl.label}</h3>
									{tmpl.hasCustomTemplate && (
										<span className="email-templates-badge email-templates-badge--custom">Customized</span>
									)}
									{!tmpl.hasCustomTemplate && (
										<span className="email-templates-badge email-templates-badge--default">Default</span>
									)}
								</div>
								<p className="email-templates-card-desc">{tmpl.description}</p>
								<div className="email-templates-card-vars">
									{tmpl.variables.map( ( v ) => (
										<code key={v}>{`{{${v}}}`}</code>
									) )}
								</div>
							</div>
						) )}
					</div>
				) : (
					<div className="email-templates-editor">
						<div className="email-templates-editor-header">
							<button className="btn btn-sm btn-ghost-blue btn-round" onClick={() => { setEditingType( null ); setShowPreview( false ) }}>
								<FontAwesomeIcon icon="arrow-left" /> Back
							</button>
							<h3>{currentTypeData?.label || editingType}</h3>
						</div>

						{currentTypeData?.description && (
							<p className="email-templates-editor-desc">{currentTypeData.description}</p>
						)}

						{events.length > 0 && (
							<div className="email-templates-field">
								<label>Event Override</label>
								<select value={editEventId} onChange={( e ) => handleEventChange( e.target.value )}>
									<option value="">Global (all events)</option>
									{events.map( ( evt ) => (
										<option key={evt._id} value={evt._id}>{evt.eventName}</option>
									) )}
								</select>
							</div>
						)}

						<div className="email-templates-field">
							<label>Subject</label>
							<input type="text" value={editSubject} onChange={( e ) => setEditSubject( e.target.value )} placeholder="Email subject line" />
						</div>

						<div className="email-templates-field">
							<label>Body (HTML)</label>
							<textarea value={editBody} onChange={( e ) => setEditBody( e.target.value )} rows={14} placeholder="Email body HTML with {{variable}} placeholders" />
						</div>

						{currentTypeData?.variables?.length > 0 && (
							<div className="email-templates-variables">
								<label>Available Variables:</label>
								<div className="email-templates-variable-list">
									{currentTypeData.variables.map( ( v ) => (
										<code key={v}>{`{{${v}}}`}</code>
									) )}
								</div>
							</div>
						)}

						<div className="email-templates-actions">
							<button className="btn btn-sm btn-green btn-round" disabled={saving} onClick={handleSave}>
								<FontAwesomeIcon icon="save" /> {saving ? 'Saving...' : 'Save Template'}
							</button>
							<button className="btn btn-sm btn-ghost-blue btn-round" onClick={handlePreview}>
								<FontAwesomeIcon icon="eye" /> Preview
							</button>
							<button className="btn btn-sm btn-ghost-red btn-round" onClick={handleReset}>
								<FontAwesomeIcon icon="undo" /> Reset to Default
							</button>
						</div>

						{showPreview && previewHtml && (
							<div className="email-templates-preview">
								<h4>Preview</h4>
								<div className="email-templates-preview-frame" dangerouslySetInnerHTML={{ __html: previewHtml }} />
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	)
}

export default EmailTemplates

