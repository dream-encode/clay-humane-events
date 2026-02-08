import React from 'react'

import BellIcon from './AdminNotifications/BellIcon'
import Logo from './Logo'
import Nav from './Nav'
import UserDropdown from './UserDropdown'

const SiteHeader = () => {
	return (
		<header className="site-header">
			<div className="header-container">
				<div className="header-left">
					<Logo />
				</div>

				<div className="header-center">
					<Nav />
				</div>

				<div className="header-right">
					<BellIcon />
					<UserDropdown />
				</div>
			</div>
		</header>
	)
}

export default SiteHeader

