import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Loader from './Loader/Loader'

const Login = () => {
	const { isLoading, isAuthenticated, login } = useAuth()

	const { addToast } = useToast()

	const navigate = useNavigate()

	const [ formData, setFormData ] = useState( {
		email: '',
		password: ''
	} )
	const [ isSubmitting, setIsSubmitting ] = useState( false )
	const [ errors, setErrors ] = useState( {} )

	useEffect( () => {
		if ( isAuthenticated ) {
			navigate( '/admin/events' )

			return
		}
	}, [ isAuthenticated, navigate ] )

	const handleInputChange = ( e ) => {
		const { name, value } = e.target

		setFormData( prev => ( {
			...prev,
			[ name ]: value
		} ) )

		if ( errors[ name ] ) {
			setErrors( prev => ( {
				...prev,
				[ name ]: ''
			} ) )
		}
	}

	const validateForm = () => {
		const newErrors = {}

		if ( !formData.email.trim() ) {
			newErrors.email = 'Email is required'
		} else if ( !/\S+@\S+\.\S+/.test( formData.email ) ) {
			newErrors.email = 'Please enter a valid email address'
		}

		if ( !formData.password.trim() ) {
			newErrors.password = 'Password is required'
		}

		setErrors( newErrors )

		return Object.keys( newErrors ).length === 0
	}

	const handleSubmit = async ( e ) => {
		e.preventDefault()

		if ( !validateForm() ) {
			return
		}

		setIsSubmitting( true )

		try {
			const result = await login( formData.email, formData.password )

			if ( result.success ) {
				addToast( 'Login successful!', 'success' )
			} else {
				addToast( result.error || 'Login failed', 'error' )
			}
		} catch ( error ) {
			console.error( 'Login error:', error )

			addToast( 'An unexpected error occurred', 'error' )
		} finally {
			setIsSubmitting( false )
		}
	}

	if ( isLoading || isAuthenticated ) {
		return <Loader />
	}

	return (
		<div className="login-page">
			<div className="login-container">
				<div className="login-logo">
					<h1>Clay Humane Events</h1>
				</div>

				<form className="login-form" onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							className={errors.email ? 'error' : ''}
							disabled={isSubmitting}
							autoComplete="email"
							autoFocus
						/>
						{errors.email && <span className="error-message">{errors.email}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleInputChange}
							className={errors.password ? 'error' : ''}
							disabled={isSubmitting}
							autoComplete="current-password"
						/>
						{errors.password && <span className="error-message">{errors.password}</span>}
					</div>

					<div className="login-actions">
						<button
							type="submit"
							disabled={isSubmitting}
							className="login-button"
						>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</button>
						<Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Login

