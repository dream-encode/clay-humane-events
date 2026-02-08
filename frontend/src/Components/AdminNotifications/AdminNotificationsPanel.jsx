import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import API from '../../inc/api'
import emitter from '../../inc/emitter'
import { formatRelativeTime } from '../../inc/helpers'

const AdminNotificationsPanel = ( { onClose, onNotificationRead, onAllRead } ) => {
	const [ notifications, setNotifications ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ refreshing, setRefreshing ] = useState( false )
	const [ markingAllRead, setMarkingAllRead ] = useState( false )
	const [ dismissingIds, setDismissingIds ] = useState( [] )
	const pollingIntervalRef = useRef( null )

	useEffect( () => {
		loadNotifications()

		pollingIntervalRef.current = setInterval( () => {
			checkForNewNotifications()
		}, 60000 )

		return () => {
			if ( pollingIntervalRef.current ) {
				clearInterval( pollingIntervalRef.current )
			}
		}
	}, [] )

	const loadNotifications = async () => {
		try {
			setLoading( true )

			const response = await API.apiGetRequest( 'adminNotification?dismissed=false&limit=5&sort=%21createdAt' )

			if ( response && Array.isArray( response ) ) {
				setNotifications( response )
			}
		} catch ( error ) {
			console.error( 'Error loading admin notifications:', error )
		} finally {
			setLoading( false )
		}
	}

	const checkForNewNotifications = async () => {
		try {
			const response = await API.apiGetRequest( 'adminNotification?dismissed=false&limit=5&sort=%21createdAt' )

			if ( response && Array.isArray( response ) ) {
				const currentIds = notifications.map( n => n._id )
				const newNotifications = response.filter( n => !currentIds.includes( n._id ) )

				if ( newNotifications.length > 0 ) {
					setNotifications( response )
					emitter.emit( 'AdminNotifications/NewNotification' )
				}
			}
		} catch ( error ) {
			console.error( 'Error checking for new notifications:', error )
		}
	}

	const markAllAsRead = async () => {
		try {
			setMarkingAllRead( true )
			setRefreshing( true )

			const undismissedNotifications = notifications.filter( n => !n.dismissed )

			for ( const notification of undismissedNotifications ) {
				await API.apiPostRequest( `adminNotification/${ notification._id }/dismiss` )
			}

			await loadNotifications()
			resetPollingInterval()
			emitter.emit( 'AdminNotifications/AllRead' )
			onAllRead()
		} catch ( error ) {
			console.error( 'Error marking all notifications as read:', error )
		} finally {
			setMarkingAllRead( false )
			setRefreshing( false )
		}
	}

	const resetPollingInterval = () => {
		if ( pollingIntervalRef.current ) {
			clearInterval( pollingIntervalRef.current )
		}

		pollingIntervalRef.current = setInterval( checkForNewNotifications, 10000 )
	}

	const markAsRead = async ( notificationId ) => {
		try {
			setDismissingIds( prev => [ ...prev, notificationId ] )
			setRefreshing( true )

			await API.apiPostRequest( `adminNotification/${ notificationId }/dismiss` )
			await loadNotifications()

			resetPollingInterval()
			emitter.emit( 'AdminNotifications/NotificationRead' )
			onNotificationRead()

			setDismissingIds( prev => prev.filter( id => id !== notificationId ) )
		} finally {
			setRefreshing( false )
		}
	}

	const getNotificationTypeIcon = ( type ) => {
		switch ( type ) {
			case 'error':
				return 'circle-exclamation'
			case 'success':
				return 'circle-check'
			case 'info':
				return 'circle-info'
			case 'warning':
				return 'triangle-exclamation'
			default:
				return 'bullhorn'
		}
	}

	const hasUnreadNotifications = notifications.some( n => !n.dismissed )

	return (
		<div className="admin-notifications-panel">
			<div className="panel-header">
				<h3>Alerts</h3>
				<button className="close-button" onClick={onClose} type="button" aria-label="Close notifications panel">
					&times;
				</button>
			</div>

			<div className="panel-content">
				{loading ? (
					<div className="loading-state">Loading notifications...</div>
				) : notifications.filter( n => !n.dismissed ).length === 0 ? (
					<div className="empty-state">No unread alerts</div>
				) : (
					<div className="notifications-list">
						{notifications.filter( n => !n.dismissed ).map( ( notification ) => (
							<div
								key={notification._id}
								className={`notification-item unread ${ dismissingIds.includes( notification._id ) ? 'dismissing' : '' }`}
								onClick={() => !refreshing && markAsRead( notification._id )}
							>
								<div className="notification-icon">
									<span className={`notification-type-icon type-${ notification.notificationType }`}>
										<i className={`fa-solid fa-${ getNotificationTypeIcon( notification.notificationType ) }`}></i>
									</span>
								</div>
								<div className="notification-content">
									<div className="notification-title">{notification.title}</div>
									<div className="notification-text">{notification.text}</div>
									{notification.actionUrl && (
										<a href={notification.actionUrl} target="_blank" rel="noopener noreferrer" className="notification-action-link" onClick={( e ) => e.stopPropagation()}>
											{notification.actionText || 'View Details'}
										</a>
									)}
									<div className="notification-time">
										{formatRelativeTime( new Date( notification.createdAt ) )}
									</div>
								</div>
								<div className="unread-dot"></div>
							</div>
						) )}
					</div>
				)}
			</div>

			<div className="panel-footer">
				{hasUnreadNotifications && (
					<button
						className="mark-all-read-btn"
						onClick={markAllAsRead}
						disabled={markingAllRead || refreshing}
					>
						{markingAllRead ? 'Marking...' : refreshing ? 'Refreshing...' : 'Mark All as Read'}
					</button>
				)}
				<Link
					to="/admin/adminNotifications"
					className={`view-all-link ${ refreshing ? 'disabled' : '' }`}
					onClick={refreshing ? ( e ) => e.preventDefault() : onClose}
				>
					View All
				</Link>
			</div>
		</div>
	)
}

export default AdminNotificationsPanel

