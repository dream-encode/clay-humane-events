import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const SiteOptionSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	optionIsPublic: {
		type: Boolean,
		default: false
	},
	optionType: {
		type: String,
		enum: ['string', 'number', 'boolean', 'json', 'array'],
		default: 'string',
		required: true
	},
	optionKey: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	optionName: {
		type: String,
		required: true,
		trim: true
	},
	optionValue: {
		type: Schema.Types.Mixed,
		default: null
	},
	group: {
		type: String,
		default: 'general',
		trim: true
	}
}, {
	timestamps: true
})

SiteOptionSchema.index({ group: 1 })
SiteOptionSchema.index({ optionIsPublic: 1 })

export default SiteOptionSchema

