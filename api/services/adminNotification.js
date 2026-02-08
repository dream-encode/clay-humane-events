import { parseParamsWithDefaults } from '../inc/helpers.js'
import AdminNotification from '../models/adminNotification.js'

class AdminNotificationService {
	async insertAdminNotification(data) {
		const adminNotification = new AdminNotification(data)
		return await adminNotification.save()
	}

	async getAdminNotificationByID(id) {
		const adminNotification = await AdminNotification.getAdminNotificationByID(id)

		if (!adminNotification) {
			throw new Error('No admin notification found!')
		}

		return adminNotification
	}

	async getAdminNotificationByKey(key) {
		const adminNotification = await AdminNotification.getAdminNotificationByKey(key)

		if (!adminNotification) {
			throw new Error('No admin notification found!')
		}

		return adminNotification
	}

	async getAdminNotifications(params = {}) {
		const { query: baseQuery, limit, page, sort } = parseParamsWithDefaults(params)
		const skip = page * limit

		const query = { ...baseQuery }

		if (params.notificationType) {
			query.notificationType = params.notificationType
		}

		if (params.userId) {
			query.userId = params.userId
		}

		if (params.dismissed !== undefined) {
			query.dismissed = params.dismissed === 'true' || params.dismissed === true
		}

		return await AdminNotification.find(query)
			.sort(sort)
			.limit(limit)
			.skip(skip)
	}

	async getAdminNotificationsByUserId(userId) {
		return await AdminNotification.getAdminNotificationsByUserId(userId)
	}

	async getAdminNotificationsByType(notificationType) {
		return await AdminNotification.getAdminNotificationsByType(notificationType)
	}

	async getUndismissedAdminNotifications(userId = null) {
		return await AdminNotification.getUndismissedAdminNotifications(userId)
	}

	async updateAdminNotification(id, data) {
		const adminNotification = await AdminNotification.findByIdAndUpdate(
			id,
			data,
			{ new: true, runValidators: true }
		)

		if (!adminNotification) {
			throw new Error('No admin notification found!')
		}

		return adminNotification
	}

	async dismissAdminNotification(id) {
		return await this.updateAdminNotification(id, {
			dismissed: true,
			dismissedAt: new Date()
		})
	}

	async dismissAllAdminNotifications() {
		return await AdminNotification.updateMany({}, {
			dismissed: true,
			dismissedAt: new Date()
		})
	}

	async deleteAdminNotification(id) {
		const adminNotification = await AdminNotification.findByIdAndDelete(id)

		if (!adminNotification) {
			throw new Error('No admin notification found!')
		}

		return adminNotification
	}

	async searchAdminNotifications(searchTerm) {
		if (!searchTerm || searchTerm.length < 2) {
			throw new Error('Search term must be at least 2 characters!')
		}

		return await AdminNotification.searchAdminNotifications(searchTerm)
	}

	async getTotalAdminNotifications(params = {}) {
		const query = {}

		if (params.notificationType) {
			query.notificationType = params.notificationType
		}

		if (params.userId) {
			query.userId = params.userId
		}

		if (params.dismissed !== undefined) {
			query.dismissed = params.dismissed === 'true' || params.dismissed === true
		}

		return await AdminNotification.countDocuments(query)
	}
}

export default new AdminNotificationService()

