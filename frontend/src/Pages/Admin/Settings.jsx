import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import EntityFormModal from '../../Components/Modal/EntityFormModal'
import { useToast } from '../../context/ToastContext'

const settingFields = [
	{ name: 'optionKey', label: 'Option Key', type: 'text', required: true, placeholder: 'Enter option key' },
	{ name: 'optionName', label: 'Option Name', type: 'text', required: true, placeholder: 'Enter option name' },
	{ name: 'optionType', label: 'Type', type: 'select', required: true, options: [
		{ value: 'string', label: 'String' },
		{ value: 'number', label: 'Number' },
		{ value: 'boolean', label: 'Boolean' },
		{ value: 'json', label: 'JSON' },
		{ value: 'array', label: 'Array' },
	] },
	{ name: 'optionValue', label: 'Value', type: 'text', required: false, placeholder: 'Enter option value' },
	{ name: 'group', label: 'Group', type: 'text', required: false, placeholder: 'Enter group name' },
	{ name: 'optionIsPublic', label: 'Public?', type: 'checkbox', required: false },
]

const Settings = () => {
	const { showSuccess, showError } = useToast()

	const [ settings, setSettings ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ isAddModalOpen, setIsAddModalOpen ] = useState( false )
	const [ editingSetting, setEditingSetting ] = useState( null )
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false )

	const loadSettings = useCallback( async () => {
		setLoading( true )

		try {
			const response = await API.getEntities( 'siteOption', { sort: 'group' } )

			if ( Array.isArray( response ) ) {
				setSettings( response )
			}
		} catch ( error ) {
			showError( 'Failed to load settings.' )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		loadSettings()
	}, [ loadSettings ] )

	const handleAddSetting = async ( formData ) => {
		const response = await API.insertEntity( 'siteOption', formData )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'Setting created successfully.' )
		loadSettings()
	}

	const handleEditSetting = async ( formData ) => {
		const response = await API.updateEntity( 'siteOption', editingSetting._id, formData )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'Setting updated successfully.' )
		setEditingSetting( null )
		loadSettings()
	}

	const openEditModal = ( setting ) => {
		setEditingSetting( setting )
		setIsEditModalOpen( true )
	}

	const closeEditModal = () => {
		setIsEditModalOpen( false )
		setEditingSetting( null )
	}

	return (
		<section className="page settings">
			<div className="page-header">
				<h2>Settings</h2>
				<div className="page-header-actions">
					<button className="btn btn-md btn-filled-green btn-round" onClick={() => setIsAddModalOpen( true )}>
						<FontAwesomeIcon icon="plus" /> Add Setting
					</button>
				</div>
			</div>

			<div className="section">
				{loading ? (
					<p>Loading settings...</p>
				) : settings.length === 0 ? (
					<p>No settings to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th>Group</th>
								<th>Option Key</th>
								<th>Option Name</th>
								<th>Type</th>
								<th>Value</th>
								<th>Public</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{settings.map( ( setting ) => (
								<tr key={setting._id}>
									<td>{setting.group}</td>
									<td><code>{setting.optionKey}</code></td>
									<td>{setting.optionName}</td>
									<td>{setting.optionType}</td>
									<td className="setting-value">{typeof setting.optionValue === 'object' ? JSON.stringify( setting.optionValue ) : String( setting.optionValue ?? '' )}</td>
									<td>{setting.optionIsPublic ? 'Yes' : 'No'}</td>
									<td className="actions">
										<button className="btn btn-sm btn-filled-blue btn-round" onClick={() => openEditModal( setting )}>
											<FontAwesomeIcon icon="edit" /> Edit
										</button>
									</td>
								</tr>
							) )}
						</tbody>
					</table>
				)}
			</div>

			<EntityFormModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen( false )}
				title="Add Setting"
				fields={settingFields}
				onSubmit={handleAddSetting}
				submitLabel="Create Setting"
			/>

			<EntityFormModal
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				title="Edit Setting"
				fields={settingFields}
				onSubmit={handleEditSetting}
				submitLabel="Update Setting"
				initialValues={editingSetting ? {
					optionKey: editingSetting.optionKey,
					optionName: editingSetting.optionName,
					optionType: editingSetting.optionType,
					optionValue: typeof editingSetting.optionValue === 'object' ? JSON.stringify( editingSetting.optionValue ) : String( editingSetting.optionValue ?? '' ),
					group: editingSetting.group,
					optionIsPublic: editingSetting.optionIsPublic,
				} : null}
			/>
		</section>
	)
}

export default Settings

