import React from 'react'
import { Link } from 'react-router-dom'

import logoImage from '../assets/images/logo/clay-humane-logo-transparent.png'

const Logo = () => {
	return (
		<div className="logo">
			<Link to="/" className="logo-link">
				<img src={logoImage} alt="Clay Humane" className="logo-image" />
				<span className="logo-text">Clay Humane Events</span>
			</Link>
		</div>
	)
}

export default Logo

