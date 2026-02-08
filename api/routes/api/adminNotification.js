import { Router } from 'express'

import { authenticate } from '../../middleware/auth.js'
import AdminNotificationService from '../../services/adminNotification.js'

const AdminNotificationRoutes = Router()

AdminNotificationRoutes.post('/', authenticate, async (req, res) => {
	try {
		const adminNotification = await AdminNotificationService.insertAdminNotification(req.body)

		if (!adminNotification) {
			throw new Error('Unable to save admin notification!')
		}

		res.status(200).json(adminNotification)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/', authenticate, async (req, res) => {
	try {
		const notifications = await AdminNotificationService.getAdminNotifications(req.query)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/total', authenticate, async (req, res) => {
	try {
		const count = await AdminNotificationService.getTotalAdminNotifications(req.query)

		res.status(200).json({ count })
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/dismiss-all', authenticate, async (req, res) => {
	try {
		const notifications = await AdminNotificationService.dismissAllAdminNotifications()

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/undismissed', authenticate, async (req, res) => {
	try {
		const { userId } = req.query

		const notifications = await AdminNotificationService.getUndismissedAdminNotifications(userId)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/search', authenticate, async (req, res) => {
	try {
		const { searchTerm } = req.query

		const notifications = await AdminNotificationService.searchAdminNotifications(searchTerm)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/user/:userId', authenticate, async (req, res) => {
	try {
		const { userId } = req.params

		const notifications = await AdminNotificationService.getAdminNotificationsByUserId(userId)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/type/:notificationType', authenticate, async (req, res) => {
	try {
		const { notificationType } = req.params

		const notifications = await AdminNotificationService.getAdminNotificationsByType(notificationType)

		res.status(200).json(notifications)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/id/:notificationID', authenticate, async (req, res) => {
	try {
		const { notificationID } = req.params

		const notification = await AdminNotificationService.getAdminNotificationByID(notificationID)

		res.status(200).json(notification)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.get('/key/:notificationKey', authenticate, async (req, res) => {
	try {
		const { notificationKey } = req.params

		const notification = await AdminNotificationService.getAdminNotificationByKey(notificationKey)

		res.status(200).json(notification)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.post('/:notificationID', authenticate, async (req, res) => {
	try {
		const { notificationID } = req.params

		const notification = await AdminNotificationService.updateAdminNotification(notificationID, req.body)

		if (!notification) {
			throw new Error('Unable to update admin notification!')
		}

		res.status(200).json(notification)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

AdminNotificationRoutes.post('/:notificationID/dismiss', authenticate, async (req, res) => {
	try {
		const { notificationID } = req.params

		const notification = await AdminNotificationService.dismissAdminNotification(notificationID)

		if (!notification) {
			throw new Error('Unable to dismiss admin notification!')
		}

		res.status(200).json(notification)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

export default AdminNotificationRoutes

