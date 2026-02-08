import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const ChangeLogSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	entityType: {
		type: String,
		required: true,
		trim: true
	},
	entityId: {
		type: String,
		required: true,
		trim: true
	},
	action: {
		type: String,
		required: true,
		enum: ['create', 'update', 'delete']
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false
	},
	userName: {
		type: String,
		required: false,
		trim: true
	},
	changes: {
		type: Schema.Types.Mixed,
		required: false,
		default: {}
	},
	snapshot: {
		type: Schema.Types.Mixed,
		required: false,
		default: {}
	}
}, {
	timestamps: true
})

ChangeLogSchema.index({ key: 1 })
ChangeLogSchema.index({ entityType: 1 })
ChangeLogSchema.index({ entityId: 1 })
ChangeLogSchema.index({ action: 1 })
ChangeLogSchema.index({ userId: 1 })
ChangeLogSchema.index({ createdAt: -1 })

export default ChangeLogSchema

