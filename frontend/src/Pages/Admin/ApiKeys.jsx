import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import Modal from '../../Components/Modal/Modal'
import { useToast } from '../../context/ToastContext'

const ENTITY_TYPES = [
	{ key: 'adminNotification', label: 'Admin Notifications' },
	{ key: 'analytics', label: 'Analytics' },
	{ key: 'changeLog', label: 'Change Log' },
	{ key: 'databaseBackup', label: 'Database Backups' },
	{ key: 'dataMigration', label: 'Data Migrations' },
	{ key: 'email', label: 'Emails' },
	{ key: 'emailTemplate', label: 'Email Templates' },
	{ key: 'event', label: 'Events' },
	{ key: 'eventRegistration', label: 'Event Registrations' },
	{ key: 'note', label: 'Notes' },
	{ key: 'scheduledTask', label: 'Scheduled Tasks' },
	{ key: 'siteOption', label: 'Site Options' },
	{ key: 'user', label: 'Users' },
]

const EXPIRATION_OPTIONS = [
	{ value: '1', label: '1 Day' },
	{ value: '3', label: '3 Days' },
	{ value: '7', label: '7 Days' },
	{ value: '30', label: '30 Days' },
	{ value: '90', label: '90 Days' },
	{ value: '180', label: '180 Days' },
	{ value: '365', label: '365 Days' },
	{ value: '', label: 'No Expiration' },
]

const buildDefaultScopes = () => {
	const scopes = {}
	ENTITY_TYPES.forEach( ( { key } ) => {
		scopes[ key ] = { read: false, write: false }
	} )
	return scopes
}

