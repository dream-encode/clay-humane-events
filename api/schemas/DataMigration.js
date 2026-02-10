import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const DataMigrationSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	migrator: {
		type: String,
		required: true,
		trim: true
	},
	label: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: String,
		enum: ['pending', 'processing', 'complete', 'failed', 'cancelled'],
		default: 'pending',
		required: true
	},
	isDryRun: {
		type: Boolean,
		default: false
	},
	complete: {
		type: Boolean,
		default: false
	},
	currentPosition: {
		type: Number,
		default: 0
	},
	percentComplete: {
		type: Number,
		default: 0
	},
	totalRows: {
		type: Number,
		default: 0
	},
	totalRowsMigrated: {
		type: Number,
		default: 0
	},
	totalRowsFailed: {
		type: Number,
		default: 0
	},
	totalRowsSkipped: {
		type: Number,
		default: 0
	},
	startedAt: {
		type: Date,
		default: null
	},
	completedAt: {
		type: Date,
		default: null
	},
	params: {
		type: Schema.Types.Mixed,
		default: {}
	},
	errors: {
		type: [Schema.Types.Mixed],
		default: []
	}
}, {
	timestamps: true,
	suppressReservedKeysWarning: true
})

DataMigrationSchema.index({ migrator: 1 })
DataMigrationSchema.index({ status: 1 })
DataMigrationSchema.index({ createdAt: -1 })

export default DataMigrationSchema

