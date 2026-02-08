import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import EntityFormModal from '../../Components/Modal/EntityFormModal'
import { useToast } from '../../context/ToastContext'

const STATUS_OPTIONS = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'cancelled', label: 'Cancelled' },
]

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const Registrations = () => {
	const { showSuccess, showError } = useToast()
	const [ searchParams ] = useSearchParams()
	const eventIdFilter = searchParams.get( 'eventId' )

	const [ registrations, setRegistrations ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ editingRegistration, setEditingRegistration ] = useState( null )
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false )

	const registrationFields = [
		{ name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
	]

	const loadRegistrations = useCallback( async () => {
		setLoading( true )

		const filters = {}

		if ( eventIdFilter ) {
			filters.eventId = eventIdFilter
		}

		const response = await API.getAllRegistrations( filters )

		if ( Array.isArray( response ) ) {
			setRegistrations( response )
		}

		setLoading( false )
	}, [ eventIdFilter ] )

	useEffect( () => {
		loadRegistrations()
	}, [ loadRegistrations ] )

	const handleEditRegistration = async ( formData ) => {
		const response = await API.updateEntity( 'eventRegistration', editingRegistration._id, formData )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'Registration updated successfully.' )
		setEditingRegistration( null )
		loadRegistrations()
	}

	const openEditModal = ( registration ) => {
		setEditingRegistration( registration )
		setIsEditModalOpen( true )
	}

	const closeEditModal = () => {
		setIsEditModalOpen( false )
		setEditingRegistration( null )
	}

	const getRegistrantName = ( reg ) => {
		if ( reg.userId ) {
			return `${ reg.userId.firstName } ${ reg.userId.lastName }`
		}

		return reg.formData?.firstName ? `${ reg.formData.firstName } ${ reg.formData.lastName || '' }` : '—'
	}

	const getRegistrantEmail = ( reg ) => {
		return reg.userId?.email || reg.formData?.email || '—'
	}

	const getEventName = ( reg ) => {
		return reg.eventId?.eventName || '—'
	}

	return (
		<section className="page registrations">
			<div className="page-header">
				<h2>Registrations{eventIdFilter && registrations.length > 0 ? ` — ${ getEventName( registrations[ 0 ] ) }` : ''}</h2>
				{eventIdFilter && (
					<div className="page-header-actions">
						<Link to="/admin/registrations" className="btn btn-sm btn-ghost-grey btn-round">
							<FontAwesomeIcon icon="times" /> Clear Filter
						</Link>
					</div>
				)}
			</div>

			<div className="section">
				{ loading ? (
					<p>Loading registrations...</p>
				) : registrations.length === 0 ? (
					<p>No registrations to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Registrant</th>
								<th>Email</th>
								<th>Event</th>
								<th>Status</th>
								<th>Date</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{ registrations.map( ( reg ) => (
								<tr key={reg._id}>
									<td>{getRegistrantName( reg )}</td>
									<td>{getRegistrantEmail( reg )}</td>
									<td>{getEventName( reg )}</td>
									<td><span className={`status-badge status-${ reg.status }`}>{reg.status}</span></td>
									<td>{formatDate( reg.createdAt )}</td>
									<td className="actions">
										<button className="btn btn-sm btn-filled-blue btn-round" onClick={() => openEditModal( reg )}>
											<FontAwesomeIcon icon="edit" /> Edit
										</button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</div>

			<EntityFormModal
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				title="Edit Registration"
				fields={registrationFields}
				onSubmit={handleEditRegistration}
				submitLabel="Update Registration"
				initialValues={editingRegistration ? { status: editingRegistration.status } : null}
			/>
		</section>
	)
}

export default Registrations

