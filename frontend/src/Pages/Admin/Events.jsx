import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import EntityFormModal from '../../Components/Modal/EntityFormModal'
import ToggleSwitch from '../../Components/ToggleSwitch'
import { useToast } from '../../context/ToastContext'

const eventFields = [
	{ name: 'eventName', label: 'Event Name', type: 'text', required: true, placeholder: 'Enter event name' },
	{ name: 'eventDate', label: 'Event Date', type: 'date', required: true },
	{ name: 'eventDescription', label: 'Description', type: 'textarea', required: false, placeholder: 'Enter event description', rows: 4 },
]

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric' } )
}

const Events = () => {
	const { showSuccess, showError } = useToast()

	const [ events, setEvents ] = useState( [] )
	const [ registrationCounts, setRegistrationCounts ] = useState( {} )
	const [ loading, setLoading ] = useState( true )
	const [ isAddModalOpen, setIsAddModalOpen ] = useState( false )

	const loadEvents = useCallback( async () => {
		setLoading( true )

		const [ eventsResponse, countsResponse ] = await Promise.all( [
			API.getEntities( 'event' ),
			API.getRegistrationCounts()
		] )

		if ( Array.isArray( eventsResponse ) ) {
			setEvents( eventsResponse )
		}

		if ( Array.isArray( countsResponse ) ) {
			const countsMap = {}
			countsResponse.forEach( ( c ) => { countsMap[ c._id ] = c.count } )
			setRegistrationCounts( countsMap )
		}

		setLoading( false )
	}, [] )

	useEffect( () => {
		loadEvents()
	}, [ loadEvents ] )

	const handleAddEvent = async ( formData ) => {
		const response = await API.insertEntity( 'event', formData )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'Event created successfully.' )
		loadEvents()
	}

	const handleToggleRegistration = async ( event, newValue ) => {
		const response = await API.updateEntity( 'event', event._id, { registrationOpen: newValue } )

		if ( response?.error ) {
			showError( response.message || response.error )
			return
		}

		setEvents( ( prev ) => prev.map( ( e ) => e._id === event._id ? { ...e, registrationOpen: newValue } : e ) )
		showSuccess( `Registration ${ newValue ? 'opened' : 'closed' } for ${ event.eventName }.` )
	}

	return (
		<section className="page events">
			<div className="page-header">
				<h2>Events</h2>
				<div className="page-header-actions">
					<button className="btn btn-md btn-filled-green btn-round" onClick={() => setIsAddModalOpen( true )}>
						<FontAwesomeIcon icon="plus" /> Add Event
					</button>
				</div>
			</div>

			<div className="section">
				{ loading ? (
					<p>Loading events...</p>
				) : events.length === 0 ? (
					<p>No events to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Event Name</th>
								<th>Date</th>
								<th>Description</th>
								<th className="centered">Registrations</th>
								<th className="centered">Registration Open?</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{ events.map( ( event ) => (
								<tr key={event._id}>
									<td>{event.eventName}</td>
									<td>{formatDate( event.eventDate )}</td>
									<td>{event.eventDescription}</td>
									<td className="centered">
										<Link to={`/admin/registrations?eventId=${ event._id }`} className="registration-count-link">
											{registrationCounts[ event._id ] || 0} <FontAwesomeIcon icon="arrow-up-right-from-square" />
										</Link>
									</td>
									<td className="centered">
										<ToggleSwitch
											checked={!!event.registrationOpen}
											onChange={( newValue ) => handleToggleRegistration( event, newValue )}
										/>
									</td>
									<td className="actions">
										<Link to={`/admin/events/${ event._id }/edit`} className="btn btn-sm btn-filled-blue btn-round">
											<FontAwesomeIcon icon="edit" /> Edit
										</Link>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</div>

			<EntityFormModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen( false )}
				title="Add Event"
				fields={eventFields}
				onSubmit={handleAddEvent}
				submitLabel="Create Event"
			/>
		</section>
	)
}

export default Events

