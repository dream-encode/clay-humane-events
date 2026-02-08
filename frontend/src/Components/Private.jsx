import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Loader from './Loader/Loader'

const PrivateRoute = () => {
	const { isAuthenticated, isLoading, setIsLoading } = useAuth()

	const navigate = useNavigate()

	useEffect( () => {
		if ( isAuthenticated && isLoading ) {
			const timer = setTimeout( () => {
				setIsLoading( false )
			}, 100 )

			return () => {
				clearTimeout( timer )
			}
		}
	}, [ isAuthenticated, isLoading, setIsLoading ] )

	if ( isLoading ) {
		return <Loader />
	}

	if ( !isAuthenticated ) {
		navigate( '/login' )

		return null
	}

	return <Outlet />
}

export default PrivateRoute

