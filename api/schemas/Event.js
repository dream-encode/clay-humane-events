import { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const RegistrationFieldSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	label: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		required: true,
		enum: ['text', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'textarea', 'radio']
	},
	required: {
		type: Boolean,
		default: false
	},
	placeholder: {
		type: String,
		default: '',
		trim: true
	},
	options: [{
		value: { type: String, required: true },
		label: { type: String, required: true }
	}],
	sortOrder: {
		type: Number,
		default: 0
	}
}, { _id: true })

const slugify = (str) => {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

const EventSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	eventName: {
		type: String,
		required: true,
		trim: true
	},
	eventSlug: {
		type: String,
		unique: true,
		sparse: true,
		trim: true,
		lowercase: true
	},
	eventDate: {
		type: Date,
		required: true
	},
	eventDescription: {
		type: String,
		required: false,
		default: '',
		trim: true
	},
	eventLogo: {
		type: String,
		required: false,
		default: ''
	},
	eventFlyers: {
		type: [String],
		default: []
	},
	eventWaivers: {
		type: [String],
		default: []
	},
	registrationFields: {
		type: [RegistrationFieldSchema],
		default: []
	},
	registrationOpen: {
		type: Boolean,
		default: false
	},
	registrationFee: {
		type: Number,
		required: false,
		default: 0,
		min: 0
	},
	eventPageQR: {
		type: String,
		required: false,
		default: ''
	},
	eventRegistrationQR: {
		type: String,
		required: false,
		default: ''
	},
	isActive: {
		type: Boolean,
		default: true,
		required: false
	}
}, {
	timestamps: true
})

EventSchema.pre('save', function(next) {
	if (this.isModified('eventName') && !this.eventSlug) {
		this.eventSlug = slugify(this.eventName)
	}
	next()
})

EventSchema.index({ key: 1 })
EventSchema.index({ eventSlug: 1 })
EventSchema.index({ eventDate: 1 })
EventSchema.index({ isActive: 1 })

export default EventSchema
