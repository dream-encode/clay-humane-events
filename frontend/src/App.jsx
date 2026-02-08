import React from 'react'
import SiteHeader from './Components/Header'
import Main from './Components/Main'
import ToastContainer from './Components/Toast/ToastContainer'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider, useToast } from './context/ToastContext'

const AppContent = () => {
	const { toasts, removeToast } = useToast()

	let authContext

	try {
		authContext = useAuth()
	} catch ( error ) {
		console.warn( 'Auth context not available yet:', error.message )

		return null
	}

	const { isAuthenticated } = authContext

	return (
		<>
			{isAuthenticated && <SiteHeader />}
			<Main />
			<ToastContainer toasts={toasts} removeToast={removeToast} />
		</>
	)
}

const App = () => {
	return (
		<ThemeProvider>
			<ToastProvider>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</ToastProvider>
		</ThemeProvider>
	)
}

export default App

