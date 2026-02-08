import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const ScheduledTaskLogSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	scheduledTaskId: {
		type: Schema.Types.ObjectId,
		ref: 'ScheduledTask',
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
	status: {
		type: String,
		enum: ['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED'],
		default: 'PENDING',
		required: true
	},
	startedAt: {
		type: Date,
		default: null
	},
	completedAt: {
		type: Date,
		default: null
	},
	duration: {
		type: Number,
		default: 0
	},
	result: {
		type: Schema.Types.Mixed,
		default: null
	},
	error: {
		type: String,
		default: ''
	}
}, {
	timestamps: true
})

ScheduledTaskLogSchema.index({ scheduledTaskId: 1 })
ScheduledTaskLogSchema.index({ status: 1 })
ScheduledTaskLogSchema.index({ createdAt: -1 })

export default ScheduledTaskLogSchema

