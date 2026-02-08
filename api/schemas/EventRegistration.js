import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const EventRegistrationSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	eventId: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	formData: {
		type: Schema.Types.Mixed,
		default: {}
	},
	status: {
		type: String,
		enum: ['pending', 'confirmed', 'cancelled'],
		default: 'confirmed'
	},
	registrationIp: {
		type: String,
		required: false
	},
	userAgent: {
		type: String,
		required: false
	}
}, {
	timestamps: true
})

EventRegistrationSchema.index({ eventId: 1 })
EventRegistrationSchema.index({ userId: 1 })
EventRegistrationSchema.index({ eventId: 1, userId: 1 })
EventRegistrationSchema.index({ status: 1 })

export default EventRegistrationSchema

