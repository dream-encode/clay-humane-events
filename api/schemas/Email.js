import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const EmailSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	to: {
		type: String,
		required: true,
		lowercase: true,
		trim: true
	},
	from: {
		type: String,
		required: true,
		lowercase: true,
		trim: true
	},
	subject: {
		type: String,
		required: true,
		trim: true
	},
	body: {
		type: String,
		required: true
	},
	bodyType: {
		type: String,
		enum: ['text', 'html'],
		default: 'html',
		required: true
	},
	emailType: {
		type: String,
		enum: ['password_reset', 'email_verification', 'notification', 'marketing', 'system', 'registration_confirmation'],
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'sent', 'failed', 'bounced', 'delivered'],
		default: 'pending',
		required: true
	},
	messageId: {
		type: String,
		required: false
	},
	response: {
		type: String,
		required: false
	},
	errorMessage: {
		type: String,
		required: false
	},
	sentAt: {
		type: Date,
		required: false
	},
	deliveredAt: {
		type: Date,
		required: false
	},
	bouncedAt: {
		type: Date,
		required: false
	},
	groupKey: {
		type: String,
		required: false
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false
	},
	metadata: {
		userAgent: { type: String, required: false },
		ipAddress: { type: String, required: false },
		templateData: { type: Schema.Types.Mixed, required: false }
	},
	isActive: {
		type: Boolean,
		default: true,
		required: false
	}
}, {
	timestamps: true
})

EmailSchema.index({ key: 1 })
EmailSchema.index({ to: 1 })
EmailSchema.index({ emailType: 1 })
EmailSchema.index({ status: 1 })
EmailSchema.index({ createdAt: 1 })

export default EmailSchema

