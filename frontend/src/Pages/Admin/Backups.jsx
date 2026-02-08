import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { useToast } from '../../context/ToastContext'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const Backups = () => {
	const { showError } = useToast()

	const [ backups, setBackups ] = useState( [] )
	const [ loading, setLoading ] = useState( true )

	const loadBackups = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEntities( 'databaseBackup', { sort: '!createdAt' } )

			if ( Array.isArray( response ) ) {
				setBackups( response )
			}
		} catch ( error ) {
			showError( 'Failed to load backups.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadBackups()
	}, [ loadBackups ] )

	return (
		<section className="page backups">
			<div className="page-header">
				<h2>Database Backups</h2>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading backups...</p>
				) : backups.length === 0 ? (
					<p>No backups to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Status</th>
								<th>Collections</th>
								<th>Documents</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{backups.map( ( backup ) => (
								<tr key={backup._id}>
									<td>{backup.name}</td>
									<td>{backup.type}</td>
									<td><span className={`status-badge status-${ backup.status }`}>{backup.status}</span></td>
									<td>{backup.processedCollections || 0} / {backup.totalCollections || 0}</td>
									<td>{backup.processedDocuments || 0} / {backup.totalDocuments || 0}</td>
									<td>{formatDate( backup.createdAt )}</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>
		</section>
	)
}

export default Backups

