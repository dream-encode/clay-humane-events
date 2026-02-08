import { validateAuth } from '../inc/helpers.js'
import ApiKeyService from '../services/apiKey.js'

export const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader) {
			return res.status(401).json({ error: true, message: 'Authorization header required' })
		}

		if (authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7)

			return new Promise((resolve, reject) => {
				validateAuth(token, (err, user, info) => {
					if (err) {
						return reject(new Error('Bearer token validation error'))
					}

					if (user) {
						req.user = user
						req.authType = 'bearer'
						return resolve('bearer')
					}

					resolve('fallback')
				})
			}).then(async (result) => {
				if (result === 'bearer') {
					return next()
				}

				return res.status(401).json({ error: true, message: 'Invalid authentication token' })
			}).catch((error) => {
				return res.status(500).json({ error: true, message: 'Authentication error' })
			})
		}

		if (authHeader.startsWith('ApiKey ')) {
			const key = authHeader.substring(7)
			const apiKey = await ApiKeyService.findByKey(key)

			if (!apiKey) {
				return res.status(401).json({ error: true, message: 'Invalid API key' })
			}

			if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
				return res.status(401).json({ error: true, message: 'API key has expired' })
			}

			apiKey.lastUsedAt = new Date()
			apiKey.save()

			req.apiKey = apiKey
			req.authType = 'apiKey'
			return next()
		}

		return res.status(401).json({ error: true, message: 'Invalid authorization format' })
	} catch (error) {
		return res.status(500).json({ error: true, message: 'Authentication error' })
	}
}

