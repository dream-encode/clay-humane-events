import { Router } from 'express'

import CONFIG from '../../config/index.js'
import { authenticate } from '../../middleware/auth.js'
import AuthSessionService from '../../services/authSession.js'
import EmailService from '../../services/email.js'
import UserService from '../../services/user.js'

const AuthRouter = Router()

AuthRouter.post('/', async (req, res) => {
	try {
		const session = await AuthSessionService.loginUserWithToken(req.body)

		if (!session) {
			throw new Error('Unable to login!')
		}

		res.status(200).json(session)
	} catch (error) {
		res.status(401).json({ error: error.message })
	}
})

AuthRouter.get('/check', authenticate, async (req, res) => {
	try {
		res.status(200).json({
			authenticated: true,
			user: req.user ? { _id: req.user._id } : null,
			authType: req.authType || 'unknown'
		})
	} catch (error) {
		res.status(401).json({ authenticated: false, message: error.message })
	}
})

AuthRouter.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body
		const result = await UserService.generatePasswordResetToken(email)

		if (result.token && result.user) {
			const resetUrl = `${CONFIG.FRONTEND_URL}/reset-password/${result.token}`

			await EmailService.sendPasswordResetEmail(result.user.email, result.token, resetUrl)
		}

		res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' })
	} catch (error) {
		res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' })
	}
})

AuthRouter.post('/reset-password', async (req, res) => {
	try {
		const { token, password } = req.body
		const result = await UserService.resetPassword(token, password)

		res.status(200).json(result)
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

AuthRouter.post('/set-password', async (req, res) => {
	try {
		const { token, password } = req.body
		const result = await UserService.setPasswordWithToken(token, password)

		res.status(200).json(result)
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

export default AuthRouter

