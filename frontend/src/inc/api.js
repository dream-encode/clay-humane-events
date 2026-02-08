import CONFIG from './config'
import { getLocalStorage, isPublicApiEndpoint } from './helpers'

let authContext = null

export const setAuthContext = ( context ) => {
	authContext = context
}

const handleSessionExpired = () => {
	console.warn( 'Session expired - redirecting to login' )

	if ( authContext ) {
		authContext.addToast( 'Your session has expired. Please log in again.', 'warning', 7000, 'exclamation-triangle' )
		authContext.logout()
	} else {
		localStorage.removeItem( 'clay-humane-events-authToken' )
		window.location.pathname = '/login'
	}
}

class API {
	async apiGetRequest ( endpoint, params = {} ) {
		const headers = new Headers( {
			'Content-Type': 'application/json'
		} )

		if ( !isPublicApiEndpoint( endpoint ) ) {
			const accessToken = getLocalStorage( 'authToken' )

			if ( !accessToken ) {
				return Promise.resolve()
			}

			headers.append( 'Authorization', `Bearer ${ accessToken }` )
		}

		const queryStringParts = []

		Object.keys( params ).forEach( ( key ) => {
			if ( params[ key ] !== undefined && params[ key ] !== null ) {
				queryStringParts.push( `${ key }=${ encodeURIComponent( params[ key ] ) }` )
			}
		} )

		const queryString = queryStringParts.join( '&' )

		if ( queryString ) {
			endpoint += `/?${ queryString }`
		}

		try {
			const response = await fetch( `${ CONFIG.API_URL }/${ endpoint }`, {
				mode: 'cors',
				headers
			} )

			if ( response.status === 401 && !isPublicApiEndpoint( endpoint ) ) {
				handleSessionExpired()
				return { error: true, message: 'Session expired' }
			}

			const json = await response.json()

			if ( !json ) {
				throw new Error( json )
			}

			return json
		} catch ( error ) {
			console.warn( error )
		}
	}

	async apiPostRequest ( endpoint, postParams = {} ) {
		const headers = new Headers( {
			'Content-Type': 'application/json'
		} )

		if ( !isPublicApiEndpoint( endpoint ) ) {
			const accessToken = getLocalStorage( 'authToken' )

			if ( !accessToken ) {
				return Promise.resolve()
			}

			headers.append( 'Authorization', `Bearer ${ accessToken }` )
		}

		const response = await fetch( `${ CONFIG.API_URL }/${ endpoint }`, {
			method: 'POST',
			mode: 'cors',
			headers,
			body: JSON.stringify( postParams )
		} )

		if ( response.status === 401 ) {
			if ( !isPublicApiEndpoint( endpoint ) ) {
				handleSessionExpired()
				return { error: true, message: 'Session expired' }
			} else {
				return { error: 'Login failed' }
			}
		}

		const json = await response.json()

		return json
	}

	async apiPutRequest ( endpoint, putParams = {} ) {
		const headers = new Headers( {
			'Content-Type': 'application/json'
		} )

		if ( !isPublicApiEndpoint( endpoint ) ) {
			const accessToken = getLocalStorage( 'authToken' )

			if ( !accessToken ) {
				return Promise.resolve()
			}

			headers.append( 'Authorization', `Bearer ${ accessToken }` )
		}

		const response = await fetch( `${ CONFIG.API_URL }/${ endpoint }`, {
			method: 'PUT',
			mode: 'cors',
			headers,
			body: JSON.stringify( putParams )
		} )

		if ( response.status === 401 && !isPublicApiEndpoint( endpoint ) ) {
			handleSessionExpired()
			return { error: true, message: 'Session expired' }
		}

		const json = await response.json()

		return json
	}

	async apiDeleteRequest ( endpoint ) {
		const headers = new Headers( {
			'Content-Type': 'application/json'
		} )

		if ( !isPublicApiEndpoint( endpoint ) ) {
			const accessToken = getLocalStorage( 'authToken' )

			if ( !accessToken ) {
				return Promise.resolve()
			}

			headers.append( 'Authorization', `Bearer ${ accessToken }` )
		}

		const params = {
			method: 'DELETE',
			mode: 'cors',
			headers
		}

		const response = await fetch( `${ CONFIG.API_URL }/${ endpoint }`, params )

		if ( response.status === 401 && !isPublicApiEndpoint( endpoint ) ) {
			handleSessionExpired()
			return { error: true, message: 'Session expired' }
		}

		return response
	}

