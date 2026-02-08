import { useState, useEffect } from 'react'

import Modal from './Modal'

const RegistrationFormPreviewModal = ( { isOpen, onClose, fields = [], event } ) => {
	const [ formState, setFormState ] = useState( {} )

	useEffect( () => {
		if ( isOpen ) {
			const defaults = {}
			fields.forEach( ( field ) => {
				defaults[ field.name ] = field.type === 'checkbox' ? false : ''
			} )
			setFormState( { firstName: '', lastName: '', email: '', ...defaults } )
		}
	}, [ isOpen, fields ] )

	const handleFieldChange = ( e ) => {
		const { name, value, type, checked } = e.target
		setFormState( ( prev ) => ( {
			...prev,
			[ name ]: type === 'checkbox' ? checked : value,
		} ) )
	}

	const renderField = ( field ) => {
		const commonProps = {
			id: `preview-${ field.name }`,
			name: field.name,
			value: formState[ field.name ] || '',
			onChange: handleFieldChange,
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
						<input type="checkbox" id={`preview-${ field.name }`} name={field.name} checked={!!formState[ field.name ]} onChange={handleFieldChange} />
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
								<input type="radio" name={`preview-${ field.name }`} value={opt.value} checked={formState[ field.name ] === opt.value} onChange={( e ) => setFormState( ( prev ) => ( { ...prev, [ field.name ]: e.target.value } ) )} />
								<span>{opt.label}</span>
							</label>
						) ) }
					</div>
				)
			default:
				return <input type="text" {...commonProps} />
		}
	}

	const sortedFields = [ ...fields ].sort( ( a, b ) => a.sortOrder - b.sortOrder )

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Preview — ${ event?.eventName || 'Registration Form' }`} size="md">
			<div className="reg-form-preview">
				<form className="reg-form" onSubmit={( e ) => e.preventDefault()}>
					<div className="reg-form-group">
						<label htmlFor="preview-firstName">First Name <span className="required">*</span></label>
						<input type="text" id="preview-firstName" name="firstName" value={formState.firstName || ''} onChange={handleFieldChange} required placeholder="First name" />
					</div>
					<div className="reg-form-group">
						<label htmlFor="preview-lastName">Last Name <span className="required">*</span></label>
						<input type="text" id="preview-lastName" name="lastName" value={formState.lastName || ''} onChange={handleFieldChange} required placeholder="Last name" />
					</div>
					<div className="reg-form-group">
						<label htmlFor="preview-email">Email <span className="required">*</span></label>
						<input type="email" id="preview-email" name="email" value={formState.email || ''} onChange={handleFieldChange} required placeholder="Email address" />
					</div>

					{ sortedFields.map( ( field ) => (
						<div className="reg-form-group" key={field._id || field.name}>
							{ field.type !== 'checkbox' && (
								<label htmlFor={`preview-${ field.name }`}>
									{field.label}
									{ field.required && <span className="required"> *</span> }
								</label>
							) }
							{ renderField( field ) }
						</div>
					) ) }

					<div className="reg-form-actions">
						<button type="button" className="btn btn-lg btn-filled-green btn-round" disabled>Register</button>
					</div>
				</form>
			</div>
			<div className="modal-footer">
				<div className="modal-actions">
					<button className="btn btn-md btn-ghost-grey btn-round" onClick={onClose}>Close</button>
				</div>
			</div>
		</Modal>
	)
}

export default RegistrationFormPreviewModal

