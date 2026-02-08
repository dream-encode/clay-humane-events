import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const ScopeSchema = new Schema({
	read: {
		type: Boolean,
		default: false
	},
	write: {
		type: Boolean,
		default: false
	}
}, { _id: false })

/**
 * ApiKey schema.
 *
 * @since [NEXT_VERSION]
 */
const ApiKeySchema = new Schema({
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
	scopes: {
		type: Map,
		of: ScopeSchema,
		default: () => new Map()
	},
	expiresAt: {
		type: Date,
		default: null
	},
	lastUsedAt: {
		type: Date,
		default: null
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
})

ApiKeySchema.index({ key: 1 })
ApiKeySchema.index({ isActive: 1 })
ApiKeySchema.index({ expiresAt: 1 })

export default ApiKeySchema

