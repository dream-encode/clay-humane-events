import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const ScheduledTaskSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	scheduledDate: {
		type: Date,
		required: true
	},
	taskService: {
		type: String,
		required: true,
		trim: true
	},
	taskMethod: {
		type: String,
		required: true,
		trim: true
	},
	taskParams: {
		type: Schema.Types.Mixed,
		default: {}
	},
	status: {
		type: String,
		enum: ['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED'],
		default: 'PENDING',
		required: true
	},
	claimId: {
		type: String,
		default: null
	},
	lastAttempt: {
		type: Date,
		default: null
	},
	attempts: {
		type: Number,
		default: 0
	},
	recurring: {
		type: Boolean,
		default: false
	},
	recurringFrequency: {
		type: String,
		enum: ['minutely', 'hourly', 'daily', 'weekly', 'monthly', ''],
		default: ''
	},
	errors: {
		type: [Schema.Types.Mixed],
		default: []
	},
	metadata: {
		type: Schema.Types.Mixed,
		default: {}
	}
}, {
	timestamps: true
})

ScheduledTaskSchema.index({ status: 1 })
ScheduledTaskSchema.index({ scheduledDate: 1 })
ScheduledTaskSchema.index({ recurring: 1 })
ScheduledTaskSchema.index({ taskService: 1, taskMethod: 1 })

export default ScheduledTaskSchema

