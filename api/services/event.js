import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import BaseEntityService from './abstracts/BaseEntityService.js'
import Event from '../models/event.js'
import config from '../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const qrcodesDir = path.join(__dirname, '..', 'uploads', 'events', 'qrcodes')

if (!fs.existsSync(qrcodesDir)) {
	fs.mkdirSync(qrcodesDir, { recursive: true })
}

class EventService extends BaseEntityService {
	constructor() {
		super(Event, 'Event')
	}

	getSearchFields() {
		return ['key', 'eventName', 'eventDescription']
	}

	/**
	 * Generate QR code images for an event.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} event Event document.
	 * @return {Promise<Object>} Object with eventPageQR and eventRegistrationQR paths.
	 */
	async generateQRCodes(event) {
		const eventPageUrl = `${config.FRONTEND_URL}/event/${event.eventSlug}`
		const registrationUrl = `${config.FRONTEND_URL}/event/${event.eventSlug}/register`

		const timestamp = Date.now()
		const eventPageFilename = `event-page-${event._id}-${timestamp}.png`
		const registrationFilename = `event-registration-${event._id}-${timestamp}.png`

		const qrOptions = { width: 300, margin: 2 }

		await QRCode.toFile(path.join(qrcodesDir, eventPageFilename), eventPageUrl, qrOptions)
		await QRCode.toFile(path.join(qrcodesDir, registrationFilename), registrationUrl, qrOptions)

		return {
			eventPageQR: `/uploads/events/qrcodes/${eventPageFilename}`,
			eventRegistrationQR: `/uploads/events/qrcodes/${registrationFilename}`
		}
	}

	/**
	 * Delete existing QR code files for an event.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} event Event document.
	 */
	deleteQRFiles(event) {
		const fields = ['eventPageQR', 'eventRegistrationQR']

		for (const field of fields) {
			if (event[field]) {
				const fullPath = path.join(__dirname, '..', event[field])
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath)
				}
			}
		}
	}

	/**
	 * Insert a new event and generate QR codes.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} entityData Event data.
	 * @param {Object} context    Optional context with user info.
	 * @return {Promise<Object>} Saved event document.
	 */
	async insertEntity(entityData, context = {}) {
		const savedEntity = await super.insertEntity(entityData, context)

		if (savedEntity.eventSlug) {
			const qrPaths = await this.generateQRCodes(savedEntity)
			return this.model.findByIdAndUpdate(savedEntity._id, qrPaths, { new: true })
		}

		return savedEntity
	}

	/**
	 * Update an event and regenerate QR codes if the slug changed.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} id         Event ID.
	 * @param {Object} entityData Updated event data.
	 * @param {Object} context    Optional context with user info.
	 * @return {Promise<Object>} Updated event document.
	 */
	async updateEntity(id, entityData, context = {}) {
		const before = await this.model.findById(id)
		const updatedEntity = await super.updateEntity(id, entityData, context)

		if (before && updatedEntity.eventSlug && updatedEntity.eventSlug !== before.eventSlug) {
			this.deleteQRFiles(before)
			const qrPaths = await this.generateQRCodes(updatedEntity)
			return this.model.findByIdAndUpdate(id, qrPaths, { new: true })
		}

		return updatedEntity
	}

	/**
	 * Get an event by its key (UUID) or slug.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} keyOrSlug UUID key or event slug.
	 * @return {Promise<Object>} Event document.
	 */
	async getEventByKeyOrSlug(keyOrSlug) {
		let event = await this.model.findOne({ key: keyOrSlug })

		if (!event) {
			event = await this.model.findOne({ eventSlug: keyOrSlug.toLowerCase() })
		}

		if (!event) {
			throw new Error('No event found')
		}

		return event
	}

	/**
	 * Get events with open registration.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Promise<Array>} Events with open registration.
	 */
	async getOpenRegistrationEvents() {
		return this.model.find({ registrationOpen: true, isActive: true }).sort({ eventDate: 1 })
	}

	/**
	 * Get the next upcoming event.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Promise<Object|null>} Next event or null.
	 */
	async getNextEvent() {
		const now = new Date()
		return this.model.findOne({ eventDate: { $gte: now }, isActive: true }).sort({ eventDate: 1 })
	}
}

export default new EventService()

