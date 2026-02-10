const LOCAL_STORAGE_NAMESPACE = 'clay-humane-events'

export const setLocalStorage = ( key, value, lifetime ) => {
	const time = new Date()

	const item = {
		value: value,
	}

	if ( lifetime ) {
		item.expiration = time.getTime() + lifetime * 1000
	}

	localStorage.setItem( `${ LOCAL_STORAGE_NAMESPACE }-${ key }`, JSON.stringify( item ) )
}

export const getLocalStorage = ( key ) => {
	const stored = localStorage.getItem( `${ LOCAL_STORAGE_NAMESPACE }-${ key }` )

	if ( !stored ) {
		return false
	}

	const item = JSON.parse( stored )

	if ( item.expiration ) {
		const time = new Date()

		if ( time.getTime() > item.expiration ) {
			deleteLocalStorage( key )

			return false
		}
	}

	return item.value
}

export const deleteLocalStorage = ( key ) => {
	localStorage.removeItem( `${ LOCAL_STORAGE_NAMESPACE }-${ key }` )
}

export const isPublicApiEndpoint = ( endpoint ) => {
	return endpoint.includes( 'auth' ) ||
		   endpoint.includes( 'user/login' ) ||
		   endpoint.includes( 'user/register' ) ||
		   endpoint.includes( 'event/key/' ) ||
		   endpoint.includes( 'event/public/open' ) ||
		   endpoint.includes( 'eventRegistration/register' )
}

export const stripHtml = ( html ) => {
	if ( !html ) return ''

	const doc = new DOMParser().parseFromString( html, 'text/html' )

	return doc.body.textContent || ''
}

export const truncateText = ( text, maxLength = 150 ) => {
	if ( !text || text.length <= maxLength ) return text

	return text.substring( 0, maxLength ).trimEnd() + '...'
}

export const formatRelativeTime = ( date ) => {
	if ( !date ) {
		return 'Unknown'
	}

	const dateObj = typeof date === 'string' ? new Date( date ) : date
	const now = new Date()
	const diffInSeconds = Math.floor( ( now - dateObj ) / 1000 )

	if ( diffInSeconds < 30 ) {
		return 'Just now'
	}

	if ( diffInSeconds < 60 ) {
		return `${ diffInSeconds } seconds ago`
	}

	const diffInMinutes = Math.floor( diffInSeconds / 60 )
	if ( diffInMinutes < 60 ) {
		return `${ diffInMinutes } minute${ diffInMinutes !== 1 ? 's' : '' } ago`
	}

	const diffInHours = Math.floor( diffInMinutes / 60 )
	if ( diffInHours < 24 ) {
		return `${ diffInHours } hour${ diffInHours !== 1 ? 's' : '' } ago`
	}

	const diffInDays = Math.floor( diffInHours / 24 )
	if ( diffInDays < 30 ) {
		return `${ diffInDays } day${ diffInDays !== 1 ? 's' : '' } ago`
	}

	const diffInMonths = Math.floor( diffInDays / 30 )
	if ( diffInMonths < 12 ) {
		return `${ diffInMonths } month${ diffInMonths !== 1 ? 's' : '' } ago`
	}

	const diffInYears = Math.floor( diffInMonths / 12 )
	return `${ diffInYears } year${ diffInYears !== 1 ? 's' : '' } ago`
}

