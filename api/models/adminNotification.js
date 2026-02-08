import { model } from 'mongoose'

import AdminNotificationSchema from '../schemas/AdminNotification.js'

const AdminNotification = model('AdminNotification', AdminNotificationSchema)

AdminNotification.getAdminNotificationByID = (id) => {
	return AdminNotification.findById(id)
}

AdminNotification.getAdminNotificationByKey = (key) => {
	return AdminNotification.findOne({ key })
}

AdminNotification.getAdminNotificationsByUserId = (userId) => {
	return AdminNotification.find({ userId }).sort({ createdAt: -1 })
}

AdminNotification.getAdminNotificationsByType = (notificationType) => {
	return AdminNotification.find({ notificationType }).sort({ createdAt: -1 })
}

AdminNotification.getUndismissedAdminNotifications = (userId = null) => {
	const query = { dismissed: false }
	if (userId) {
		query.userId = userId
	}
	return AdminNotification.find(query).sort({ createdAt: -1 })
}

AdminNotification.searchAdminNotifications = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return AdminNotification.find({
		$or: [
			{ title: regex },
			{ text: regex },
			{ notificationType: regex }
		]
	}).sort({ createdAt: -1 })
}

export default AdminNotification

