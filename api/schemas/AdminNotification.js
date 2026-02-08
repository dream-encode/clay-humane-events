import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const AdminNotificationSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	notificationType: {
		type: String,
		required: true,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true
	},
	text: {
		type: String,
		required: true,
		trim: true
	},
	actionUrl: {
		type: String,
		required: false,
		trim: true
	},
	actionText: {
		type: String,
		required: false,
		trim: true
	},
	metadata: {
		type: Schema.Types.Mixed,
		required: false
	},
	userId: {
		type: String,
		required: false,
		trim: true
	},
	dismissed: {
		type: Boolean,
		default: false,
		required: true
	},
	dismissedAt: {
		type: Date,
		required: false
	}
}, {
	timestamps: true
})

AdminNotificationSchema.index({ key: 1 })
AdminNotificationSchema.index({ notificationType: 1 })
AdminNotificationSchema.index({ userId: 1 })
AdminNotificationSchema.index({ dismissed: 1 })
AdminNotificationSchema.index({ createdAt: 1 })

export default AdminNotificationSchema