	async registerUser ( userData ) {
		return this.apiPostRequest( 'user/register', userData )
	}

	async loginUser ( email, password ) {
		return this.apiPostRequest( 'user/login', { email, password } )
	}

	async forgotPassword ( email ) {
		return this.apiPostRequest( 'auth/forgot-password', { email } )
	}

	async resetPassword ( token, password ) {
		return this.apiPostRequest( 'auth/reset-password', { token, password } )
	}

	async changePassword ( currentPassword, newPassword ) {
		return this.apiPostRequest( 'user/change-password', { currentPassword, newPassword } )
	}

	async getCurrentUserProfile () {
		return this.apiGetRequest( 'user/profile' )
	}

	async getEntityByID ( type, id ) {
		return this.apiGetRequest( `${ type }/id/${ id }` )
	}

	async getEntityByKey ( type, key ) {
		return this.apiGetRequest( `${ type }/key/${ key }` )
	}

	async getEntities ( type, params = {} ) {
		return this.apiGetRequest( type, params )
	}

	async searchEntities ( type, searchTerm ) {
		return this.apiGetRequest( `${ type }/search`, { searchTerm } )
	}

	async insertEntity ( type, data ) {
		return this.apiPostRequest( type, data )
	}

	async updateEntity ( type, id, data ) {
		return this.apiPostRequest( `${ type }/${ id }`, data )
	}

	async deleteEntity ( type, id ) {
		return this.apiDeleteRequest( `${ type }/${ id }` )
	}

	async getUserById ( userId ) {
		return this.apiGetRequest( `user/${ userId }` )
	}

	async updateUserById ( userId, userData ) {
		return this.apiPutRequest( `user/${ userId }`, userData )
	}

	async changeUserRole ( userId, role ) {
		return this.apiPostRequest( `user/${ userId }/change-role`, { role } )
	}

	async deactivateUser ( userId ) {
		return this.apiPostRequest( `user/${ userId }/deactivate` )
	}

	async reactivateUser ( userId ) {
		return this.apiPostRequest( `user/${ userId }/reactivate` )
	}

	async getPublicEventByKey ( eventKey ) {
		return this.apiGetRequest( `event/key/${ eventKey }` )
	}

	async getNextEvent () {
		return this.apiGetRequest( 'event/next' )
	}

	async getOpenRegistrationEvents () {
		return this.apiGetRequest( 'event/public/open' )
	}

	async registerForEvent ( registrationData ) {
		return this.apiPostRequest( 'eventRegistration/register', registrationData )
	}

	async getAllRegistrations ( filters = {} ) {
		return this.apiGetRequest( 'eventRegistration/all', filters )
	}

	async getRegistrationCounts () {
		return this.apiGetRequest( 'eventRegistration/counts' )
	}

	async getRegistrationsByEvent ( eventId ) {
		return this.apiGetRequest( `eventRegistration/event/${ eventId }` )
	}

	async getRegistrationsByUser ( userId ) {
		return this.apiGetRequest( `eventRegistration/user/${ userId }` )
	}

	async updateUserProfile ( userData ) {
		return this.apiPutRequest( 'user/profile', userData )
	}

	async uploadAvatar ( file ) {
		return this._uploadFile( `user/upload-avatar`, 'avatar', file )
	}

	async uploadEventLogo ( eventId, file ) {
		return this._uploadFile( `event/${ eventId }/upload-logo`, 'logo', file )
	}

	async deleteEventLogo ( eventId ) {
		return this.apiPostRequest( `event/${ eventId }/delete-logo` )
	}

	async uploadEventFlyer ( eventId, file ) {
		return this._uploadFile( `event/${ eventId }/upload-flyer`, 'flyer', file )
	}

	async deleteEventFlyer ( eventId, filePath ) {
		return this.apiPostRequest( `event/${ eventId }/delete-flyer`, { filePath } )
	}

	async uploadEventWaiver ( eventId, file ) {
		return this._uploadFile( `event/${ eventId }/upload-waiver`, 'waiver', file )
	}

	async deleteEventWaiver ( eventId, filePath ) {
		return this.apiPostRequest( `event/${ eventId }/delete-waiver`, { filePath } )
	}

	async getEmailTemplateTypes () {
		return this.apiGetRequest( 'emailTemplate/types' )
	}

