import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import emitter from '../../inc/emitter'
import { formatRelativeTime } from '../../inc/helpers'
import { useToast } from '../../context/ToastContext'

const AdminNotifications = () => {
	const { showSuccess, showError } = useToast()

	const [ notifications, setNotifications ] = useState( [] )
	const [ loading, setLoading ] = useState( true )

	const loadNotifications = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.apiGetRequest( 'adminNotification?sort=%21createdAt&limit=50' )

			if ( response && Array.isArray( response ) ) {
				setNotifications( response )
			}
		} catch ( error ) {
			showError( 'Failed to load notifications' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadNotifications()
	}, [ loadNotifications ] )

	const dismissNotification = async ( notificationId ) => {
		try {
			await API.apiPostRequest( `adminNotification/${ notificationId }/dismiss` )

			await loadNotifications()

			emitter.emit( 'AdminNotifications/NotificationRead' )

			showSuccess( 'Notification dismissed' )
		} catch ( error ) {
			showError( 'Failed to dismiss notification' )
		}
	}

	const dismissAll = async () => {
		try {
			await API.apiGetRequest( 'adminNotification/dismiss-all' )

			await loadNotifications()

			emitter.emit( 'AdminNotifications/AllRead' )

			showSuccess( 'All notifications dismissed' )
		} catch ( error ) {
			showError( 'Failed to dismiss all notifications' )
		}
	}

	if ( loading ) {
		return (
			<section className="page-section">
				<div className="page-section-inner">
					<p>Loading notifications...</p>
				</div>
			</section>
		)
	}

	return (
		<section className="page-section">
			<div className="page-section-inner">
				<div className="page-section-header">
					<h1>Admin Notifications</h1>
					{notifications.some( n => !n.dismissed ) && (
						<button className="btn btn-sm btn-filled-blue btn-round" onClick={dismissAll}>
							<FontAwesomeIcon icon="check-double" /> Dismiss All
						</button>
					)}
				</div>

				{notifications.length === 0 ? (
					<p>No notifications.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Type</th>
								<th>Title</th>
								<th>Message</th>
								<th>Date</th>
								<th>Status</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{notifications.map( ( notification ) => (
								<tr key={notification._id}>
									<td>{notification.notificationType}</td>
									<td>{notification.title}</td>
									<td>{notification.text}</td>
									<td>{formatRelativeTime( notification.createdAt )}</td>
									<td>{notification.dismissed ? 'Dismissed' : 'Unread'}</td>
									<td className="actions">
										{!notification.dismissed && (
											<button className="btn btn-sm btn-filled-blue btn-round" onClick={() => dismissNotification( notification._id )}>
												<FontAwesomeIcon icon="check" /> Dismiss
											</button>
										)}
									</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>
		</section>
	)
}

export default AdminNotifications

