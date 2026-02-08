import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import API from '../inc/api'
import CONFIG from '../inc/config'
import logoImage from '../assets/images/logo/clay-humane-logo-transparent.png'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	} )
}

const Home = () => {
	const { isAuthenticated } = useAuth()
	const [ events, setEvents ] = useState( [] )
	const [ loading, setLoading ] = useState( true )

	useEffect( () => {
		const fetchEvents = async () => {
			try {
				const result = await API.getOpenRegistrationEvents()

				if ( result && !result.error && Array.isArray( result ) ) {
					setEvents( result )
				}
			} catch ( error ) {
				console.error( 'Failed to fetch open events:', error )
			} finally {
				setLoading( false )
			}
		}

		fetchEvents()
	}, [] )

	return (
		<section className="home-page">
			<div className="home-content">
				<img src={logoImage} alt="Clay Humane" className="home-logo" />

				{!isAuthenticated && (
					<Link to="/login" className="home-login-button">
						Login
					</Link>
				)}
			</div>

			<div className="home-events">
				{loading && (
					<p className="home-events-loading">Loading events...</p>
				)}

				{!loading && events.length === 0 && (
					<p className="home-events-empty">No events with open registration at this time.</p>
				)}

				{!loading && events.length > 0 && (
					<div className="home-events-grid">
						{events.map( ( event ) => (
							<div key={event._id} className="home-event-card">
								{event.eventLogo && (
									<div className="home-event-card-logo">
										<img src={`${ CONFIG.API_URL }${ event.eventLogo }`} alt={event.eventName} />
									</div>
								)}
								<div className="home-event-card-body">
									<h2 className="home-event-card-title">{event.eventName}</h2>
									<p className="home-event-card-date">{formatDate( event.eventDate )}</p>
									{event.eventDescription && (
										<p className="home-event-card-description">{event.eventDescription}</p>
									)}
									<Link to={`/event/${ event.eventSlug || event.key }/register`} className="home-event-card-button">
										Register Now
									</Link>
								</div>
							</div>
						) )}
					</div>
				)}
			</div>
		</section>
	)
}

export default Home

