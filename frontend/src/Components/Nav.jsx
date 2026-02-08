import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ADMIN_VIEWS } from '../inc/constants'
import { useAuth } from '../context/AuthContext'

const Nav = () => {
	const location = useLocation()
	const { isAuthenticated, user } = useAuth()

	const [ activeSubnav, setActiveSubnav ] = useState( null )
	const subnavTimeoutRef = useRef( null )

	const handleSubnavEnter = ( navKey ) => {
		if ( subnavTimeoutRef.current ) {
			clearTimeout( subnavTimeoutRef.current )
		}
		setActiveSubnav( navKey )
	}

	const handleSubnavLeave = () => {
		subnavTimeoutRef.current = setTimeout( () => {
			setActiveSubnav( null )
		}, 150 )
	}

	const handleSubnavMouseEnter = () => {
		if ( subnavTimeoutRef.current ) {
			clearTimeout( subnavTimeoutRef.current )
		}
	}

	useEffect( () => {
		return () => {
			if ( subnavTimeoutRef.current ) {
				clearTimeout( subnavTimeoutRef.current )
			}
		}
	}, [] )

	if ( !isAuthenticated ) {
		return null
	}

	const isCurrentPath = ( view ) => {
		if ( view.route ) {
			return location.pathname === `/${ view.route }`
		}
		return false
	}

	const isSubRouteActive = ( routes ) => {
		if ( !routes ) return false
		return routes.some( ( route ) => isCurrentPath( route ) )
	}

	const renderNavItem = ( view, index ) => {
		const hasSubnav = view.routes && view.routes.length > 0
		const isCurrent = isCurrentPath( view ) || ( hasSubnav && isSubRouteActive( view.routes ) )

		if ( hasSubnav ) {
			return (
				<div
					key={index}
					className="nav-item-container"
					onMouseEnter={() => handleSubnavEnter( view.key )}
					onMouseLeave={handleSubnavLeave}
				>
					<span className={`nav-item has-subnav ${ isCurrent ? 'current' : '' }`}>
						{view.label}
						<span className="subnav-arrow">▼</span>
					</span>
					{activeSubnav === view.key && (
						<div
							className="subnav"
							onMouseEnter={handleSubnavMouseEnter}
							onMouseLeave={handleSubnavLeave}
						>
							{view.routes.map( ( subRoute, subIndex ) => {
								if ( !subRoute.showInNav ) {
									return null
								}

								return (
									<Link
										key={subIndex}
										to={`/${ subRoute.route }`}
										onClick={() => setActiveSubnav( null )}
										className={`subnav-item ${ isCurrentPath( subRoute ) ? 'current' : '' }`}
									>
										{subRoute.label}
									</Link>
								)
							} )}
						</div>
					)}
				</div>
			)
		}

		return (
			<Link
				key={index}
				to={`/${ view.route }`}
				className={`nav-item ${ isCurrent ? 'current' : '' }`}
			>
				{view.label}
			</Link>
		)
	}

	return (
		<nav>
			<div className="links">
				{ADMIN_VIEWS.filter( ( view ) => {
					if ( !view.showInNav ) return false
					if ( view.requireRole && user?.role !== view.requireRole ) return false
					return true
				} ).map( renderNavItem )}
			</div>
		</nav>
	)
}

export default Nav

