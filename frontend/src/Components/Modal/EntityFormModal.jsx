import { useState, useEffect } from 'react'

import Modal from './Modal'

const EntityFormModal = ( { isOpen, onClose, title, fields, onSubmit, submitLabel = 'Save', size = 'md', initialValues = null } ) => {
	const buildDefaultState = () => {
		const state = {}

		fields.forEach( ( field ) => {
			if ( initialValues && initialValues[ field.name ] !== undefined ) {
				state[ field.name ] = initialValues[ field.name ]
			} else {
				state[ field.name ] = field.defaultValue ?? ''
			}
		} )

		return state
	}

	const [ formState, setFormState ] = useState( buildDefaultState )
	const [ saving, setSaving ] = useState( false )

	useEffect( () => {
		if ( isOpen ) {
			setFormState( buildDefaultState() )
		}
	}, [ isOpen ] )

	const handleFieldChange = ( e ) => {
		const { name, value, type, checked } = e.target

		setFormState( ( prev ) => ( {
			...prev,
			[ name ]: type === 'checkbox' ? checked : value,
		} ) )
	}

	const handleSubmit = async () => {
		setSaving( true )

		try {
			await onSubmit( formState )
			onClose()
		} catch {
			// Parent handles toast errors.
		} finally {
			setSaving( false )
		}
	}

	const handleCancel = () => {
		setFormState( buildDefaultState() )
		onClose()
	}

	const renderField = ( field ) => {
		const commonProps = {
			id: field.name,
			name: field.name,
			value: formState[ field.name ] ?? '',
			onChange: handleFieldChange,
			disabled: saving,
			placeholder: field.placeholder || '',
		}

		switch ( field.type ) {
			case 'select':
				return (
					<select {...commonProps}>
						<option value="">{ field.placeholder || 'Select...' }</option>
						{ field.options.map( ( opt ) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						) ) }
					</select>
				)
			case 'textarea':
				return <textarea {...commonProps} rows={field.rows || 4} />
			case 'date':
				return <input type="date" {...commonProps} />
			case 'phone':
				return <input type="tel" {...commonProps} />
			case 'number':
				return <input type="number" {...commonProps} min={field.min} max={field.max} step={field.step} />
			case 'checkbox':
				return (
					<label className="entity-form-checkbox">
						<input
							type="checkbox"
							id={field.name}
							name={field.name}
							checked={!!formState[ field.name ]}
							onChange={handleFieldChange}
							disabled={saving}
						/>
						<span>{field.checkboxLabel || field.label}</span>
					</label>
				)
			case 'radio':
				return (
					<div className="entity-form-radio-group">
						{ field.options.map( ( opt ) => (
							<label className="entity-form-radio" key={opt.value}>
								<input
									type="radio"
									name={field.name}
									value={opt.value}
									checked={formState[ field.name ] === opt.value}
									onChange={handleFieldChange}
									disabled={saving}
								/>
								<span>{opt.label}</span>
							</label>
						) ) }
					</div>
				)
			default:
				return <input type={field.type || 'text'} {...commonProps} />
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={handleCancel} title={title} size={size}>
			<div className="entity-form">
				<div className="entity-form-fields">
					{ fields.map( ( field ) => (
						<div className="entity-form-row" key={field.name}>
							<label className={`entity-form-label${ field.required ? ' required' : '' }`} htmlFor={field.name}>
								{field.label}
							</label>
							<div className="entity-form-field">
								{ renderField( field ) }
							</div>
						</div>
					) ) }
				</div>
			</div>
			<div className="modal-footer">
				<div className="modal-actions">
					<button
						className="btn btn-md btn-ghost-grey btn-round"
						onClick={handleCancel}
						disabled={saving}
					>
						Cancel
					</button>
					<button
						className="btn btn-md btn-filled-green btn-round"
						onClick={handleSubmit}
						disabled={saving}
					>
						{ saving ? 'Saving...' : submitLabel }
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default EntityFormModal

