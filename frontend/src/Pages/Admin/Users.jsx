import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import API from '../../inc/api'
import CONFIG from '../../inc/config'
import EntityFormModal from '../../Components/Modal/EntityFormModal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const formatLastLogin = ( dateString ) => {
	if ( !dateString ) return 'Never'

	const date = new Date( dateString )

	return date.toLocaleDateString( 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } )
}

const Users = () => {
	const { user } = useAuth()
	const { showSuccess, showError } = useToast()

	const [ users, setUsers ] = useState( [] )
	const [ loading, setLoading ] = useState( true )
	const [ isAddModalOpen, setIsAddModalOpen ] = useState( false )
	const [ editingUser, setEditingUser ] = useState( null )
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false )

	const roleOptions = user?.role === 'superadmin'
		? [
			{ value: 'user', label: 'User' },
			{ value: 'admin', label: 'Admin' },
			{ value: 'superadmin', label: 'Superadmin' },
		]
		: [ { value: 'user', label: 'User' } ]

	const userFields = [
		{ name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
		{ name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
		{ name: 'role', label: 'Role', type: 'select', required: true, placeholder: 'Select role', options: roleOptions },
	]

	const loadUsers = useCallback( async () => {
		setLoading( true )

		const response = await API.getEntities( 'user' )

		if ( Array.isArray( response ) ) {
			setUsers( response )
		}

		setLoading( false )
	}, [] )

	useEffect( () => {
		loadUsers()
	}, [ loadUsers ] )

	const handleAddUser = async ( formData ) => {
		const response = await API.registerUser( formData )

		if ( response?.error ) {
			showError( response.error )
			throw new Error( response.error )
		}

		showSuccess( 'User created successfully.' )
		loadUsers()
	}

	const handleEditUser = async ( formData ) => {
		const response = await API.updateEntity( 'user', editingUser._id, formData )

		if ( response?.error ) {
			showError( response.message || response.error )
			throw new Error( response.message || response.error )
		}

		showSuccess( 'User updated successfully.' )
		setEditingUser( null )
		loadUsers()
	}

	const openEditModal = ( u ) => {
		setEditingUser( u )
		setIsEditModalOpen( true )
	}

	const closeEditModal = () => {
		setIsEditModalOpen( false )
		setEditingUser( null )
	}

	return (
		<section className="page users">
			<div className="page-header">
				<h2>Users</h2>
				<div className="page-header-actions">
					<button className="btn btn-md btn-filled-green btn-round" onClick={() => setIsAddModalOpen( true )}>
						<FontAwesomeIcon icon="plus" /> Add User
					</button>
				</div>
			</div>

			<div className="section">
				{ loading ? (
					<p>Loading users...</p>
				) : users.length === 0 ? (
					<p>No users to display.</p>
				) : (
					<table className="entity-table">
						<thead>
							<tr>
								<th className="avatar-col"></th>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th>Last Login</th>
								<th className="actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{ users.map( ( u ) => (
								<tr key={u._id}>
									<td className="avatar-col">
										{u.avatar ? (
											<img src={`${ CONFIG.API_URL }${ u.avatar }`} alt="" className="user-table-avatar" />
										) : (
											<div className="user-table-avatar-placeholder">
												<FontAwesomeIcon icon="user" />
											</div>
										)}
									</td>
									<td>{u.firstName} {u.lastName}</td>
									<td>{u.email}</td>
									<td>{u.role}</td>
									<td>{formatLastLogin( u.lastLogin )}</td>
									<td className="actions">
										<button className="btn btn-sm btn-filled-blue btn-round" onClick={() => openEditModal( u )}>
											<FontAwesomeIcon icon="edit" /> Edit
										</button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</div>

			<EntityFormModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen( false )}
				title="Add User"
				fields={userFields}
				onSubmit={handleAddUser}
				submitLabel="Create User"
			/>

			<EntityFormModal
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				title="Edit User"
				fields={userFields}
				onSubmit={handleEditUser}
				submitLabel="Update User"
				initialValues={editingUser ? {
					firstName: editingUser.firstName,
					lastName: editingUser.lastName,
					email: editingUser.email,
					role: editingUser.role,
				} : null}
			/>
		</section>
	)
}

export default Users

