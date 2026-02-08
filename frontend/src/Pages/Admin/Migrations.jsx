import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { useToast } from '../../context/ToastContext'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const Migrations = () => {
	const { showError } = useToast()

	const [ migrations, setMigrations ] = useState( [] )
	const [ loading, setLoading ] = useState( true )

	const loadMigrations = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEntities( 'dataMigration', { sort: '!createdAt' } )

			if ( Array.isArray( response ) ) {
				setMigrations( response )
			}
		} catch ( error ) {
			showError( 'Failed to load migrations.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadMigrations()
	}, [ loadMigrations ] )

	return (
		<section className="page migrations">
			<div className="page-header">
				<h2>Data Migrations</h2>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading migrations...</p>
				) : migrations.length === 0 ? (
					<p>No migrations to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Label</th>
								<th>Migrator</th>
								<th>Status</th>
								<th>Progress</th>
								<th>Rows</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{migrations.map( ( migration ) => (
								<tr key={migration._id}>
									<td>{migration.label}</td>
									<td>{migration.migrator}</td>
									<td><span className={`status-badge status-${ migration.status }`}>{migration.status}</span></td>
									<td>{migration.percentComplete || 0}%</td>
									<td>{migration.totalRowsMigrated || 0} / {migration.totalRows || 0}</td>
									<td>{formatDate( migration.createdAt )}</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>
		</section>
	)
}

export default Migrations

