import { hashAuthToken } from '../inc/helpers.js'
import AuthSession from '../models/authSession.js'

class AuthSessionService {
	async loginUserWithToken( data ) {
		const { token } = data

		if ( ! token ) {
			throw new Error('No auth token!')
		}

		const hashedToken = hashAuthToken( token )

		const sessionData = {
			"token": hashedToken,
		}

		const existing = await AuthSession.findOne( sessionData )

		if ( ! existing ) {
			const newSession = new AuthSession( sessionData )

			const session = await newSession.save()

			if ( ! session ) {
				throw new Error('Unable to create session!')
			}

			return session
		} else {
			const session = await AuthSession.findOneAndUpdate( sessionData, sessionData )

			if ( ! session ) {
				throw new Error('Unable to update session!')
			}

			return session
		}
	}

	async createUserSession( token, userId ) {
		const hashedToken = hashAuthToken( token )

		const sessionData = {
			token: hashedToken,
			userId: userId,
			lastLogin: new Date()
		}

		await AuthSession.deleteMany({ userId: userId })

		const newSession = new AuthSession( sessionData )
		const session = await newSession.save()

		if ( ! session ) {
			throw new Error('Unable to create user session!')
		}

		return session
	}

	async getUserByToken( token ) {
		const session = await AuthSession.findOne( { "token": token } ).populate('userId')

		if (!session) {
			return null
		}

		if (!session.userId) {
			return session
		}

		return session.userId
	}

	async destroyAllUserSessions(userId) {
		return await AuthSession.deleteMany({ userId })
	}
}

export default new AuthSessionService()

