import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const DatabaseBackupSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		enum: ['backup', 'restore'],
		default: 'backup',
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'processing', 'complete', 'failed', 'cancelled'],
		default: 'pending',
		required: true
	},
	backupPath: {
		type: String,
		default: ''
	},
	totalCollections: {
		type: Number,
		default: 0
	},
	processedCollections: {
		type: Number,
		default: 0
	},
	totalDocuments: {
		type: Number,
		default: 0
	},
	processedDocuments: {
		type: Number,
		default: 0
	},
	backupSize: {
		type: Number,
		default: 0
	},
	compressionEnabled: {
		type: Boolean,
		default: true
	},
	collections: {
		type: [String],
		default: []
	},
	retentionDays: {
		type: Number,
		default: 30
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

DatabaseBackupSchema.index({ key: 1 })
DatabaseBackupSchema.index({ type: 1 })
DatabaseBackupSchema.index({ status: 1 })
DatabaseBackupSchema.index({ createdAt: -1 })

export default DatabaseBackupSchema