const ApiKeys = () => {
	const { showSuccess, showError } = useToast()

	const [ apiKeys, setApiKeys ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ isModalOpen, setIsModalOpen ] = useState( false )
	const [ editingApiKey, setEditingApiKey ] = useState( null )
	const [ copiedKey, setCopiedKey ] = useState( null )
	const [ saving, setSaving ] = useState( false )
	const [ formName, setFormName ] = useState( '' )
	const [ formExpiration, setFormExpiration ] = useState( '' )
	const [ formScopes, setFormScopes ] = useState( buildDefaultScopes )

	const loadApiKeys = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEntities( 'apiKey', { sort: '-createdAt' } )

			if ( Array.isArray( response ) ) {
				setApiKeys( response )
			}
		} catch ( error ) {
			showError( 'Failed to load API keys.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadApiKeys()
	}, [ loadApiKeys ] )

	const scopesFromApi = ( apiScopes ) => {
		const scopes = buildDefaultScopes()

		if ( !apiScopes ) return scopes

		const entries = apiScopes instanceof Map ? Array.from( apiScopes.entries() ) : Object.entries( apiScopes )

		entries.forEach( ( [ key, value ] ) => {
			if ( scopes[ key ] ) {
				scopes[ key ] = { read: !!value.read, write: !!value.write }
			}
		} )

		return scopes
	}

	const handleScopeChange = ( entityKey, permission ) => {
		setFormScopes( ( prev ) => ( {
			...prev,
			[ entityKey ]: {
				...prev[ entityKey ],
				[ permission ]: !prev[ entityKey ][ permission ]
			}
		} ) )
	}

	const openAddModal = () => {
		setEditingApiKey( null )
		setFormName( '' )
		setFormExpiration( '' )
		setFormScopes( buildDefaultScopes() )
		setIsModalOpen( true )
	}

	const openEditModal = ( apiKey ) => {
		setEditingApiKey( apiKey )
		setFormName( apiKey.name )
		setFormExpiration( '' )
		setFormScopes( scopesFromApi( apiKey.scopes ) )
		setIsModalOpen( true )
	}

	const closeModal = () => {
		setIsModalOpen( false )
		setEditingApiKey( null )
	}

	const handleSubmit = async () => {
		setSaving( true )

		try {
			const scopesPayload = {}

			Object.entries( formScopes ).forEach( ( [ key, value ] ) => {
				if ( value.read || value.write ) {
					scopesPayload[ key ] = value
				}
			} )

			const data = { name: formName, scopes: scopesPayload }

			if ( !editingApiKey && formExpiration ) {
				const expiresAt = new Date()
				expiresAt.setDate( expiresAt.getDate() + parseInt( formExpiration, 10 ) )
				data.expiresAt = expiresAt.toISOString()
			} else if ( !editingApiKey ) {
				data.expiresAt = null
			}

			let response

			if ( editingApiKey ) {
				response = await API.updateEntity( 'apiKey', editingApiKey._id, data )
			} else {
				response = await API.insertEntity( 'apiKey', data )
			}

			if ( response?.error ) {
				showError( response.message || response.error )
				return
			}

			showSuccess( editingApiKey ? 'API key updated successfully.' : 'API key created successfully.' )
			closeModal()
			loadApiKeys()
		} catch {
			showError( 'Failed to save API key.' )
		} finally {
			setSaving( false )
		}
	}

	const handleToggleActive = async ( apiKey ) => {
		const response = await API.updateEntity( 'apiKey', apiKey._id, { isActive: !apiKey.isActive } )

		if ( response?.error ) {
			showError( response.message || response.error )
			return
		}

		showSuccess( `API key ${ apiKey.isActive ? 'deactivated' : 'activated' } successfully.` )
		loadApiKeys()
	}

	const handleCopyKey = ( key ) => {
		navigator.clipboard.writeText( key )
		setCopiedKey( key )
		showSuccess( 'API key copied to clipboard.' )

		setTimeout( () => setCopiedKey( null ), 2000 )
	}

	const formatExpiration = ( expiresAt ) => {
		if ( !expiresAt ) return 'Never'

		return new Date( expiresAt ).toLocaleDateString()
	}

	return (
		<section className="page api-keys">
			<div className="page-header">
				<h2>API Keys</h2>
				<div className="page-header-actions">
					<button className="btn btn-md btn-filled-green btn-round" onClick={openAddModal}>
						<FontAwesomeIcon icon="plus" /> Add API Key
					</button>
				</div>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading API keys...</p>
				) : apiKeys.length === 0 ? (
					<p>No API keys to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Created</th>
								<th>Name</th>
								<th>Key</th>
								<th>Expires</th>
								<th>Last Used</th>
								<th>Status</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{apiKeys.map( ( apiKey ) => (
								<tr key={apiKey._id}>
									<td>{new Date( apiKey.createdAt ).toLocaleDateString()}</td>
									<td>{apiKey.name}</td>
									<td className="api-key-value">
										<code>{apiKey.key}</code>
										<button className="btn btn-sm btn-ghost-grey btn-round api-key-copy" onClick={() => handleCopyKey( apiKey.key )} title="Copy to clipboard">
											<FontAwesomeIcon icon={copiedKey === apiKey.key ? 'check' : 'copy'} />
										</button>
									</td>
									<td>{formatExpiration( apiKey.expiresAt )}</td>
									<td>{apiKey.lastUsedAt ? new Date( apiKey.lastUsedAt ).toLocaleDateString() : 'N/A'}</td>
									<td>
										<span className={`api-key-status ${ apiKey.isActive ? 'active' : 'inactive' }`}>{apiKey.isActive ? 'Active' : 'Inactive'}</span>
									</td>
									<td className="actions">
										<button className="btn btn-sm btn-filled-blue btn-round" onClick={() => openEditModal( apiKey )}>
											<FontAwesomeIcon icon="edit" /> Edit
										</button>
										<button className={`btn btn-sm btn-round ${ apiKey.isActive ? 'btn-filled-red' : 'btn-filled-green' }`} onClick={() => handleToggleActive( apiKey )}>
											<FontAwesomeIcon icon={apiKey.isActive ? 'ban' : 'check'} /> {apiKey.isActive ? 'Deactivate' : 'Activate'}
										</button>
									</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>

			<Modal isOpen={isModalOpen} onClose={closeModal} title={editingApiKey ? 'Edit API Key' : 'Add API Key'} size="lg">
				<div className="entity-form">
					<div className="entity-form-fields">
						<div className="entity-form-row">
							<label className="entity-form-label required" htmlFor="apiKeyName">Name</label>
							<div className="entity-form-field">
								<input type="text" id="apiKeyName" value={formName} onChange={( e ) => setFormName( e.target.value )} disabled={saving} placeholder="Enter a descriptive name" />
							</div>
						</div>
						{!editingApiKey && (
							<div className="entity-form-row">
								<label className="entity-form-label" htmlFor="apiKeyExpiration">Expiration</label>
								<div className="entity-form-field">
									<select id="apiKeyExpiration" value={formExpiration} onChange={( e ) => setFormExpiration( e.target.value )} disabled={saving}>
										{EXPIRATION_OPTIONS.map( ( opt ) => (
											<option key={opt.value} value={opt.value}>{opt.label}</option>
										) )}
									</select>
								</div>
							</div>
						)}
						<div className="entity-form-row">
							<label className="entity-form-label">Scopes</label>
							<div className="entity-form-field">
								<table className="api-key-scopes-table">
									<thead>
										<tr>
											<th>Entity</th>
											<th>Read</th>
											<th>Write</th>
										</tr>
									</thead>
									<tbody>
										{ENTITY_TYPES.map( ( { key, label } ) => (
											<tr key={key}>
												<td>{label}</td>
												<td>
													<input type="checkbox" checked={formScopes[ key ]?.read || false} onChange={() => handleScopeChange( key, 'read' )} disabled={saving} />
												</td>
												<td>
													<input type="checkbox" checked={formScopes[ key ]?.write || false} onChange={() => handleScopeChange( key, 'write' )} disabled={saving} />
												</td>
											</tr>
										) )}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="modal-footer">
					<div className="modal-actions">
						<button className="btn btn-md btn-ghost-grey btn-round" onClick={closeModal} disabled={saving}>Cancel</button>
						<button className="btn btn-md btn-filled-green btn-round" onClick={handleSubmit} disabled={saving}>
							{saving ? 'Saving...' : ( editingApiKey ? 'Update API Key' : 'Create API Key' )}
						</button>
					</div>
				</div>
			</Modal>
		</section>
	)
}

export default ApiKeys
