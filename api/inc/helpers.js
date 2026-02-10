import { createHash, pbkdf2Sync, randomBytes } from 'crypto'

import AuthSessionService from '../services/authSession.js'

export const logFile = (log) => {
	console.log(`${new Date().toISOString()} - ${log}`)
}

export const hashPassword = (password) => {
	const salt = randomBytes(32).toString('hex')
	const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')

	return `${salt}:${hash}`
}

export const verifyPassword = (password, hashedPassword) => {
	const [salt, hash] = hashedPassword.split(':')
	const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')

	return hash === verifyHash
}

export const generateSecureToken = (length = 32) => {
	return randomBytes(length).toString('hex')
}

export const hashAuthToken = ( token ) => {
	if (!token || typeof token !== 'string') {
		return null
	}
	return createHash( 'sha256' ).update( token ).digest( 'hex' )
}

export const isValidEmail = (email) => {
	if (!email || typeof email !== 'string') {
		return false
	}

	const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/

	if (email.includes('..')) {
		return false
	}
	return emailRegex.test(email)
}

export const isValidPassword = (password) => {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/~`]{8,}$/

	return passwordRegex.test(password)
}

export const sanitizeUserForPublic = (user) => {
	const sanitized = { ...user }

	delete sanitized.password
	delete sanitized.loginAttempts
	delete sanitized.lockUntil
	delete sanitized.metadata

	return sanitized
}

export const validateAuth = async ( token, authCallback ) => {
	if (!token || typeof token !== 'string') {
		return authCallback( null, false )
	}

	const hashed = hashAuthToken( token )

	if (!hashed) {
		return authCallback( null, false )
	}

	const authCheck = await AuthSessionService.getUserByToken( hashed )

	if ( ! authCheck ) {
		return authCallback( null, false )
	}

	return authCallback(null, authCheck, { scope: 'all' })
}

export const allowedSearchKeys = () => {
	return [
		'key',
		'name',
	]
}

export const isValidSortKey = ( key ) => {
	const allowed = [
		'_id',
		'name',
		'createdAt',
		'updatedAt',
		'isActive',
		'eventName',
		'eventDate',
		'title',
		'dismissed',
		'notificationType',
		'action',
		'entityType',
		'userName',
		'to',
		'from',
		'subject',
		'emailType',
		'status',
		'sentAt',
		'type',
		'backupPath',
		'migrator',
		'label',
		'scheduledDate',
		'taskService',
		'taskMethod',
		'recurring',
		'optionKey',
		'optionName',
		'group',
		'note',
		'entityId',
	]

	return allowed.includes( key )
}

export const parseParamsWithDefaults = ( params ) => {
	const realParams = params

	const query = {}

	if ( realParams.search && realParams.searchKey && realParams.searchValue ) {
		const { searchKey, searchValue } = realParams

		const allowedKeys = allowedSearchKeys()

		if ( ! allowedKeys.includes( searchKey ) ) {
			throw new Error( 'Not a valid search key.' )
		}

		query[ searchKey ] = searchValue
	}

	let limit = false

	if ( realParams.limit && ! isNaN( realParams.limit ) ) {
		limit = parseInt( realParams.limit, 10 )
	}

	if ( ! realParams.all && ! Number.isInteger( limit ) ) {
		limit = 10
	}

	let page = 0

	if ( realParams.page && ! isNaN( realParams.page ) ) {
		page = parseInt( realParams.page, 10 )
	}

	let filters = {}

	if ( realParams.filters ) {
		if ( typeof realParams.filters === 'string' ) {
			realParams.filters.split( ',' ).forEach( ( filter ) => {
				const [ key, value ] = filter.split( ':' )
				if ( key && value ) {
					filters[ key ] = value
				}
			} )
		} else if ( typeof realParams.filters === 'object' ) {
			filters = realParams.filters
		}
	}

	Object.assign( query, filters )

	let sort = {}

	if ( realParams.sort ) {
		if ( typeof realParams.sort === 'object' && !Array.isArray( realParams.sort ) ) {
			Object.keys( realParams.sort ).forEach( ( sortKey ) => {
				if ( isValidSortKey( sortKey ) ) {
					sort[ sortKey ] = realParams.sort[ sortKey ]
				}
			} )
		} else if ( Array.isArray( realParams.sort ) ) {
			realParams.sort.forEach( ( sortColumn ) => {
				let sortKey = sortColumn,
					sortOrder = 1

				if ( sortKey.startsWith( '!' ) ) {
					sortKey = sortKey.substring( 1 )
					sortOrder = -1
				}

				if ( isValidSortKey( sortKey ) ) {
					sort[ sortKey ] = sortOrder
				}
			} )
		} else {
			let sortKey = realParams.sort,
				sortOrder = 1

			if ( sortKey.startsWith( '!' ) ) {
				sortKey = sortKey.substring( 1 )
				sortOrder = -1
			}

			if ( isValidSortKey( sortKey ) ) {
				sort[ sortKey ] = sortOrder
			}
		}
	}

	if ( Object.keys( sort ).length === 0 ) {
		sort = {
			createdAt: -1
		}
	}

	let after = null
	let before = null
	let cursorField = '_id'

	if ( realParams.after ) {
		after = realParams.after
	}

	if ( realParams.before ) {
		before = realParams.before
	}

	if ( realParams.cursorField ) {
		cursorField = realParams.cursorField
	}

	return {
		query,
		limit,
		page,
		sort,
		filters,
		after,
		before,
		cursorField,
	}
}

export const formatAdminListResponse = ( items, entityType ) => {
	if (!Array.isArray(items)) {
		return items
	}

	return items.map(item => {
		const formattedItem = { ...item.toObject ? item.toObject() : item }

		if (formattedItem.createdAt) {
			formattedItem.createdAt = new Date(formattedItem.createdAt).toISOString()
		}
		if (formattedItem.updatedAt) {
			formattedItem.updatedAt = new Date(formattedItem.updatedAt).toISOString()
		}

		formattedItem.actions = getAdminActionButtons(entityType, formattedItem)

		return formattedItem
	})
}

export const getAdminActionButtons = ( entityType, item ) => {
	const actions = []

	actions.push(
		{
			type: 'edit',
			label: 'Edit',
			url: `/admin/${entityType}/${item._id}/edit`
		},
		{
			type: 'delete',
			label: 'Delete',
			url: `/admin/${entityType}/${item._id}/delete`,
			confirm: true
		}
	)

	return actions
}

