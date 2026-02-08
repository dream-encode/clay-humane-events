import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import CONFIG from '../../inc/config'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const formatEventDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric' } )
}

const Dashboard = () => {
	const [ registrations, setRegistrations ] = useState( [] )
	const [ users, setUsers ] = useState( [] )
	const [ nextEvent, setNextEvent ] = useState( null )
	const [ nextEventRegCount, setNextEventRegCount ] = useState( 0 )
	const [ loadingRegistrations, setLoadingRegistrations ] = useState( true )
	const [ loadingUsers, setLoadingUsers ] = useState( true )
	const [ loadingNextEvent, setLoadingNextEvent ] = useState( true )

	const loadRegistrations = useCallback( async () => {
		setLoadingRegistrations( true )

		const response = await API.getEntities( 'eventRegistration', { limit: 10, sort: '!createdAt' } )

		if ( Array.isArray( response ) ) {
			setRegistrations( response )
		}

		setLoadingRegistrations( false )
	}, [] )

	const loadUsers = useCallback( async () => {
		setLoadingUsers( true )

		const response = await API.getEntities( 'user', { limit: 10, sort: '!createdAt' } )

		if ( Array.isArray( response ) ) {
			setUsers( response )
		}

		setLoadingUsers( false )
	}, [] )

	const loadNextEvent = useCallback( async () => {
		setLoadingNextEvent( true )

		const event = await API.getNextEvent()

		if ( event && !event.error ) {
			setNextEvent( event )

			const counts = await API.getRegistrationCounts()

			if ( Array.isArray( counts ) ) {
				const eventCount = counts.find( ( c ) => c._id === event._id )
				setNextEventRegCount( eventCount?.count || 0 )
			}
		}

		setLoadingNextEvent( false )
	}, [] )

	useEffect( () => {
		loadRegistrations()
		loadUsers()
		loadNextEvent()
	}, [ loadRegistrations, loadUsers, loadNextEvent ] )

	return (
		<section className="page dashboard">
			<div className="page-header">
				<h2>Dashboard</h2>
			</div>

			<div className="dashboard-widgets">
				<div className="dashboard-widget next-event-widget">
					<div className="widget-header">
						<h3><FontAwesomeIcon icon="calendar" /> Next Event</h3>
					</div>
					<div className="widget-body">
						{loadingNextEvent ? (
							<p>Loading...</p>
						) : !nextEvent ? (
							<p className="empty-message">No upcoming events.</p>
						) : (
							<div className="next-event-card">
								<span className={`status-badge next-event-status-badge status-${ nextEvent.registrationOpen ? 'confirmed' : 'cancelled' }`}>
									{nextEvent.registrationOpen ? 'Registration Open' : 'Registration Closed'}
								</span>
								{nextEvent.eventLogo && (
									<div className="next-event-logo">
										<img src={`${ CONFIG.API_URL }${ nextEvent.eventLogo }`} alt="" />
									</div>
								)}
								<div className="next-event-details">
									<h4 className="next-event-name">
										<Link to={`/admin/events/${ nextEvent._id }/edit`}>{nextEvent.eventName}</Link>
									</h4>
									<div className="next-event-meta">
										<span className="next-event-date">
											<FontAwesomeIcon icon="calendar-days" /> {formatEventDate( nextEvent.eventDate )}
										</span>
										<Link to={`/admin/registrations?eventId=${ nextEvent._id }`} className="next-event-reg-count">
											<FontAwesomeIcon icon="users" /> {nextEventRegCount} Registration{nextEventRegCount !== 1 ? 's' : ''}
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="dashboard-widget">
					<div className="widget-header">
						<h3><FontAwesomeIcon icon="clipboard-list" /> Latest Event Registrations</h3>
						<Link to="/admin/events" className="btn btn-sm btn-outline btn-round">View All</Link>
					</div>
					<div className="widget-body">
						{loadingRegistrations ? (
							<p>Loading...</p>
						) : registrations.length === 0 ? (
							<p className="empty-message">No registrations yet.</p>
						) : (
							<table className="entity-table">
								<thead>
									<tr>
										<th>Name</th>
										<th>Email</th>
										<th>Event</th>
										<th>Status</th>
										<th>Date</th>
									</tr>
								</thead>
								<tbody>
									{registrations.map( ( reg ) => (
										<tr key={reg._id}>
											<td>{reg.formData?.first_name || reg.formData?.firstName || ''} {reg.formData?.last_name || reg.formData?.lastName || ''}</td>
											<td>{reg.formData?.email || ''}</td>
											<td>{reg.eventName || reg.eventId}</td>
											<td><span className={`status-badge status-${ reg.status }`}>{reg.status}</span></td>
											<td>{formatDate( reg.createdAt )}</td>
										</tr>
									) )}
								</tbody>
							</table>
						)}
					</div>
				</div>

				<div className="dashboard-widget">
					<div className="widget-header">
						<h3><FontAwesomeIcon icon="users" /> Latest Users</h3>
						<Link to="/admin/users" className="btn btn-sm btn-outline btn-round">View All</Link>
					</div>
					<div className="widget-body">
						{loadingUsers ? (
							<p>Loading...</p>
						) : users.length === 0 ? (
							<p className="empty-message">No users yet.</p>
						) : (
							<table className="entity-table">
								<thead>
									<tr>
										<th className="avatar-col"></th>
										<th>Name</th>
										<th>Email</th>
										<th>Role</th>
										<th>Joined</th>
									</tr>
								</thead>
								<tbody>
									{users.map( ( u ) => (
										<tr key={u._id}>
											<td className="avatar-col">
												{u.avatar ? (
													<img src={`${ CONFIG.API_URL }${ u.avatar }`} alt="" className="user-table-avatar" />
												) : (
													<div className="user-table-avatar-placeholder">
														<FontAwesomeIcon icon="user" />
													</div>
												)}
											</td>
											<td>{u.firstName} {u.lastName}</td>
											<td>{u.email}</td>
											<td>{u.role}</td>
											<td>{formatDate( u.createdAt )}</td>
										</tr>
									) )}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Dashboard

