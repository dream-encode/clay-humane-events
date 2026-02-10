import { createHash, randomBytes } from 'crypto'

import changelogEmitter from '../inc/changelogEmitter.js'
import {
	hashPassword,
	verifyPassword,
	isValidEmail,
	isValidPassword,
	generateSecureToken,
	sanitizeUserForPublic,
	parseParamsWithDefaults,
	logFile
} from '../inc/helpers.js'
import User from '../models/user.js'
import AuthSessionService from './authSession.js'
import CacheService from './cache.js'

class UserService {
	async registerUser(userData, requestingUser = null) {
		const { email, password, firstName, lastName, registrationIp, userAgent, role } = userData
		const isAdminCreated = !!requestingUser

		if (!email || !firstName || !lastName) {
			throw new Error('Missing required fields!')
		}

		if (!isAdminCreated && !password) {
			throw new Error('Password is required!')
		}

		if (!isValidEmail(email)) {
			throw new Error('Invalid email format!')
		}

		if (password && !isValidPassword(password)) {
			throw new Error('Password must be at least 8 characters with uppercase, lowercase, a number, and a special character!')
		}

		const existingUser = await User.getUserByEmail(email)
		if (existingUser) {
			throw new Error('User with this email already exists!')
		}

		let requestedRole = 'user'

		if (role && requestingUser && requestingUser.role === 'superadmin') {
			requestedRole = role
		}

		const newUserData = {
			email: email.toLowerCase(),
			firstName,
			lastName,
			role: requestedRole,
			metadata: {
				registrationIp,
				userAgent
			}
		}

		if (password) {
			newUserData.password = hashPassword(password)
		}

		let rawInvitationToken = null

		if (isAdminCreated) {
			rawInvitationToken = randomBytes(32).toString('hex')
			const hashedToken = createHash('sha256').update(rawInvitationToken).digest('hex')
			newUserData.invitationToken = hashedToken
			newUserData.invitationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
		}

		const newUser = new User(newUserData)
		const savedUser = await newUser.save()

		if (!savedUser) {
			throw new Error('Unable to create user!')
		}

		changelogEmitter.emit('entity:created', {
			entityType: 'User',
			entity: savedUser,
			user: requestingUser || null
		})

		const result = sanitizeUserForPublic(savedUser.toObject())
		result.invitationToken = rawInvitationToken

		return result
	}

	async loginUser(loginData) {
		const { email, password, loginIp, userAgent } = loginData

		if (!email || !password) {
			throw new Error('Email and password are required!')
		}

		const user = await User.getUserByEmailWithPassword(email)
		if (!user) {
			throw new Error('Invalid email or password!')
		}

		if (user.isLocked) {
			throw new Error('Account is temporarily locked due to too many failed login attempts!')
		}

		if (!user.isActive) {
			throw new Error('Account is deactivated!')
		}

		const isPasswordValid = verifyPassword(password, user.password)
		if (!isPasswordValid) {
			await User.incrementLoginAttempts(email)

			if (user.loginAttempts >= 4) {
				await User.lockAccount(email)
				throw new Error('Account locked due to too many failed login attempts!')
			}

			throw new Error('Invalid email or password!')
		}

		await User.resetLoginAttempts(email)

		const updateData = {
			lastLogin: new Date(),
			'metadata.lastLoginIp': loginIp,
			'metadata.userAgent': userAgent
		}

		const updatedUser = await User.updateUserByEmail(email, updateData)

		if (!updatedUser) {
			throw new Error('Unable to update login information!')
		}

		const token = generateSecureToken()

		await AuthSessionService.createUserSession(token, updatedUser._id)

		return {
			token,
			user: sanitizeUserForPublic(updatedUser.toObject())
		}
	}

	async getUserByID(id) {
		let user = await CacheService.get(`user-by-id-${id}`)

		if (!user) {
			user = await User.getUserByID(id)

			if (!user) {
				throw new Error('User not found!')
			}

			CacheService.add(`user-by-id-${id}`, user)
		}

		return sanitizeUserForPublic(user.toObject ? user.toObject() : user)
	}

	async getUserByKey(key) {
		let user = await CacheService.get(`user-by-key-${key}`)

		if (!user) {
			user = await User.getUserByKey(key)

			if (!user) {
				throw new Error('User not found!')
			}

			CacheService.add(`user-by-key-${key}`, user)
		}

		return sanitizeUserForPublic(user.toObject ? user.toObject() : user)
	}

	async getUserByEmail(email) {
		const user = await User.getUserByEmail(email)

		if (!user) {
			throw new Error('User not found!')
		}

		return sanitizeUserForPublic(user.toObject())
	}

