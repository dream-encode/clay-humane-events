import { model } from 'mongoose'

import UserSchema from '../schemas/User.js'

const User = model('User', UserSchema)

User.getUserByID = (id) => {
	return User.findById(id)
}

User.getUserByKey = (key) => {
	return User.findOne({ key })
}

User.getUserByEmail = (email) => {
	return User.findOne({ email: email.toLowerCase() })
}

User.getUserByEmailWithPassword = (email) => {
	return User.findOne({ email: email.toLowerCase() }).select('+password')
}

User.updateUserById = (id, userData) => {
	return User.findByIdAndUpdate(id, userData, { new: true })
}

User.updateUserByEmail = (email, userData) => {
	return User.findOneAndUpdate({ email: email.toLowerCase() }, userData, { new: true })
}

User.incrementLoginAttempts = (email) => {
	return User.findOneAndUpdate(
		{ email: email.toLowerCase() },
		{ $inc: { loginAttempts: 1 } },
		{ new: true }
	)
}

User.resetLoginAttempts = (email) => {
	return User.findOneAndUpdate(
		{ email: email.toLowerCase() },
		{ $unset: { loginAttempts: 1, lockUntil: 1 } },
		{ new: true }
	)
}

User.lockAccount = (email, lockDuration = 2 * 60 * 60 * 1000) => {
	return User.findOneAndUpdate(
		{ email: email.toLowerCase() },
		{
			$set: {
				lockUntil: Date.now() + lockDuration
			}
		},
		{ new: true }
	)
}

User.getUserByResetToken = (token) => {
	return User.findOne({
		passwordResetToken: token,
		passwordResetExpires: { $gt: Date.now() }
	}).select('+passwordResetToken +passwordResetExpires +password')
}

User.getUserByInvitationToken = (token) => {
	return User.findOne({
		invitationToken: token,
		invitationTokenExpires: { $gt: Date.now() }
	}).select('+invitationToken +invitationTokenExpires +password')
}

User.searchUsers = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return User.find({
		$or: [
			{ firstName: regex },
			{ lastName: regex },
			{ email: regex }
		],
		isActive: true
	})
}

export default User

