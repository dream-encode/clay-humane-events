import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => {
	const context = useContext( ToastContext )
	if ( !context ) {
		throw new Error( 'useToast must be used within a ToastProvider' )
	}
	return context
}

export const ToastProvider = ( { children } ) => {
	const [ toasts, setToasts ] = useState( [] )

	const addToast = ( message, type = 'info', duration = 4000, icon = null ) => {
		const id = Date.now() + Math.random()
		const newToast = {
			id,
			message,
			type,
			duration,
			icon
		}

		setToasts( prev => [ ...prev, newToast ] )
		return id
	}

	const removeToast = ( id ) => {
		setToasts( prev => prev.filter( toast => toast.id !== id ) )
	}

	const showSuccess = ( message, duration, icon ) => addToast( message, 'success', duration, icon )
	const showError = ( message, duration, icon ) => addToast( message, 'error', duration, icon )
	const showWarning = ( message, duration, icon ) => addToast( message, 'warning', duration, icon )
	const showInfo = ( message, duration, icon ) => addToast( message, 'info', duration, icon )

	const value = {
		toasts,
		addToast,
		removeToast,
		showSuccess,
		showError,
		showWarning,
		showInfo
	}

	return (
		<ToastContext.Provider value={value}>
			{children}
		</ToastContext.Provider>
	)
}

export default ToastContext

