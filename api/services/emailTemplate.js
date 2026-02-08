import BaseEntityService from './abstracts/BaseEntityService.js'
import EmailTemplate from '../models/emailTemplate.js'
import { logFile } from '../inc/helpers.js'

/**
 * Email template service.
 *
 * Manages configurable email templates with per-event override support.
 * Template hierarchy: per-event DB template > global DB template > hardcoded default.
 *
 * @since 1.1.0
 */
class EmailTemplateService extends BaseEntityService {
	constructor() {
		super(EmailTemplate, 'EmailTemplate')
	}

	getSearchFields() {
		return ['key', 'templateType', 'subject']
	}

	/**
	 * Get the resolved template for a given type and optional event.
	 *
	 * @since 1.1.0
	 *
	 * @param {string}      templateType Template type identifier.
	 * @param {string|null} eventId      Optional event ID for per-event override.
	 * @return {Promise<Object|null>} Resolved template data with source indicator.
	 */
	async getResolvedTemplate(templateType, eventId = null) {
		if (eventId) {
			const eventTemplate = await EmailTemplate.getTemplate(templateType, eventId)

			if (eventTemplate) {
				return {
					subject: eventTemplate.subject,
					body: eventTemplate.body,
					variables: eventTemplate.variables || [],
					source: 'event',
					templateId: eventTemplate._id
				}
			}
		}

		const globalTemplate = await EmailTemplate.getTemplate(templateType, null)

		if (globalTemplate) {
			return {
				subject: globalTemplate.subject,
				body: globalTemplate.body,
				variables: globalTemplate.variables || [],
				source: 'database',
				templateId: globalTemplate._id
			}
		}

		const { DEFAULT_TEMPLATES } = await import('../inc/emailTemplates.js')
		const defaultTemplate = DEFAULT_TEMPLATES[templateType]

		if (defaultTemplate) {
			return {
				subject: defaultTemplate.subject,
				body: defaultTemplate.body,
				variables: defaultTemplate.variables || [],
				source: 'default',
				templateId: null
			}
		}

		return null
	}

	/**
	 * Substitute variables in a template string.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} template  Template string with {{variable}} placeholders.
	 * @param {Object} variables Key-value pairs for substitution.
	 * @return {string} Template with variables replaced.
	 */
	substituteVariables(template, variables) {
		let result = template

		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
			result = result.replace(regex, value || '')
		}

		return result
	}

	/**
	 * Validate template data.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} templateData Template data to validate.
	 * @return {Object} Validation result with isValid and errors.
	 */
	validateTemplate(templateData) {
		const errors = []
		const { templateType, subject, body } = templateData

		if (!templateType) errors.push('templateType is required')
		if (!subject) errors.push('subject is required')
		if (!body) errors.push('body is required')

		if (body) {
			const variableMatches = body.match(/\{\{(\w+)\}\}/g) || []
			const invalidVariables = variableMatches.filter(match => !/^\{\{\w+\}\}$/.test(match))

			if (invalidVariables.length > 0) {
				errors.push(`Invalid variable syntax: ${invalidVariables.join(', ')}`)
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		}
	}

	/**
	 * Save or update a template.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} templateData Template data.
	 * @param {string} modifiedBy   User ID who modified.
	 * @return {Promise<Object>} Saved template.
	 */
	async saveTemplate(templateData, modifiedBy) {
		const { templateType, eventId, subject, body, variables } = templateData

		const validation = this.validateTemplate(templateData)

		if (!validation.isValid) {
			throw new Error(`Template validation failed: ${validation.errors.join(', ')}`)
		}

		let template = await EmailTemplate.findOne({
			templateType,
			eventId: eventId || null
		})

		if (template) {
			template.subject = subject
			template.body = body
			template.variables = variables || []
			template.modifiedBy = modifiedBy
			template.isActive = true
		} else {
			template = new EmailTemplate({
				templateType,
				eventId: eventId || null,
				subject,
				body,
				variables: variables || [],
				modifiedBy,
				isActive: true
			})
		}

		await template.save()

		logFile(`Email template saved: ${templateType}${eventId ? ` (event: ${eventId})` : ''} by user ${modifiedBy}`)

		return template
	}

	/**
	 * Reset a template to defaults by deactivating the DB record.
	 *
	 * @since 1.1.0
	 *
	 * @param {string}      templateType Template type.
	 * @param {string|null} eventId      Optional event ID.
	 * @return {Promise<boolean>} True if template was reset.
	 */
	async resetTemplate(templateType, eventId = null) {
		const template = await EmailTemplate.findOne({
			templateType,
			eventId: eventId || null
		})

		if (!template) {
			return false
		}

		template.isActive = false
		await template.save()

		logFile(`Email template reset to default: ${templateType}${eventId ? ` (event: ${eventId})` : ''}`)

		return true
	}

	/**
	 * Get all template types with their current source.
	 *
	 * @since 1.1.0
	 *
	 * @return {Promise<Array>} Template type summaries.
	 */
	async getAllTemplateTypes() {
		const { DEFAULT_TEMPLATES } = await import('../inc/emailTemplates.js')
		const templateTypes = Object.keys(DEFAULT_TEMPLATES)
		const result = []

		for (const templateType of templateTypes) {
			const dbTemplate = await EmailTemplate.findOne({ templateType, eventId: null, isActive: true })
			const defaults = DEFAULT_TEMPLATES[templateType]

			result.push({
				templateType,
				label: defaults.label || templateType,
				description: defaults.description || '',
				variables: defaults.variables || [],
				hasCustomTemplate: !!dbTemplate,
				customTemplateId: dbTemplate ? dbTemplate._id : null
			})
		}

		return result
	}
}

export default new EmailTemplateService()

