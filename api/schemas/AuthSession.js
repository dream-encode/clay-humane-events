import { Schema } from 'mongoose'

const AuthSessionSchema = new Schema({
	token: {
		type: String,
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false
	},
	lastLogin: {
		type: Date,
		default: Date.now
	}
},
{
	timestamps: true
})

AuthSessionSchema.index({ token: 1, createdAt: 1 })

export default AuthSessionSchema

