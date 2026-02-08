import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'

import API from '../../inc/api'
import emitter from '../../inc/emitter'
import AdminNotificationsPanel from './AdminNotificationsPanel'

const BellIcon = () => {
	const [ isOpen, setIsOpen ] = useState( false )
	const [ unreadCount, setUnreadCount ] = useState( 0 )
	const [ hasNewNotification, setHasNewNotification ] = useState( false )
	const bellRef = useRef( null )

	useEffect( () => {
		loadUnreadCount()

		emitter.on( 'AdminNotifications/NewNotification', handleNewNotification )
		emitter.on( 'AdminNotifications/NotificationRead', handleNotificationRead )
		emitter.on( 'AdminNotifications/AllRead', handleAllRead )

		return () => {
			emitter.off( 'AdminNotifications/NewNotification', handleNewNotification )
			emitter.off( 'AdminNotifications/NotificationRead', handleNotificationRead )
			emitter.off( 'AdminNotifications/AllRead', handleAllRead )
		}
	}, [] )

	const loadUnreadCount = async () => {
		try {
			const response = await API.apiGetRequest( 'adminNotification/total?dismissed=false' )

			if ( response && typeof response.count === 'number' ) {
				setUnreadCount( response.count )
			}
		} catch ( error ) {
			console.error( 'Error loading unread notification count:', error )
		}
	}

	const handleNewNotification = () => {
		setHasNewNotification( true )
		loadUnreadCount()

		setTimeout( () => {
			setHasNewNotification( false )
		}, 1000 )
	}

	const handleNotificationRead = () => {
		loadUnreadCount()
	}

	const handleAllRead = () => {
		setUnreadCount( 0 )
	}

	const togglePanel = () => {
		setIsOpen( !isOpen )
	}

	const closePanel = () => {
		setIsOpen( false )
	}

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( bellRef.current && !bellRef.current.contains( event.target ) ) {
				closePanel()
			}
		}

		if ( isOpen ) {
			document.addEventListener( 'mousedown', handleClickOutside )
		}

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside )
		}
	}, [ isOpen ] )

	return (
		<div className="admin-notifications-bell" ref={bellRef}>
			<button
				className={`bell-icon-button ${ hasNewNotification ? 'animate' : '' }`}
				onClick={togglePanel}
				aria-label={`Admin notifications${ unreadCount > 0 ? ` (${ unreadCount } unread)` : '' }`}
			>
				<FontAwesomeIcon icon={faBell} />
				{unreadCount > 0 && (
					<span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
				)}
			</button>

			{isOpen && (
				<AdminNotificationsPanel
					onClose={closePanel}
					onNotificationRead={handleNotificationRead}
					onAllRead={handleAllRead}
				/>
			)}
		</div>
	)
}

export default BellIcon