	async updateUser(id, userData, context = {}) {
		const allowedFields = ['firstName', 'lastName', 'avatar', 'preferredTheme']
		const updateData = {}

		for (const [key, value] of Object.entries(userData)) {
			if (allowedFields.includes(key)) {
				updateData[key] = value
			}
		}

		if (Object.keys(updateData).length === 0) {
			throw new Error('No valid fields to update!')
		}

		const before = await User.getUserByID(id)
		const updatedUser = await User.updateUserById(id, updateData)

		if (!updatedUser) {
			throw new Error('Unable to update user!')
		}

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: id,
			before,
			after: updatedUser,
			user: context.user || null
		})

		await CacheService.delete(`user-by-id-${id}`)
		await CacheService.delete(`user-by-key-${updatedUser.key}`)

		return sanitizeUserForPublic(updatedUser.toObject())
	}

	async getUsers(params) {
		const { query, limit, page, sort } = parseParamsWithDefaults(params)

		query.isActive = true

		const users = await User.find(query).sort(sort).skip(limit * page).limit(limit)

		return users.map(user => {
			const userObj = user.toObject({ virtuals: true })

			delete userObj.password
			return userObj
		})
	}

	async searchUsers(searchTerm) {
		if (!searchTerm || searchTerm.length < 2) {
			throw new Error('Search term must be at least 2 characters!')
		}

		const users = await User.searchUsers(searchTerm)
		return users.map(user => sanitizeUserForPublic(user.toObject()))
	}

	async deactivateUser(id, context = {}) {
		const before = await User.getUserByID(id)
		const updatedUser = await User.updateUserById(id, { isActive: false })

		if (!updatedUser) {
			throw new Error('Unable to deactivate user!')
		}

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: id,
			before,
			after: updatedUser,
			user: context.user || null
		})

		await CacheService.delete(`user-by-id-${id}`)
		await CacheService.delete(`user-by-key-${updatedUser.key}`)

		return sanitizeUserForPublic(updatedUser.toObject())
	}

	async reactivateUser(id, context = {}) {
		const before = await User.getUserByID(id)
		const updatedUser = await User.updateUserById(id, { isActive: true })

		if (!updatedUser) {
			throw new Error('Unable to reactivate user!')
		}

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: id,
			before,
			after: updatedUser,
			user: context.user || null
		})

		await CacheService.delete(`user-by-id-${id}`)
		await CacheService.delete(`user-by-key-${updatedUser.key}`)

		return sanitizeUserForPublic(updatedUser.toObject())
	}

	async getUserByIDForAdmin(id) {
		const cacheKey = `admin-user-by-id-${id}`
		const cachedUser = await CacheService.get(cacheKey)

		if (cachedUser) {
			return cachedUser
		}

		const user = await User.getUserByID(id)

		if (!user) {
			throw new Error('User not found!')
		}

		const userObject = user.toObject()

		delete userObject.password

		await CacheService.set(cacheKey, userObject, 300)

		return userObject
	}

	async updateUserByAdmin(id, updateData, requestingUser) {
		const allowedFields = [
			'firstName', 'lastName', 'email',
			'isActive'
		]

		if (updateData.hasOwnProperty('role')) {
			if (!requestingUser || requestingUser.role !== 'superadmin') {
				throw new Error('Only superadmin can change user roles!')
			}
			allowedFields.push('role')
		}

		const filteredData = {}
		for (const field of allowedFields) {
			if (updateData.hasOwnProperty(field)) {
				filteredData[field] = updateData[field]
			}
		}

		if (Object.keys(filteredData).length === 0) {
			throw new Error('No valid fields to update!')
		}

		const before = await User.getUserByID(id)
		const updatedUser = await User.updateUserById(id, filteredData)

		if (!updatedUser) {
			throw new Error('Unable to update user!')
		}

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: id,
			before,
			after: updatedUser,
			user: requestingUser || null
		})

		await CacheService.delete(`user-by-id-${id}`)
		await CacheService.delete(`admin-user-by-id-${id}`)
		await CacheService.delete(`user-by-key-${updatedUser.key}`)

		const userObject = updatedUser.toObject()
		delete userObject.password

		return userObject
	}

	async updateUserRole(id, role, requestingUser) {
		if (!requestingUser || requestingUser.role !== 'superadmin') {
			throw new Error('Only superadmin can change user roles!')
		}

		const before = await User.getUserByID(id)
		const updatedUser = await User.updateUserById(id, { role })

		if (!updatedUser) {
			throw new Error('Unable to update user role!')
		}

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: id,
			before,
			after: updatedUser,
			user: requestingUser || null
		})

		await CacheService.delete(`user-by-id-${id}`)
		await CacheService.delete(`admin-user-by-id-${id}`)
		await CacheService.delete(`user-by-key-${updatedUser.key}`)

		const userObject = updatedUser.toObject()
		delete userObject.password

		return userObject
	}

	/**
	 * Get all admin and superadmin users.
	 *
	 * @since 1.1.0
	 *
	 * @return {Array} Admin/superadmin users.
	 */
	async getAdminUsers() {
		return await User.find({ role: { $in: ['admin', 'superadmin'] }, isActive: true })
	}

	async changePassword(userId, currentPassword, newPassword) {
		if (!currentPassword || !newPassword) {
			throw new Error('Current password and new password are required.')
		}

		if (!isValidPassword(newPassword)) {
			throw new Error('Password must be at least 8 characters with uppercase, lowercase, a number, and a special character.')
		}

		const user = await User.findById(userId).select('+password')

		if (!user) {
			throw new Error('User not found.')
		}

		const isCurrentValid = verifyPassword(currentPassword, user.password)

		if (!isCurrentValid) {
			throw new Error('Current password is incorrect.')
		}

		const hashedPassword = hashPassword(newPassword)

		const before = user.toObject()

		await User.findByIdAndUpdate(userId, {
			$set: { password: hashedPassword }
		})

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: userId,
			before: { ...before, password: '[REDACTED]' },
			after: { ...before, password: '[REDACTED]' },
			user: { _id: userId }
		})

		await CacheService.delete(`user-by-id-${userId}`)
		await CacheService.delete(`user-by-key-${user.key}`)

		return { success: true }
	}

	async generatePasswordResetToken(email) {
		if (!email) {
			throw new Error('Email is required.')
		}

		const user = await User.findOne({ email: email.toLowerCase() }).select('+lastPasswordResetRequest')

		if (!user) {
			return { success: true }
		}

		if (user.lastPasswordResetRequest) {
			const cooldownMs = 5 * 60 * 1000
			const timeSinceLast = Date.now() - new Date(user.lastPasswordResetRequest).getTime()

			if (timeSinceLast < cooldownMs) {
				return { success: true }
			}
		}

		const rawToken = randomBytes(32).toString('hex')
		const hashedToken = createHash('sha256').update(rawToken).digest('hex')

		await User.updateUserById(user._id, {
			passwordResetToken: hashedToken,
			passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
			lastPasswordResetRequest: new Date()
		})

		return { success: true, token: rawToken, user }
	}

	async setPasswordWithToken(token, newPassword) {
		if (!token || !newPassword) {
			throw new Error('Token and new password are required.')
		}

		if (!isValidPassword(newPassword)) {
			throw new Error('Password must be at least 8 characters with uppercase, lowercase, a number, and a special character.')
		}

		const hashedToken = createHash('sha256').update(token).digest('hex')
		const user = await User.getUserByInvitationToken(hashedToken)

		if (!user) {
			throw new Error('Invalid or expired invitation token.')
		}

		const hashedPassword = hashPassword(newPassword)

		const before = user.toObject()

		await User.findByIdAndUpdate(user._id, {
			$set: { password: hashedPassword },
			$unset: { invitationToken: 1, invitationTokenExpires: 1 }
		})

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: user._id,
			before,
			after: { ...before, password: '[REDACTED]' },
			user: null
		})

		await CacheService.delete(`user-by-id-${user._id}`)
		await CacheService.delete(`user-by-key-${user.key}`)

		return { success: true }
	}

	async resetPassword(token, newPassword) {
		if (!token || !newPassword) {
			throw new Error('Token and new password are required.')
		}

		if (!isValidPassword(newPassword)) {
			throw new Error('Password must be at least 8 characters with uppercase, lowercase, a number, and a special character.')
		}

		const hashedToken = createHash('sha256').update(token).digest('hex')
		const user = await User.getUserByResetToken(hashedToken)

		if (!user) {
			throw new Error('Invalid or expired reset token.')
		}

		const hashedPassword = hashPassword(newPassword)

		const before = user.toObject()

		await User.findByIdAndUpdate(user._id, {
			$set: { password: hashedPassword },
			$unset: { passwordResetToken: 1, passwordResetExpires: 1, lastPasswordResetRequest: 1 }
		})

		await AuthSessionService.destroyAllUserSessions(user._id)

		changelogEmitter.emit('entity:updated', {
			entityType: 'User',
			entityId: user._id,
			before,
			after: { ...before, password: '[REDACTED]' },
			user: null
		})

		await CacheService.delete(`user-by-id-${user._id}`)
		await CacheService.delete(`user-by-key-${user.key}`)

		return { success: true }
	}
}

export default new UserService()

