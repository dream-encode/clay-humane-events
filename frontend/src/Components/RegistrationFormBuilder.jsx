import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const FIELD_TYPES = [
	{ value: 'text', label: 'Text' },
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Phone' },
	{ value: 'number', label: 'Number' },
	{ value: 'date', label: 'Date' },
	{ value: 'select', label: 'Dropdown' },
	{ value: 'checkbox', label: 'Checkbox' },
	{ value: 'textarea', label: 'Text Area' },
	{ value: 'radio', label: 'Radio Buttons' },
]

const TYPES_WITH_OPTIONS = ['select', 'radio']

const emptyField = () => ( {
	name: '',
	label: '',
	type: 'text',
	required: false,
	placeholder: '',
	options: [],
	sortOrder: 0,
} )

const generateFieldName = ( label ) => {
	return label
		.toLowerCase()
		.replace( /[^a-z0-9\s]/g, '' )
		.replace( /\s+/g, '_' )
		.replace( /^_+|_+$/g, '' )
}

/**
 * Inline registration form builder with config on the left and preview on the right.
 *
 * @since [NEXT_VERSION]
 *
 * @param {Object}   props
 * @param {Object}   props.event  The event object.
 * @param {Function} props.onSave Callback to save field config.
 */
const RegistrationFormBuilder = ( { event, onSave } ) => {
	const [ fields, setFields ] = useState( [] )
	const [ editingField, setEditingField ] = useState( null )
	const [ editingIndex, setEditingIndex ] = useState( -1 )
	const [ saving, setSaving ] = useState( false )
	const [ previewState, setPreviewState ] = useState( {} )

	useEffect( () => {
		if ( event ) {
			const sorted = [ ...( event.registrationFields || [] ) ].sort( ( a, b ) => a.sortOrder - b.sortOrder )
			setFields( sorted )
			setEditingField( null )
			setEditingIndex( -1 )
		}
	}, [ event ] )

	const resetPreview = useCallback( ( currentFields ) => {
		const defaults = {}
		currentFields.forEach( ( field ) => {
			defaults[ field.name ] = field.type === 'checkbox' ? false : ''
		} )
		setPreviewState( { firstName: '', lastName: '', email: '', ...defaults } )
	}, [] )

	useEffect( () => {
		resetPreview( fields )
	}, [ fields, resetPreview ] )

	const handleAddField = () => {
		const newField = emptyField()
		newField.sortOrder = fields.length
		setEditingField( newField )
		setEditingIndex( -1 )
	}

	const handleEditField = ( field, index ) => {
		setEditingField( { ...field, options: [ ...( field.options || [] ) ] } )
		setEditingIndex( index )
	}

	const handleDeleteField = ( index ) => {
		const updated = fields.filter( ( _, i ) => i !== index ).map( ( f, i ) => ( { ...f, sortOrder: i } ) )
		setFields( updated )
	}

	const handleMoveField = ( index, direction ) => {
		const newIndex = index + direction
		if ( newIndex < 0 || newIndex >= fields.length ) return

		const updated = [ ...fields ]
		const temp = updated[ index ]
		updated[ index ] = updated[ newIndex ]
		updated[ newIndex ] = temp
		setFields( updated.map( ( f, i ) => ( { ...f, sortOrder: i } ) ) )
	}

	const handleFieldFormChange = ( key, value ) => {
		setEditingField( ( prev ) => ( { ...prev, [ key ]: value } ) )
	}

	const handleLabelChange = ( value ) => {
		setEditingField( ( prev ) => ( {
			...prev,
			label: value,
			name: editingIndex === -1 ? generateFieldName( value ) : prev.name,
		} ) )
	}

	const handleAddOption = () => {
		setEditingField( ( prev ) => ( {
			...prev,
			options: [ ...prev.options, { value: '', label: '' } ],
		} ) )
	}

	const handleOptionChange = ( optIndex, key, value ) => {
		setEditingField( ( prev ) => {
			const options = [ ...prev.options ]
			options[ optIndex ] = { ...options[ optIndex ], [ key ]: value }
			return { ...prev, options }
		} )
	}

	const handleRemoveOption = ( optIndex ) => {
		setEditingField( ( prev ) => ( {
			...prev,
			options: prev.options.filter( ( _, i ) => i !== optIndex ),
		} ) )
	}

	const handleSaveField = () => {
		if ( !editingField.label || !editingField.name ) return

		const updated = [ ...fields ]

		if ( editingIndex >= 0 ) {
			updated[ editingIndex ] = { ...editingField }
		} else {
			updated.push( { ...editingField, sortOrder: updated.length } )
		}

		setFields( updated )
		setEditingField( null )
		setEditingIndex( -1 )
	}

	const handleCancelFieldEdit = () => {
		setEditingField( null )
		setEditingIndex( -1 )
	}

	const handleSave = async () => {
		setSaving( true )

		try {
			await onSave( event._id, { registrationFields: fields } )
		} catch {
		} finally {
			setSaving( false )
		}
	}

	const handlePreviewChange = ( e ) => {
		const { name, value, type, checked } = e.target
		setPreviewState( ( prev ) => ( {
			...prev,
			[ name ]: type === 'checkbox' ? checked : value,
		} ) )
	}

	const renderPreviewField = ( field ) => {
		const commonProps = {
			id: `preview-${ field.name }`,
			name: field.name,
			value: previewState[ field.name ] || '',
			onChange: handlePreviewChange,
			placeholder: field.placeholder || '',
			required: field.required,
		}

		switch ( field.type ) {
			case 'text':
			case 'email':
			case 'date':
				return <input type={field.type} {...commonProps} />
			case 'phone':
				return <input type="tel" {...commonProps} />
			case 'number':
				return <input type="number" {...commonProps} />
			case 'textarea':
				return <textarea {...commonProps} rows={4} />
			case 'checkbox':
				return (
					<label className="reg-form-checkbox">
						<input type="checkbox" id={`preview-${ field.name }`} name={field.name} checked={!!previewState[ field.name ]} onChange={handlePreviewChange} />
						<span>{field.label}</span>
					</label>
				)
			case 'select':
				return (
					<select {...commonProps}>
						<option value="">{field.placeholder || 'Select...'}</option>
						{ ( field.options || [] ).map( ( opt ) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						) ) }
					</select>
				)
			case 'radio':
				return (
					<div className="reg-form-radio-group">
						{ ( field.options || [] ).map( ( opt ) => (
							<label className="reg-form-radio" key={opt.value}>
								<input type="radio" name={`preview-${ field.name }`} value={opt.value} checked={previewState[ field.name ] === opt.value} onChange={( e ) => setPreviewState( ( prev ) => ( { ...prev, [ field.name ]: e.target.value } ) )} />
								<span>{opt.label}</span>
							</label>
						) ) }
					</div>
				)
			default:
				return <input type="text" {...commonProps} />
		}
	}

	const renderFieldList = () => (
		<div className="reg-fields-list">
			{ fields.length === 0 ? (
				<p className="reg-fields-empty">No registration fields configured. Add fields to build the registration form.</p>
			) : (
				fields.map( ( field, index ) => (
					<div className="reg-field-item" key={field._id || index}>
						<div className="reg-field-item-info">
							<span className="reg-field-type-badge">{FIELD_TYPES.find( ( t ) => t.value === field.type )?.label || field.type}</span>
							<span className="reg-field-label">{field.label}</span>
							{ field.required && <span className="reg-field-required">Required</span> }
						</div>
						<div className="reg-field-item-actions">
							<button className="btn btn-xs btn-ghost-grey btn-round" onClick={() => handleMoveField( index, -1 )} disabled={index === 0}>
								<FontAwesomeIcon icon="arrow-up" />
							</button>
							<button className="btn btn-xs btn-ghost-grey btn-round" onClick={() => handleMoveField( index, 1 )} disabled={index === fields.length - 1}>
								<FontAwesomeIcon icon="arrow-down" />
							</button>
							<button className="btn btn-xs btn-filled-blue btn-round" onClick={() => handleEditField( field, index )}>
								<FontAwesomeIcon icon="edit" />
							</button>
							<button className="btn btn-xs btn-filled-red btn-round" onClick={() => handleDeleteField( index )}>
								<FontAwesomeIcon icon="trash" />
							</button>
						</div>
					</div>
				) )
			) }
		</div>
	)

	const renderFieldEditor = () => (
		<div className="reg-field-editor">
			<h3 className="reg-field-editor-title">{editingIndex >= 0 ? 'Edit Field' : 'Add Field'}</h3>
			<div className="reg-field-editor-form">
				<div className="reg-field-editor-row">
					<label>Type</label>
					<select value={editingField.type} onChange={( e ) => handleFieldFormChange( 'type', e.target.value )}>
						{ FIELD_TYPES.map( ( t ) => (
							<option key={t.value} value={t.value}>{t.label}</option>
						) ) }
					</select>
				</div>
				<div className="reg-field-editor-row">
					<label>Label</label>
					<input type="text" value={editingField.label} onChange={( e ) => handleLabelChange( e.target.value )} placeholder="Field label" />
				</div>
				<div className="reg-field-editor-row">
					<label>Field Name</label>
					<input type="text" value={editingField.name} onChange={( e ) => handleFieldFormChange( 'name', e.target.value )} placeholder="field_name" />
				</div>
				<div className="reg-field-editor-row">
					<label>Placeholder</label>
					<input type="text" value={editingField.placeholder} onChange={( e ) => handleFieldFormChange( 'placeholder', e.target.value )} placeholder="Placeholder text" />
				</div>
				<div className="reg-field-editor-row reg-field-editor-row-checkbox">
					<label>
						<input type="checkbox" checked={editingField.required} onChange={( e ) => handleFieldFormChange( 'required', e.target.checked )} />
						<span>Required</span>
					</label>
				</div>
				{ TYPES_WITH_OPTIONS.includes( editingField.type ) && (
					<div className="reg-field-editor-options">
						<label>Options</label>
						{ editingField.options.map( ( opt, optIndex ) => (
							<div className="reg-field-option-row" key={optIndex}>
								<input type="text" value={opt.value} onChange={( e ) => handleOptionChange( optIndex, 'value', e.target.value )} placeholder="Value" />
								<input type="text" value={opt.label} onChange={( e ) => handleOptionChange( optIndex, 'label', e.target.value )} placeholder="Label" />
								<button className="btn btn-xs btn-ghost-grey btn-round" onClick={() => handleRemoveOption( optIndex )}>
									<FontAwesomeIcon icon="times" />
								</button>
							</div>
						) ) }
						<button className="btn btn-sm btn-ghost-blue btn-round" onClick={handleAddOption}>
							<FontAwesomeIcon icon="plus" /> Add Option
						</button>
					</div>
				) }
			</div>
			<div className="reg-field-editor-actions">
				<button className="btn btn-sm btn-ghost-grey btn-round" onClick={handleCancelFieldEdit}>Cancel</button>
				<button className="btn btn-sm btn-filled-green btn-round" onClick={handleSaveField} disabled={!editingField.label || !editingField.name}>
					{ editingIndex >= 0 ? 'Update Field' : 'Add Field' }
				</button>
			</div>
		</div>
	)

	const sortedPreviewFields = [ ...fields ].sort( ( a, b ) => a.sortOrder - b.sortOrder )

	return (
		<div className="registration-form-builder">
			<div className="registration-form-builder-config">
				<h3>Field Configuration</h3>
				<div className="reg-fields-config">
					{ editingField ? renderFieldEditor() : (
						<>
							{ renderFieldList() }
							<div className="reg-fields-add">
								<button className="btn btn-sm btn-filled-blue btn-round" onClick={handleAddField}>
									<FontAwesomeIcon icon="plus" /> Add Field
								</button>
							</div>
						</>
					) }
				</div>
				<div className="registration-form-builder-save">
					<button className="btn btn-md btn-filled-green btn-round" onClick={handleSave} disabled={saving || !!editingField}>
						{ saving ? 'Saving...' : 'Save Configuration' }
					</button>
				</div>
			</div>

			<div className="registration-form-builder-preview">
				<h3>Form Preview</h3>
				<div className="reg-form-preview">
					<form className="reg-form" onSubmit={( e ) => e.preventDefault()}>
						<div className="reg-form-group">
							<label htmlFor="preview-firstName">First Name <span className="required">*</span></label>
							<input type="text" id="preview-firstName" name="firstName" value={previewState.firstName || ''} onChange={handlePreviewChange} required placeholder="First name" />
						</div>
						<div className="reg-form-group">
							<label htmlFor="preview-lastName">Last Name <span className="required">*</span></label>
							<input type="text" id="preview-lastName" name="lastName" value={previewState.lastName || ''} onChange={handlePreviewChange} required placeholder="Last name" />
						</div>
						<div className="reg-form-group">
							<label htmlFor="preview-email">Email <span className="required">*</span></label>
							<input type="email" id="preview-email" name="email" value={previewState.email || ''} onChange={handlePreviewChange} required placeholder="Email address" />
						</div>

						{ sortedPreviewFields.map( ( field ) => (
							<div className="reg-form-group" key={field._id || field.name}>
								{ field.type !== 'checkbox' && (
									<label htmlFor={`preview-${ field.name }`}>
										{field.label}
										{ field.required && <span className="required"> *</span> }
									</label>
								) }
								{ renderPreviewField( field ) }
							</div>
						) ) }

						<div className="reg-form-actions">
							<button type="button" className="btn btn-lg btn-filled-green btn-round" disabled>Register</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default RegistrationFormBuilder

