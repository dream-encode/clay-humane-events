import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { formatRelativeTime } from '../../inc/helpers'
import { useToast } from '../../context/ToastContext'

const EMAIL_TYPES = [ 'password_reset', 'email_verification', 'notification', 'marketing', 'system', 'registration_confirmation' ]
const STATUSES = [ 'pending', 'sent', 'failed', 'bounced', 'delivered' ]

const formatEmailType = ( type ) => {
	return type.replace( /_/g, ' ' ).replace( /\b\w/g, ( c ) => c.toUpperCase() )
}

const Emails = () => {
	const { showError } = useToast()

	const [ emails, setEmails ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ filterType, setFilterType ] = useState( '' )
	const [ filterStatus, setFilterStatus ] = useState( '' )
	const [ page, setPage ] = useState( 0 )
	const [ hasMore, setHasMore ] = useState( false )

	const limit = 25

	const loadEmails = useCallback( async () => {
		setLoading( true )

		try {
			const params = {
				sort: '!createdAt',
				limit,
				page
			}

			const filterParts = []
			if ( filterType ) filterParts.push( `emailType:${ filterType }` )
			if ( filterStatus ) filterParts.push( `status:${ filterStatus }` )
			if ( filterParts.length > 0 ) params.filters = filterParts.join( ',' )

			const response = await API.getEntities( 'email', params )

			if ( Array.isArray( response ) ) {
				setEmails( response )
				setHasMore( response.length === limit )
			}
		} catch ( error ) {
			showError( 'Failed to load emails.' )
		} finally {
			setLoading( false )
		}
	}, [ page, filterType, filterStatus ] )

	useEffect( () => {
		loadEmails()
	}, [ loadEmails ] )

	useEffect( () => {
		setPage( 0 )
	}, [ filterType, filterStatus ] )

	return (
		<section className="page emails">
			<div className="page-header">
				<h2>Emails</h2>
			</div>

			<div className="section">
				<div className="emails-filters">
					<select value={filterType} onChange={( e ) => setFilterType( e.target.value )}>
						<option value="">All Types</option>
						{EMAIL_TYPES.map( ( type ) => (
							<option key={type} value={type}>{formatEmailType( type )}</option>
						) )}
					</select>
					<select value={filterStatus} onChange={( e ) => setFilterStatus( e.target.value )}>
						<option value="">All Statuses</option>
						{STATUSES.map( ( status ) => (
							<option key={status} value={status}>{status.charAt( 0 ).toUpperCase() + status.slice( 1 )}</option>
						) )}
					</select>
				</div>

				{loading ? (
					<p>Loading emails...</p>
				) : emails.length === 0 ? (
					<p>No emails found.</p>
				) : (
					<>
						<table className="entity-table emails-table">
							<thead>
								<tr>
									<th>To</th>
									<th>Subject</th>
									<th>Type</th>
									<th>Status</th>
									<th>Sent</th>
								</tr>
							</thead>
							<tbody>
								{emails.map( ( email ) => (
									<tr key={email._id}>
										<td>{email.to}</td>
										<td>{email.subject}</td>
										<td><span className={`emails-badge emails-badge--type`}>{formatEmailType( email.emailType )}</span></td>
										<td><span className={`emails-badge emails-badge--${ email.status }`}>{email.status}</span></td>
										<td>{email.sentAt ? formatRelativeTime( email.sentAt ) : formatRelativeTime( email.createdAt )}</td>
									</tr>
								) )}
							</tbody>
						</table>

						<div className="emails-pagination">
							<button className="btn btn-sm btn-ghost-blue btn-round" disabled={page <= 0} onClick={() => setPage( ( p ) => p - 1 )}>
								<FontAwesomeIcon icon="chevron-left" /> Previous
							</button>
							<span className="emails-pagination-page">Page {page + 1}</span>
							<button className="btn btn-sm btn-ghost-blue btn-round" disabled={!hasMore} onClick={() => setPage( ( p ) => p + 1 )}>
								Next <FontAwesomeIcon icon="chevron-right" />
							</button>
						</div>
					</>
				)}
			</div>
		</section>
	)
}

export default Emails

