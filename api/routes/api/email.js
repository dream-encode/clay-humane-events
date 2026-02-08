import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import EmailService from '../../services/email.js'

class EmailRoutes extends BaseEntityRoutes {
	constructor() {
		super(EmailService, 'Email', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/key/:emailKey', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const email = await this.service.getEntityByKey(req.params.emailKey)
				res.status(200).json(email)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/send/email', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const result = await EmailService.sendEmail(req.body, { user: req.user })

				if (!result.success) {
					throw new Error('Unable to send email!')
				}

				res.status(200).json(result)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/send/password-reset', authenticate, async (req, res) => {
			const { userEmail, resetToken, resetUrl } = req.body

			try {
				if (!userEmail || !resetToken || !resetUrl) {
					throw new Error('Missing required fields: userEmail, resetToken, resetUrl')
				}

				const result = await EmailService.sendPasswordResetEmail(userEmail, resetToken, resetUrl, { user: req.user })

				if (!result.success) {
					throw new Error('Unable to send password reset email!')
				}

				res.status(200).json(result)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/count/total', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const total = await this.service.model.countDocuments(req.query || {})
				res.status(200).json({ total })
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new EmailRoutes().getRouter()

