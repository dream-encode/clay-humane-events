import { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import API from '../inc/api'
import CONFIG from '../inc/config'

const Profile = () => {
	const { user, setUser } = useAuth()
	const { addToast } = useToast()
	const fileInputRef = useRef( null )

	const [ firstName, setFirstName ] = useState( user?.firstName || '' )
	const [ lastName, setLastName ] = useState( user?.lastName || '' )
	const [ isSaving, setIsSaving ] = useState( false )
	const [ isUploading, setIsUploading ] = useState( false )
	const [ currentPassword, setCurrentPassword ] = useState( '' )
	const [ newPassword, setNewPassword ] = useState( '' )
	const [ confirmPassword, setConfirmPassword ] = useState( '' )
	const [ isChangingPassword, setIsChangingPassword ] = useState( false )

	const getAvatarUrl = () => {
		if ( !user?.avatar ) {
			return null
		}

		return `${ CONFIG.API_URL }${ user.avatar }`
	}

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleAvatarChange = async ( e ) => {
		const file = e.target.files?.[ 0 ]

		if ( !file ) {
			return
		}

		setIsUploading( true )

		try {
			const result = await API.uploadAvatar( file )

			if ( result?.error ) {
				addToast( result.message || 'Failed to upload avatar.', 'error' )
				return
			}

			setUser( result )
			addToast( 'Avatar updated successfully.', 'success' )
		} catch ( error ) {
			addToast( 'Failed to upload avatar.', 'error' )
		} finally {
			setIsUploading( false )
			e.target.value = ''
		}
	}

	const handleSave = async ( e ) => {
		e.preventDefault()

		if ( !firstName.trim() || !lastName.trim() ) {
			addToast( 'First name and last name are required.', 'error' )
			return
		}

		setIsSaving( true )

		try {
			const result = await API.updateUserProfile( { firstName: firstName.trim(), lastName: lastName.trim() } )

			if ( result?.message && !result?._id ) {
				addToast( result.message || 'Failed to update profile.', 'error' )
				return
			}

			setUser( result )
			addToast( 'Profile updated successfully.', 'success' )
		} catch ( error ) {
			addToast( 'Failed to update profile.', 'error' )
		} finally {
			setIsSaving( false )
		}
	}

	const handleChangePassword = async ( e ) => {
		e.preventDefault()

		if ( !currentPassword || !newPassword || !confirmPassword ) {
			addToast( 'All password fields are required.', 'error' )
			return
		}

		if ( newPassword !== confirmPassword ) {
			addToast( 'New password and confirmation do not match.', 'error' )
			return
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/

		if ( !passwordRegex.test( newPassword ) ) {
			addToast( 'Password must be at least 8 characters with uppercase, lowercase, and number.', 'error' )
			return
		}

		setIsChangingPassword( true )

		try {
			const result = await API.changePassword( currentPassword, newPassword )

			if ( result?.error ) {
				addToast( result.error, 'error' )
				return
			}

			setCurrentPassword( '' )
			setNewPassword( '' )
			setConfirmPassword( '' )
			addToast( 'Password changed successfully.', 'success' )
		} catch ( error ) {
			addToast( error?.message || 'Failed to change password.', 'error' )
		} finally {
			setIsChangingPassword( false )
		}
	}

	if ( !user ) {
		return null
	}

	const avatarUrl = getAvatarUrl()

	return (
		<section className="profile-page">
			<div className="profile-container">
				<h1>Edit Profile</h1>

				<div className="profile-avatar-section">
					<div className="profile-avatar" onClick={handleAvatarClick}>
						{avatarUrl ? (
							<img src={avatarUrl} alt="Avatar" />
						) : (
							<div className="profile-avatar-placeholder">
								<FontAwesomeIcon icon="user" />
							</div>
						)}
						<div className="profile-avatar-overlay">
							<FontAwesomeIcon icon="camera" />
						</div>
						{isUploading && (
							<div className="profile-avatar-loading">
								<FontAwesomeIcon icon="spinner" spin />
							</div>
						)}
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp"
						onChange={handleAvatarChange}
						hidden
					/>
					<p className="profile-avatar-hint">Click to change avatar</p>
				</div>

				<form className="profile-form" onSubmit={handleSave}>
					<div className="profile-form-group">
						<label>Email</label>
						<input type="email" value={user.email} disabled />
					</div>

					<div className="profile-form-group">
						<label>First Name</label>
						<input type="text" value={firstName} onChange={( e ) => setFirstName( e.target.value )} required />
					</div>

					<div className="profile-form-group">
						<label>Last Name</label>
						<input type="text" value={lastName} onChange={( e ) => setLastName( e.target.value )} required />
					</div>

					<div className="profile-form-actions">
						<button type="submit" className="btn btn-primary" disabled={isSaving}>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>

				<hr className="profile-divider" />

				<h2 className="profile-section-title">Change Password</h2>
				<form className="profile-form" onSubmit={handleChangePassword}>
					<div className="profile-form-group">
						<label>Current Password</label>
						<input type="password" value={currentPassword} onChange={( e ) => setCurrentPassword( e.target.value )} required />
					</div>

					<div className="profile-form-group">
						<label>New Password</label>
						<input type="password" value={newPassword} onChange={( e ) => setNewPassword( e.target.value )} required />
					</div>

					<div className="profile-form-group">
						<label>Confirm New Password</label>
						<input type="password" value={confirmPassword} onChange={( e ) => setConfirmPassword( e.target.value )} required />
					</div>

					<p className="profile-password-hint">Must be at least 8 characters with uppercase, lowercase, and number.</p>

					<div className="profile-form-actions">
						<button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
							{isChangingPassword ? 'Changing...' : 'Change Password'}
						</button>
					</div>
				</form>
			</div>
		</section>
	)
}

export default Profile

