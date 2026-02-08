import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import API, { setAuthContext } from '../inc/api'
import { deleteLocalStorage, getLocalStorage, setLocalStorage } from '../inc/helpers'
import { useTheme } from './ThemeContext'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export const useAuth = () => {
	const context = useContext( AuthContext )

	if ( !context ) {
		throw new Error( 'useAuth must be used within an AuthProvider' )
	}

	return context
}

export const AuthProvider = ( { children } ) => {
	const [ user, setUser ] = useState( null )
	const [ isAuthenticated, setIsAuthenticated ] = useState( false )
	const [ isLoading, setIsLoading ] = useState( true )
	const [ authToken, setAuthToken ] = useState( null )

	const navigate = useNavigate()

	const { addToast } = useToast()
	const { setTheme } = useTheme()

	useEffect( () => {
		checkAuthStatus()
	}, [] )

	useEffect( () => {
		const authContextObj = { logout, addToast }

		setAuthContext( authContextObj )
	}, [ addToast ] )

	const checkAuthStatus = async () => {
		try {
			const token = getLocalStorage( 'authToken' )

			if ( !token ) {
				setIsLoading( false )
				return
			}

			setAuthToken( token )

			const userProfile = await API.getCurrentUserProfile()

			const hasError = userProfile?.error || ( userProfile?.message && !userProfile?._id && !userProfile?.email )

			if ( userProfile && !hasError ) {
				setUser( userProfile )
				setIsAuthenticated( true )

				if ( userProfile.preferredTheme ) {
					setTheme( userProfile.preferredTheme )
				}
			} else {
				deleteLocalStorage( 'authToken' )
				setAuthToken( null )
				setUser( null )
				setIsAuthenticated( false )
			}
		} catch ( error ) {
			console.error( 'Auth check failed:', error )

			deleteLocalStorage( 'authToken' )
			setAuthToken( null )
			setUser( null )
			setIsAuthenticated( false )
		} finally {
			setIsLoading( false )
		}
	}

	const login = async ( email, password ) => {
		try {
			setIsLoading( true )

			const response = await API.loginUser( email, password )

			const hasError = response?.error || ( response?.message && !response?.token )

			if ( response && !hasError ) {
				const { token, user: userData } = response

				setLocalStorage( 'authToken', token )
				setAuthToken( token )
				setUser( userData )
				setIsAuthenticated( true )

				if ( userData.preferredTheme ) {
					setTheme( userData.preferredTheme )
				}

				return { success: true }
			} else {
				setIsLoading( false )

				return {
					success: false,
					error: response?.error || response?.message || 'Login failed'
				}
			}
		} catch ( error ) {
			console.error( 'Login error:', error )

			setIsLoading( false )

			return {
				success: false,
				error: error.message || 'Login failed'
			}
		}
	}

	const logout = () => {
		deleteLocalStorage( 'authToken' )
		setAuthToken( null )
		setUser( null )
		setIsAuthenticated( false )

		navigate( '/login' )
	}

	const value = {
		user,
		setUser,
		isAuthenticated,
		isLoading,
		authToken,
		login,
		logout,
		checkAuthStatus,
		setIsLoading
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthContext

