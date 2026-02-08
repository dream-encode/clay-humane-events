import { model } from 'mongoose'

import EmailTemplateSchema from '../schemas/EmailTemplate.js'

const EmailTemplate = model('EmailTemplate', EmailTemplateSchema)

/**
 * Get template by type and optional event ID.
 *
 * @since 1.1.0
 *
 * @param {string}      templateType Template type identifier.
 * @param {string|null} eventId      Optional event ID for per-event overrides.
 * @return {Promise<Object|null>} Template or null.
 */
EmailTemplate.getTemplate = (templateType, eventId = null) => {
	return EmailTemplate.findOne({
		templateType,
		eventId: eventId || null,
		isActive: true
	})
}

/**
 * Get all templates by type.
 *
 * @since 1.1.0
 *
 * @param {string} templateType Template type identifier.
 * @return {Promise<Array>} Templates.
 */
EmailTemplate.getTemplatesByType = (templateType) => {
	return EmailTemplate.find({ templateType, isActive: true })
}

/**
 * Get template by ID.
 *
 * @since 1.1.0
 *
 * @param {string} id Template ID.
 * @return {Promise<Object|null>} Template or null.
 */
EmailTemplate.getEmailTemplateByID = (id) => {
	return EmailTemplate.findById(id)
}

/**
 * Get template by key.
 *
 * @since 1.1.0
 *
 * @param {string} key Template key.
 * @return {Promise<Object|null>} Template or null.
 */
EmailTemplate.getEmailTemplateByKey = (key) => {
	return EmailTemplate.findOne({ key })
}

export default EmailTemplate

