import BaseEntityService from './abstracts/BaseEntityService.js'
import changelogEmitter from '../inc/changelogEmitter.js'
import EmailService from './email.js'
import UserService from './user.js'
import EventRegistration from '../models/eventRegistration.js'
import Event from '../models/event.js'
import User from '../models/user.js'
import { hashPassword, generateSecureToken, isValidEmail, sanitizeUserForPublic, logFile } from '../inc/helpers.js'

class EventRegistrationService extends BaseEntityService {
	constructor() {
		super(EventRegistration, 'EventRegistration')
	}

	/**
	 * Register a user for an event. Creates a lightweight user account if one doesn't exist.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} registrationData Registration data including eventId, formData, and registrant info.
	 * @return {Object} The created registration and user.
	 */
	async registerForEvent(registrationData) {
		const { eventId, formData, email, firstName, lastName, registrationIp, userAgent } = registrationData

		if (!eventId) {
			throw new Error('Event ID is required!')
		}

		if (!email || !isValidEmail(email)) {
			throw new Error('A valid email address is required!')
		}

		if (!firstName || !lastName) {
			throw new Error('First name and last name are required!')
		}

		const event = await Event.findById(eventId)

		if (!event) {
			throw new Error('Event not found!')
		}

		if (!event.isActive || !event.registrationOpen) {
			throw new Error('Registration is not open for this event!')
		}

		let user = await User.getUserByEmail(email)
		let isNewUser = false

		if (!user) {
			const tempPassword = generateSecureToken(16)
			const hashedPassword = hashPassword(tempPassword)

			const newUser = new User({
				email: email.toLowerCase(),
				password: hashedPassword,
				firstName,
				lastName,
				role: 'user',
				metadata: {
					registrationIp,
					userAgent
				}
			})

			user = await newUser.save()
			isNewUser = true
		}

		const existingRegistration = await EventRegistration.getRegistrationByEventAndUser(eventId, user._id)

		if (existingRegistration) {
			throw new Error('You are already registered for this event!')
		}

		const registration = new EventRegistration({
			eventId,
			userId: user._id,
			formData: formData || {},
			status: 'confirmed',
			registrationIp,
			userAgent
		})

		const savedRegistration = await registration.save()

		if (!savedRegistration) {
			throw new Error('Unable to complete registration!')
		}

		changelogEmitter.emit('entity:created', {
			entityType: 'EventRegistration',
			entity: savedRegistration,
			user: null
		})

		try {
			await EmailService.sendRegistrationConfirmationEmail({
				email: user.email,
				userId: user._id,
				eventId: event._id,
				eventName: event.eventName,
				eventDate: event.eventDate,
				eventDescription: event.eventDescription,
				registrantName: `${firstName} ${lastName}`,
				formData: formData || {},
				registrationFields: event.registrationFields || []
			})
		} catch (emailError) {
			logFile(`Failed to send registration confirmation email: ${emailError.message}`)
		}

		try {
			const adminUsers = await UserService.getAdminUsers()

			for (const admin of adminUsers) {
				await EmailService.sendAdminNotificationEmail(
					admin.email,
					'New Event Registration',
					`${firstName} ${lastName} (${email}) has registered for <strong>${event.eventName}</strong>.`
				)
			}
		} catch (adminEmailError) {
			logFile(`Failed to send admin notification emails: ${adminEmailError.message}`)
		}

		return {
			registration: savedRegistration,
			user: sanitizeUserForPublic(user.toObject ? user.toObject() : user),
			isNewUser
		}
	}

	/**
	 * Get all registrations for a specific event with populated user data.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} eventId The event ID.
	 * @return {Array} Registrations with populated user data.
	 */
	async getRegistrationsByEvent(eventId) {
		return EventRegistration.find({ eventId }).populate('userId', 'firstName lastName email').sort({ createdAt: -1 })
	}

	/**
	 * Get all registrations for a specific user.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} userId The user ID.
	 * @return {Array} Registrations with populated event data.
	 */
	async getRegistrationsByUser(userId) {
		return EventRegistration.find({ userId }).populate('eventId', 'eventName eventDate').sort({ createdAt: -1 })
	}

	/**
	 * Get all registrations with populated event and user data.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} filters Optional filters (e.g. { eventId }).
	 * @return {Array} Registrations with populated event and user data.
	 */
	async getAllRegistrations(filters = {}) {
		const query = {}

		if (filters.eventId) {
			query.eventId = filters.eventId
		}

		if (filters.status) {
			query.status = filters.status
		}

		return EventRegistration.find(query)
			.populate('eventId', 'eventName eventDate eventSlug')
			.populate('userId', 'firstName lastName email')
			.sort({ createdAt: -1 })
	}

	/**
	 * Get registration counts grouped by event.
	 *
	 * @since 1.1.0
	 *
	 * @return {Array} Array of { _id: eventId, count: number }.
	 */
	async getRegistrationCounts() {
		return EventRegistration.aggregate([
			{ $group: { _id: '$eventId', count: { $sum: 1 } } }
		])
	}

	getSearchFields() {
		return ['key']
	}
}

export default new EventRegistrationService()

