import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faUserPen, faRightFromBracket, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'
import API from '../inc/api'
import CONFIG from '../inc/config'

const UserDropdown = ( { className = '' } ) => {
	const { user, setUser, logout, isAuthenticated } = useAuth()
	const { toggleTheme, theme } = useTheme()
	const location = useLocation()
	const [ isOpen, setIsOpen ] = useState( false )
	const dropdownRef = useRef( null )

	const handleLogout = () => {
		logout()
	}

	const handleThemeToggle = async () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark'

		toggleTheme()

		try {
			const updatedUser = await API.updateUserProfile( { preferredTheme: newTheme } )

			if ( updatedUser && !updatedUser.error ) {
				setUser( updatedUser )
			}
		} catch ( error ) {
			// Silently fail — localStorage still has the preference.
		}
	}

	const getDisplayName = () => {
		if ( user?.firstName && user?.lastName ) {
			return `${ user.firstName } ${ user.lastName.charAt( 0 ) }.`
		}
		return user?.email || 'User'
	}

	const toggleDropdown = () => {
		setIsOpen( !isOpen )
	}

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( dropdownRef.current && !dropdownRef.current.contains( event.target ) ) {
				setIsOpen( false )
			}
		}

		document.addEventListener( 'mousedown', handleClickOutside )
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside )
		}
	}, [] )

	if ( !isAuthenticated || !user ) {
		return null
	}

	const isAdminOrAbove = user.role === 'admin' || user.role === 'superadmin'
	const isInAdmin = location.pathname.startsWith( '/admin' )

	return (
		<div className={`user-dropdown ${ className }`} ref={dropdownRef}>
			<button className="user-dropdown-trigger" onClick={toggleDropdown}>
				{user.avatar ? (
					<img src={`${ CONFIG.API_URL }${ user.avatar }`} alt="" className="trigger-avatar" />
				) : (
					<FontAwesomeIcon icon={faUser} />
				)}
				<span className="user-name">{getDisplayName()}</span>
				<FontAwesomeIcon icon={faChevronDown} className={`chevron ${ isOpen ? 'open' : '' }`} />
			</button>

			{isOpen && (
				<div className="user-dropdown-menu">
					<div className="user-dropdown-header">
						{user.avatar ? (
							<img src={`${ CONFIG.API_URL }${ user.avatar }`} alt="" className="user-avatar-img" />
						) : (
							<div className="user-avatar-placeholder">
								<FontAwesomeIcon icon={faUser} />
							</div>
						)}
						<div className="user-info">
							<div className="user-name-large">{getDisplayName()}</div>
							<div className="user-email">{user.email}</div>
						</div>
					</div>

					<div className="user-dropdown-divider"></div>

					<div className="user-dropdown-actions">
						<Link
							to="/profile"
							className="dropdown-action"
							onClick={() => setIsOpen( false )}
						>
							<FontAwesomeIcon icon={faUserPen} />
							<span>Edit Profile</span>
						</Link>
						<div className="user-dropdown-divider"></div>
						<ThemeToggle onToggle={handleThemeToggle} />
						<div className="user-dropdown-divider"></div>
						{isAdminOrAbove && !isInAdmin && (
							<Link
								to="/admin/dashboard"
								className="dropdown-action"
								onClick={() => setIsOpen( false )}
							>
								<FontAwesomeIcon icon="gauge" />
								<span>Admin Dashboard</span>
							</Link>
						)}
						<button className="dropdown-action logout-action" onClick={handleLogout}>
							<FontAwesomeIcon icon={faRightFromBracket} />
							<span>Logout</span>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default UserDropdown

