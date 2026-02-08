import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { getLocalStorage, setLocalStorage } from '../inc/helpers'

const THEME_STORAGE_KEY = 'theme'

const ThemeContext = createContext()

export const useTheme = () => {
	const context = useContext( ThemeContext )

	if ( !context ) {
		throw new Error( 'useTheme must be used within a ThemeProvider' )
	}

	return context
}

export const ThemeProvider = ( { children } ) => {
	const [ isDarkMode, setIsDarkMode ] = useState( () => {
		const savedTheme = getLocalStorage( THEME_STORAGE_KEY )

		if ( savedTheme ) {
			return savedTheme === 'dark'
		}

		return false
	} )

	const applyTheme = useCallback( ( dark ) => {
		if ( dark ) {
			document.documentElement.classList.add( 'dark' )
			document.documentElement.classList.remove( 'light' )
		} else {
			document.documentElement.classList.add( 'light' )
			document.documentElement.classList.remove( 'dark' )
		}
	}, [] )

	useEffect( () => {
		const themeValue = isDarkMode ? 'dark' : 'light'

		setLocalStorage( THEME_STORAGE_KEY, themeValue )
		applyTheme( isDarkMode )
	}, [ isDarkMode, applyTheme ] )

	const toggleTheme = useCallback( () => {
		setIsDarkMode( ( prev ) => !prev )
	}, [] )

	const setTheme = useCallback( ( theme ) => {
		if ( theme === 'dark' || theme === 'light' ) {
			setIsDarkMode( theme === 'dark' )
		}
	}, [] )

	const value = {
		isDarkMode,
		theme: isDarkMode ? 'dark' : 'light',
		toggleTheme,
		setTheme
	}

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	)
}

export default ThemeContext

