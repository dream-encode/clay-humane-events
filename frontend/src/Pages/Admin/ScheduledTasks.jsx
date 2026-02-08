import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import { useToast } from '../../context/ToastContext'

const formatDate = ( dateString ) => {
	if ( !dateString ) return ''

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const ScheduledTasks = () => {
	const { showError } = useToast()

	const [ tasks, setTasks ] = useState( [] )
	const [ loading, setLoading ] = useState( true )

	const loadTasks = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEntities( 'scheduledTask', { sort: '!createdAt' } )

			if ( Array.isArray( response ) ) {
				setTasks( response )
			}
		} catch ( error ) {
			showError( 'Failed to load scheduled tasks.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadTasks()
	}, [ loadTasks ] )

	return (
		<section className="page scheduled-tasks">
			<div className="page-header">
				<h2>Scheduled Tasks</h2>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading scheduled tasks...</p>
				) : tasks.length === 0 ? (
					<p>No scheduled tasks to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Service</th>
								<th>Method</th>
								<th>Status</th>
								<th>Scheduled</th>
								<th>Recurring</th>
								<th>Attempts</th>
								<th>Last Attempt</th>
							</tr>
						</thead>
						<tbody>
							{tasks.map( ( task ) => (
								<tr key={task._id}>
									<td>{task.taskService}</td>
									<td>{task.taskMethod}</td>
									<td><span className={`status-badge status-${ task.status?.toLowerCase() }`}>{task.status}</span></td>
									<td>{formatDate( task.scheduledDate )}</td>
									<td>{task.recurring ? task.recurringFrequency : 'No'}</td>
									<td>{task.attempts || 0}</td>
									<td>{formatDate( task.lastAttempt )}</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>
		</section>
	)
}

export default ScheduledTasks

