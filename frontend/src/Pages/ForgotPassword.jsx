import { useState } from 'react'
import { Link } from 'react-router-dom'

import API from '../inc/api'
import { useToast } from '../context/ToastContext'

const ForgotPassword = () => {
	const { showSuccess, showError } = useToast()

	const [ email, setEmail ] = useState( '' )
	const [ isSubmitting, setIsSubmitting ] = useState( false )
	const [ submitted, setSubmitted ] = useState( false )

	const handleSubmit = async ( e ) => {
		e.preventDefault()

		if ( !email.trim() ) {
			showError( 'Please enter your email address.' )
			return
		}

		setIsSubmitting( true )

		try {
			const response = await API.forgotPassword( email )

			if ( response?.error ) {
				showError( response.error )
			} else {
				setSubmitted( true )
				showSuccess( 'If an account with that email exists, a password reset link has been sent.' )
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
					<h1>Forgot Password</h1>
				</div>

				{submitted ? (
					<div className="forgot-password-success">
						<p>If an account with that email exists, a password reset link has been sent. Please check your inbox.</p>
						<Link to="/login" className="btn btn-md btn-filled-green btn-round">Back to Login</Link>
					</div>
				) : (
					<form className="login-form" onSubmit={handleSubmit}>
						<p className="forgot-password-description">Enter your email address and we'll send you a link to reset your password.</p>

						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								value={email}
								onChange={( e ) => setEmail( e.target.value )}
								disabled={isSubmitting}
								autoComplete="email"
								autoFocus
							/>
						</div>

						<div className="login-actions">
							<button type="submit" disabled={isSubmitting} className="login-button">
								{isSubmitting ? 'Sending...' : 'Send Reset Link'}
							</button>
							<Link to="/login" className="forgot-password-link">Back to Login</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	)
}

export default ForgotPassword

