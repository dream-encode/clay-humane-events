import mongoose, { Schema } from 'mongoose'
import { generateUUID } from '../inc/utils.js'

const UserSchema = new Schema({
	key: {
		type: String,
		default: generateUUID,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	firstName: {
		type: String,
		required: true,
		trim: true
	},
	lastName: {
		type: String,
		required: true,
		trim: true
	},
	avatar: {
		type: String,
		required: false,
		default: ''
	},
	role: {
		type: String,
		enum: ['user', 'admin', 'superadmin'],
		default: 'user',
		required: false
	},
	lastLogin: {
		type: Date,
		required: false
	},
	loginAttempts: {
		type: Number,
		default: 0,
		required: false
	},
	lockUntil: {
		type: Date,
		required: false
	},
	passwordResetToken: {
		type: String,
		required: false,
		select: false
	},
	passwordResetExpires: {
		type: Date,
		required: false,
		select: false
	},
	lastPasswordResetRequest: {
		type: Date,
		required: false,
		select: false
	},
	preferredTheme: {
		type: String,
		enum: ['light', 'dark'],
		default: 'light',
		required: false
	},
	isActive: {
		type: Boolean,
		default: true,
		required: false
	},
	metadata: {
		registrationIp: {
			type: String,
			required: false
		},
		lastLoginIp: {
			type: String,
			required: false
		},
		userAgent: {
			type: String,
			required: false
		}
	}
}, {
	timestamps: true
})

UserSchema.index({ email: 1 })
UserSchema.index({ key: 1 })
UserSchema.index({ isActive: 1 })

UserSchema.virtual('fullName').get(function() {
	return `${this.firstName} ${this.lastName}`.trim()
})

UserSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now())
})

export default UserSchema

