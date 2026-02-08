import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const EmailTemplateSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	templateType: {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	eventId: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
		default: null,
		index: true
	},
	subject: {
		type: String,
		required: true,
		trim: true
	},
	body: {
		type: String,
		required: true,
		trim: true
	},
	variables: [{
		type: String,
		trim: true
	}],
	isActive: {
		type: Boolean,
		default: true,
		index: true
	},
	modifiedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	}
}, {
	timestamps: true
})

EmailTemplateSchema.index({ templateType: 1, eventId: 1 }, { unique: true })

export default EmailTemplateSchema