	async resolveEmailTemplate ( templateType, eventId = null ) {
		const params = eventId ? { eventId } : {}
		return this.apiGetRequest( `emailTemplate/resolve/${ templateType }`, params )
	}

	async saveEmailTemplate ( templateData ) {
		return this.apiPutRequest( 'emailTemplate/save', templateData )
	}

	async previewEmailTemplate ( subject, body, variables ) {
		return this.apiPostRequest( 'emailTemplate/preview', { subject, body, variables } )
	}

	async resetEmailTemplate ( templateType, eventId = null ) {
		return this.apiPostRequest( `emailTemplate/reset/${ templateType }`, { eventId } )
	}

	async sendEmail ( emailData ) {
		return this.apiPostRequest( 'email/send/email', emailData )
	}

	async resendEmail ( emailId ) {
		return this.apiPostRequest( `email/${ emailId }/resend` )
	}

	async getActiveBackupOperations () {
		return this.apiGetRequest( 'databaseBackup/active' )
	}

	async getBackupsByType ( type ) {
		return this.apiGetRequest( `databaseBackup/type/${ type }` )
	}

	async cancelBackupOperation ( operationId ) {
		return this.apiPostRequest( `databaseBackup/${ operationId }/cancel` )
	}

	async getMigrationProgress ( migrationId ) {
		return this.apiGetRequest( `dataMigration/id/${ migrationId }/progress` )
	}

	async getLatestMigrationByMigrator ( migrator ) {
		return this.apiGetRequest( `dataMigration/migrator/${ migrator }/latest` )
	}

	async cancelMigration ( migrationId ) {
		return this.apiPostRequest( `dataMigration/id/${ migrationId }/cancel` )
	}

	async getPendingScheduledTasks () {
		return this.apiGetRequest( 'scheduledTask/pending' )
	}

	async getRecurringScheduledTasks () {
		return this.apiGetRequest( 'scheduledTask/recurring' )
	}

	async getScheduledTaskFrequencies () {
		return this.apiGetRequest( 'scheduledTask/frequencies' )
	}

	async completeScheduledTask ( taskId ) {
		return this.apiPostRequest( `scheduledTask/${ taskId }/complete` )
	}

	async failScheduledTask ( taskId, error ) {
		return this.apiPostRequest( `scheduledTask/${ taskId }/fail`, { error } )
	}

	async getScheduledTaskLogs ( taskId ) {
		return this.apiGetRequest( `scheduledTask/${ taskId }/logs` )
	}

	async getPublicSiteOptions () {
		return this.apiGetRequest( 'siteOption/public' )
	}

	async getAdminSiteOptions () {
		return this.apiGetRequest( 'siteOption/admin' )
	}

	async getSiteOptionByKey ( optionKey ) {
		return this.apiGetRequest( `siteOption/key/${ optionKey }` )
	}

	async getSiteOptionsByGroup ( group ) {
		return this.apiGetRequest( `siteOption/group/${ group }` )
	}

	async getAnalyticsEntityTypes () {
		return this.apiGetRequest( 'analytics/entityTypes' )
	}

	async getAnalyticsTimeData ( entityType, period, filters = {} ) {
		return this.apiGetRequest( `analytics/${ entityType }/${ period }`, filters )
	}

	async getAnalyticsEntityStats ( entityType ) {
		return this.apiGetRequest( `analytics/${ entityType }/stats` )
	}

	async getNotesByEntity ( entityType, entityId ) {
		return this.apiGetRequest( `note/entity/${ entityType }/${ entityId }` )
	}

	async getNotesByEntityType ( entityType ) {
		return this.apiGetRequest( `note/type/${ entityType }` )
	}

	async getUnreadNotesCount ( entityType, entityId ) {
		return this.apiGetRequest( `note/unread-count/${ entityType }/${ entityId }` )
	}

	async markNotesAsRead ( noteIds ) {
		return this.apiPostRequest( 'note/mark-read', { noteIds } )
	}

	async _uploadFile ( endpoint, fieldName, file ) {
		const formData = new FormData()
		formData.append( fieldName, file )

		const accessToken = getLocalStorage( 'authToken' )
		const headers = new Headers()
		headers.append( 'Authorization', `Bearer ${ accessToken }` )

		const response = await fetch( `${ CONFIG.API_URL }/${ endpoint }`, {
			method: 'POST',
			mode: 'cors',
			headers,
			body: formData
		} )

		return response.json()
	}
}

const apiService = new API()

export default apiService
