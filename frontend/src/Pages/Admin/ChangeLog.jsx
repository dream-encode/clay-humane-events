import { Fragment, useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { formatRelativeTime } from '../../inc/helpers'
import { useToast } from '../../context/ToastContext'

const ENTITY_TYPES = [ 'Event', 'User', 'EventRegistration', 'AdminNotification' ]
const ACTIONS = [ 'create', 'update', 'delete' ]

const formatChanges = ( entry ) => {
	if ( entry.action === 'create' ) return 'Created'
	if ( entry.action === 'delete' ) return 'Deleted'

	if ( !entry.changes || Object.keys( entry.changes ).length === 0 ) return 'No changes recorded'

	return Object.entries( entry.changes ).map( ( [ field ] ) => field ).join( ', ' )
}

const ChangeLog = () => {
	const { showError } = useToast()

	const [ entries, setEntries ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ filterEntityType, setFilterEntityType ] = useState( '' )
	const [ filterAction, setFilterAction ] = useState( '' )
	const [ page, setPage ] = useState( 0 )
	const [ hasMore, setHasMore ] = useState( false )
	const [ expandedRow, setExpandedRow ] = useState( null )

	const limit = 25

	const loadEntries = useCallback( async () => {
		setLoading( true )

		try {
			const params = {
				sort: '!createdAt',
				limit,
				page
			}

			const filterParts = []
			if ( filterEntityType ) filterParts.push( `entityType:${ filterEntityType }` )
			if ( filterAction ) filterParts.push( `action:${ filterAction }` )
			if ( filterParts.length > 0 ) params.filters = filterParts.join( ',' )

			const response = await API.getEntities( 'changeLog', params )

			if ( Array.isArray( response ) ) {
				setEntries( response )
				setHasMore( response.length === limit )
			}
		} catch ( error ) {
			showError( 'Failed to load changelog entries.' )
		} finally {
			setLoading( false )
		}
	}, [ page, filterEntityType, filterAction ] )

	useEffect( () => {
		loadEntries()
	}, [ loadEntries ] )

	useEffect( () => {
		setPage( 0 )
	}, [ filterEntityType, filterAction ] )

	const toggleExpandRow = ( id ) => {
		setExpandedRow( expandedRow === id ? null : id )
	}

	const renderChangesDetail = ( entry ) => {
		if ( entry.action !== 'update' || !entry.changes ) return null

		return (
			<tr className="changelog-detail-row">
				<td colSpan="6">
					<div className="changelog-changes-detail">
						{Object.entries( entry.changes ).map( ( [ field, change ] ) => (
							<div key={field} className="changelog-change-item">
								<span className="changelog-change-field">{field}</span>
								<span className="changelog-change-from">{JSON.stringify( change.from )}</span>
								<FontAwesomeIcon icon="arrow-right" className="changelog-change-arrow" />
								<span className="changelog-change-to">{JSON.stringify( change.to )}</span>
							</div>
						) )}
					</div>
				</td>
			</tr>
		)
	}

	return (
		<section className="page changelog">
			<div className="page-header">
				<h2>Change Log</h2>
			</div>

			<div className="section">
				<div className="changelog-filters">
					<select value={filterEntityType} onChange={( e ) => setFilterEntityType( e.target.value )}>
						<option value="">All Entity Types</option>
						{ENTITY_TYPES.map( ( type ) => (
							<option key={type} value={type}>{type}</option>
						) )}
					</select>
					<select value={filterAction} onChange={( e ) => setFilterAction( e.target.value )}>
						<option value="">All Actions</option>
						{ACTIONS.map( ( action ) => (
							<option key={action} value={action}>{action.charAt( 0 ).toUpperCase() + action.slice( 1 )}</option>
						) )}
					</select>
				</div>

				{loading ? (
					<p>Loading changelog...</p>
				) : entries.length === 0 ? (
					<p>No changelog entries found.</p>
				) : (
					<>
						<table className="entity-table changelog-table">
							<thead>
								<tr>
									<th></th>
									<th>Date</th>
									<th>Entity Type</th>
									<th>Action</th>
									<th>User</th>
									<th>Changes</th>
								</tr>
							</thead>
							<tbody>
								{entries.map( ( entry ) => (
									<Fragment key={entry._id}>
										<tr className={expandedRow === entry._id ? 'expanded' : ''}>
											<td>
												{entry.action === 'update' && entry.changes && Object.keys( entry.changes ).length > 0 && (
													<button className="btn btn-xs changelog-expand-btn" onClick={() => toggleExpandRow( entry._id )}>
														<FontAwesomeIcon icon={expandedRow === entry._id ? 'chevron-down' : 'chevron-right'} />
													</button>
												)}
											</td>
											<td>{formatRelativeTime( entry.createdAt )}</td>
											<td><span className={`changelog-badge changelog-badge--${ entry.entityType.toLowerCase() }`}>{entry.entityType}</span></td>
											<td><span className={`changelog-badge changelog-badge--${ entry.action }`}>{entry.action}</span></td>
											<td>{entry.userName || 'System'}</td>
											<td>{formatChanges( entry )}</td>
										</tr>
										{expandedRow === entry._id && renderChangesDetail( entry )}
									</Fragment>
								) )}
							</tbody>
						</table>

						<div className="changelog-pagination">
							<button className="btn btn-sm btn-ghost-blue btn-round" disabled={page <= 0} onClick={() => setPage( ( p ) => p - 1 )}>
								<FontAwesomeIcon icon="chevron-left" /> Previous
							</button>
							<span className="changelog-pagination-page">Page {page + 1}</span>
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

export default ChangeLog

