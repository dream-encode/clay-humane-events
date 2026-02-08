import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const NoteSchema = new Schema({
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
		type: Schema.Types.ObjectId,
		required: true
	},
	note: {
		type: String,
		required: true
	},
	type: {
		type: String,
		default: 'private',
		trim: true
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}
}, {
	timestamps: true
})

NoteSchema.index({ entityType: 1, entityId: 1 })
NoteSchema.index({ createdBy: 1 })
NoteSchema.index({ type: 1 })
NoteSchema.index({ createdAt: -1 })

export default NoteSchema

