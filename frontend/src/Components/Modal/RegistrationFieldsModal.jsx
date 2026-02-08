import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Modal from './Modal'

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

const RegistrationFieldsModal = ( { isOpen, onClose, event, onSave } ) => {
	const [ fields, setFields ] = useState( [] )
	const [ editingField, setEditingField ] = useState( null )
	const [ editingIndex, setEditingIndex ] = useState( -1 )
	const [ saving, setSaving ] = useState( false )
	const [ registrationOpen, setRegistrationOpen ] = useState( false )

	useEffect( () => {
		if ( isOpen && event ) {
			const sorted = [ ...( event.registrationFields || [] ) ].sort( ( a, b ) => a.sortOrder - b.sortOrder )
			setFields( sorted )
			setRegistrationOpen( !!event.registrationOpen )
			setEditingField( null )
			setEditingIndex( -1 )
		}
	}, [ isOpen, event ] )

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
			await onSave( event._id, { registrationFields: fields, registrationOpen } )
			onClose()
		} catch {
			// Parent handles toast.
		} finally {
			setSaving( false )
		}
	}

	const handleCancel = () => {
		setEditingField( null )
		setEditingIndex( -1 )
		onClose()
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

	return (
		<Modal isOpen={isOpen} onClose={handleCancel} title={`Registration Fields — ${event?.eventName || ''}`} size="lg">
			<div className="reg-fields-config">
				<div className="reg-fields-toggle">
					<label className="entity-form-checkbox">
						<input type="checkbox" checked={registrationOpen} onChange={( e ) => setRegistrationOpen( e.target.checked )} />
						<span>Registration Open</span>
					</label>
				</div>

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
			<div className="modal-footer">
				<div className="modal-actions">
					<button className="btn btn-md btn-ghost-grey btn-round" onClick={handleCancel} disabled={saving}>Cancel</button>
					<button className="btn btn-md btn-filled-green btn-round" onClick={handleSave} disabled={saving || !!editingField}>
						{ saving ? 'Saving...' : 'Save Configuration' }
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default RegistrationFieldsModal
