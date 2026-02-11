import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../inc/api'
import CONFIG from '../inc/config'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } )
}

const EventRegistration = () => {
	const { eventKey } = useParams()

	const [ event, setEvent ] = useState( null )
	const [ loading, setLoading ] = useState( true )
	const [ formState, setFormState ] = useState( {} )
	const [ submitting, setSubmitting ] = useState( false )
	const [ result, setResult ] = useState( null )
	const [ error, setError ] = useState( null )

	const loadEvent = useCallback( async () => {
		setLoading( true )
		setError( null )
		setEvent( null )

		try {
			const response = await API.getPublicEventByKey( eventKey )

			if ( response?.error ) {
				setError( response.message || 'Event not found.' )
			} else if ( response ) {
				const defaults = {}
				const fields = Array.isArray( response.registrationFields ) ? response.registrationFields : []
				fields.forEach( ( field ) => {
					defaults[ field.name ] = field.type === 'checkbox' ? false : ''
				} )

				setFormState( { firstName: '', lastName: '', email: '', ...defaults } )
				setEvent( response )
			} else {
				setError( 'Event not found.' )
			}
		} catch {
			setError( 'Failed to load event.' )
		}

		setLoading( false )
	}, [ eventKey ] )

	useEffect( () => {
		loadEvent()
	}, [ loadEvent ] )

	const handleFieldChange = ( e ) => {
		const { name, value, type, checked } = e.target
		setFormState( ( prev ) => ( {
			...prev,
			[ name ]: type === 'checkbox' ? checked : value,
		} ) )
	}

	const handleSubmit = async ( e ) => {
		e.preventDefault()
		setSubmitting( true )
		setError( null )

		const { firstName, lastName, email, ...dynamicFields } = formState

		try {
			const response = await API.registerForEvent( {
				eventId: event._id,
				firstName,
				lastName,
				email,
				formData: dynamicFields,
			} )

			if ( response?.error ) {
				setError( response.message || 'Registration failed.' )
			} else {
				setResult( response )
			}
		} catch {
			setError( 'Registration failed. Please try again.' )
		}

		setSubmitting( false )
	}

	const renderField = ( field ) => {
		const commonProps = {
			id: field.name,
			name: field.name,
			value: formState[ field.name ] || '',
			onChange: handleFieldChange,
			placeholder: field.placeholder || '',
			required: field.required,
			disabled: submitting,
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
						<input type="checkbox" id={field.name} name={field.name} checked={!!formState[ field.name ]} onChange={handleFieldChange} disabled={submitting} />
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
								<input type="radio" name={field.name} value={opt.value} checked={formState[ field.name ] === opt.value} onChange={handleFieldChange} disabled={submitting} />
								<span>{opt.label}</span>
							</label>
						) ) }
					</div>
				)
			default:
				return <input type="text" {...commonProps} />
		}
	}

	if ( loading ) {
		return (
			<section className="page event-registration">
				<p>Loading event...</p>
			</section>
		)
	}

	if ( error && !event ) {
		return (
			<section className="page event-registration">
				<div className="reg-message reg-message-error">
					<FontAwesomeIcon icon="exclamation-triangle" />
					<p>{error}</p>
				</div>
				<Link to="/" className="btn btn-md btn-ghost-grey btn-round">Back to Home</Link>
			</section>
		)
	}

	if ( !event?.registrationOpen ) {
		return (
			<section className="page event-registration">
				<div className="reg-event-header">
					{ event?.eventLogo && (
						<div className="reg-event-logo">
							<img src={`${ CONFIG.API_URL }${ event.eventLogo }`} alt={event?.eventName} />
						</div>
					) }
					<h1>{event?.eventName}</h1>
					<p className="reg-event-date">{formatDate( event?.eventDate )}</p>
				</div>
				<div className="reg-message reg-message-closed">
					<FontAwesomeIcon icon="lock" />
					<p>Registration is not currently open for this event.</p>
				</div>
				<Link to="/" className="btn btn-md btn-ghost-grey btn-round">Back to Home</Link>
			</section>
		)
	}

	if ( result ) {
		return (
			<section className="page event-registration">
				<div className="reg-event-header">
					{ event.eventLogo && (
						<div className="reg-event-logo">
							<img src={`${ CONFIG.API_URL }${ event.eventLogo }`} alt={event.eventName} />
						</div>
					) }
					<h1>{event.eventName}</h1>
					<p className="reg-event-date">{formatDate( event.eventDate )}</p>
				</div>
				<div className="reg-message reg-message-success">
					<FontAwesomeIcon icon="check-circle" />
					<h2>Registration Confirmed</h2>
					<p>You have been successfully registered for <strong>{event.eventName}</strong>.</p>
				</div>
				<Link to="/" className="btn btn-md btn-ghost-grey btn-round">Back to Home</Link>
			</section>
		)
	}

	const registrationFields = ( Array.isArray( event.registrationFields ) ? event.registrationFields : [] ).sort( ( a, b ) => a.sortOrder - b.sortOrder )

	return (
		<section className="page event-registration">
			<div className="reg-event-header">
				{ event.eventLogo && (
					<div className="reg-event-logo">
						<img src={`${ CONFIG.API_URL }${ event.eventLogo }`} alt={event.eventName} />
					</div>
				) }
				<h1>{event.eventName}</h1>
				<p className="reg-event-date">{formatDate( event.eventDate )}</p>
				{ event.eventDescription && <div className="reg-event-description" dangerouslySetInnerHTML={{ __html: event.eventDescription }} /> }
			</div>

			{ error && (
				<div className="reg-message reg-message-error">
					<FontAwesomeIcon icon="exclamation-triangle" />
					<p>{error}</p>
				</div>
			) }

			<form className="reg-form" onSubmit={handleSubmit}>
				<div className="reg-form-group">
					<label htmlFor="firstName">First Name <span className="required">*</span></label>
					<input type="text" id="firstName" name="firstName" value={formState.firstName || ''} onChange={handleFieldChange} required disabled={submitting} placeholder="First name" />
				</div>
				<div className="reg-form-group">
					<label htmlFor="lastName">Last Name <span className="required">*</span></label>
					<input type="text" id="lastName" name="lastName" value={formState.lastName || ''} onChange={handleFieldChange} required disabled={submitting} placeholder="Last name" />
				</div>
				<div className="reg-form-group">
					<label htmlFor="email">Email <span className="required">*</span></label>
					<input type="email" id="email" name="email" value={formState.email || ''} onChange={handleFieldChange} required disabled={submitting} placeholder="Email address" />
				</div>

				{ registrationFields.map( ( field ) => (
					<div className="reg-form-group" key={field._id || field.name}>
						{ field.type !== 'checkbox' && (
							<label htmlFor={field.name}>
								{field.label}
								{ field.required && <span className="required"> *</span> }
							</label>
						) }
						{ renderField( field ) }
					</div>
				) ) }

				<div className="reg-form-actions">
					<button type="submit" className="btn btn-lg btn-filled-green btn-round" disabled={submitting}>
						{ submitting ? 'Registering...' : 'Register' }
					</button>
				</div>
			</form>
		</section>
	)
}

export default EventRegistration

