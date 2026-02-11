import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import API from '../inc/api'
import { useToast } from '../context/ToastContext'

const SetPassword = () => {
	const { token } = useParams()
	const { showSuccess, showError } = useToast()

	const [ password, setPassword ] = useState( '' )
	const [ confirmPassword, setConfirmPassword ] = useState( '' )
	const [ isSubmitting, setIsSubmitting ] = useState( false )
	const [ setComplete, setSetComplete ] = useState( false )
	const [ errors, setErrors ] = useState( {} )

	const validate = () => {
		const newErrors = {}

		if ( !password.trim() ) {
			newErrors.password = 'Password is required.'
		} else if ( password.length < 8 ) {
			newErrors.password = 'Password must be at least 8 characters.'
		} else if ( !/[A-Z]/.test( password ) || !/[a-z]/.test( password ) || !/[0-9]/.test( password ) || !/[^A-Za-z0-9]/.test( password ) ) {
			newErrors.password = 'Password must contain uppercase, lowercase, a number, and a special character.'
		}

		if ( password !== confirmPassword ) {
			newErrors.confirmPassword = 'Passwords do not match.'
		}

		setErrors( newErrors )

		return Object.keys( newErrors ).length === 0
	}

	const handleSubmit = async ( e ) => {
		e.preventDefault()

		if ( !validate() ) {
			return
		}

		setIsSubmitting( true )

		try {
			const response = await API.setPassword( token, password )

			if ( response?.error ) {
				showError( response.error )
			} else {
				setSetComplete( true )
				showSuccess( 'Your password has been set successfully.' )
			}
		} catch ( error ) {
			showError( 'An unexpected error occurred.' )
		} finally {
			setIsSubmitting( false )
		}
	}

	return (
		<div className="login-page">
			<div className="login-container">
				<div className="login-logo">
					<h1>Set Your Password</h1>
				</div>

				{setComplete ? (
					<div className="forgot-password-success">
						<p>Your password has been set successfully. You can now log in with your new password.</p>
						<Link to="/login" className="btn btn-md btn-filled-green btn-round">Go to Login</Link>
					</div>
				) : (
					<form className="login-form" onSubmit={handleSubmit}>
						<p className="forgot-password-description">Create a strong password for your account. It must be at least 8 characters with uppercase, lowercase, a number, and a special character.</p>

						<div className="form-group">
							<label htmlFor="password">Password</label>
							<input
								type="password"
								id="password"
								name="password"
								value={password}
								onChange={( e ) => { setPassword( e.target.value ); if ( errors.password ) setErrors( ( prev ) => ( { ...prev, password: '' } ) ) }}
								className={errors.password ? 'error' : ''}
								disabled={isSubmitting}
								autoComplete="new-password"
								autoFocus
							/>
							{errors.password && <span className="error-message">{errors.password}</span>}
						</div>

						<div className="form-group">
							<label htmlFor="confirmPassword">Confirm Password</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								value={confirmPassword}
								onChange={( e ) => { setConfirmPassword( e.target.value ); if ( errors.confirmPassword ) setErrors( ( prev ) => ( { ...prev, confirmPassword: '' } ) ) }}
								className={errors.confirmPassword ? 'error' : ''}
								disabled={isSubmitting}
								autoComplete="new-password"
							/>
							{errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
						</div>

						<div className="login-actions">
							<button type="submit" disabled={isSubmitting} className="login-button">
								{isSubmitting ? 'Setting Password...' : 'Set Password'}
							</button>
							<Link to="/login" className="forgot-password-link">Back to Login</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	)
}

export default SetPassword

