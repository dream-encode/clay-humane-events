import nodemailer from 'nodemailer'

import BaseEntityService from './abstracts/BaseEntityService.js'
import EmailTemplateService from './emailTemplate.js'
import Email from '../models/email.js'
import CONFIG from '../config/index.js'
import { logFile } from '../inc/helpers.js'

/**
 * Email service extending BaseEntityService with SMTP sending capabilities.
 *
 * @since [NEXT_VERSION]
 */
class EmailService extends BaseEntityService {
	constructor() {
		super(Email, 'Email')

		this.transporter = null
		this.initializeTransporter()
	}

	getSearchFields() {
		return ['key', 'to', 'from', 'subject']
	}

	/**
	 * Initialize the nodemailer SMTP transporter.
	 *
	 * @since [NEXT_VERSION]
	 */
	initializeTransporter() {
		try {
			this.transporter = nodemailer.createTransport({
				host: CONFIG.SMTP_HOST,
				port: CONFIG.SMTP_PORT,
				secure: CONFIG.SMTP_SECURE,
				auth: {
					user: CONFIG.SMTP_USER,
					pass: CONFIG.SMTP_PASS
				}
			})

			logFile('Email service initialized with SMTP configuration')
		} catch (error) {
			logFile(`Failed to initialize email service: ${error.message}`)
		}
	}

	/**
	 * Send an email and track it in the database.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} emailData       Email data object.
	 * @param {Object} context         Optional context for changelog.
	 * @return {Promise<Object>}       Result with success, messageId, emailId.
	 */
	async sendEmail(emailData, context = {}) {
		const { to, subject, body, bodyType = 'html', emailType, groupKey, userId, templateData } = emailData

		if (!this.transporter) {
			throw new Error('Email service not initialized')
		}

		if (!to || !subject || !body || !emailType) {
			throw new Error('Missing required email fields: to, subject, body, emailType')
		}

		const from = CONFIG.SMTP_FROM || CONFIG.SMTP_USER

		const emailRecord = await this.insertEntity({
			to: to.toLowerCase(),
			from: from.toLowerCase(),
			subject,
			body,
			bodyType,
			emailType,
			status: 'pending',
			groupKey,
			userId,
			metadata: { templateData }
		}, context)

		try {
			const mailOptions = {
				from,
				to,
				subject,
				[bodyType === 'html' ? 'html' : 'text']: body
			}

			const result = await this.transporter.sendMail(mailOptions)

			await this.updateEntity(emailRecord._id, {
				status: 'sent',
				messageId: result.messageId,
				response: result.response,
				sentAt: new Date()
			}, context)

			logFile(`Email sent successfully to ${to}: ${subject}`)

			return { success: true, messageId: result.messageId, emailId: emailRecord._id }
		} catch (error) {
			await this.updateEntity(emailRecord._id, {
				status: 'failed',
				errorMessage: error.message
			}, context)

			logFile(`Failed to send email to ${to}: ${error.message}`)
			throw new Error(`Failed to send email: ${error.message}`)
		}
	}

	/**
	 * Send a password reset email.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} userEmail  Recipient email.
	 * @param {string} resetToken Reset token.
	 * @param {string} resetUrl   Full reset URL.
	 * @param {Object} context    Optional context for changelog.
	 * @return {Promise<Object>}  Send result.
	 */
	async sendPasswordResetEmail(userEmail, resetToken, resetUrl, context = {}) {
		const { createPasswordResetEmail, createEmailWithTemplate } = await import('../inc/emailTemplates.js')

		const resolved = await EmailTemplateService.getResolvedTemplate('password_reset')
		let subject, body

		if (resolved && resolved.source !== 'default') {
			subject = EmailTemplateService.substituteVariables(resolved.subject, { resetUrl })
			const rawBody = EmailTemplateService.substituteVariables(resolved.body, { resetUrl })
			body = createEmailWithTemplate(rawBody)
		} else {
			subject = 'Password Reset - Clay Humane Events'
			body = createPasswordResetEmail(resetUrl)
		}

		return await this.sendEmail({
			to: userEmail,
			subject,
			body,
			bodyType: 'html',
			emailType: 'password_reset',
			templateData: { resetToken, resetUrl }
		}, context)
	}

	/**
	 * Send a registration confirmation email.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} data    Registration and event data.
	 * @param {Object} context Optional context for changelog.
	 * @return {Promise<Object>} Send result.
	 */
	async sendRegistrationConfirmationEmail(data, context = {}) {
		const { createRegistrationConfirmationEmail, createEmailWithTemplate } = await import('../inc/emailTemplates.js')

		const resolved = await EmailTemplateService.getResolvedTemplate('registration_confirmation', data.eventId || null)
		let subject, body

		if (resolved && resolved.source !== 'default') {
			const formattedDate = data.eventDate ? new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
			const eventDateHtml = formattedDate ? `<p><strong>Date:</strong> ${formattedDate}</p>` : ''
			const eventDescHtml = data.eventDescription ? `<p><strong>About:</strong> ${data.eventDescription}</p>` : ''
			const fieldsHtml = this._buildRegistrationFieldsHtml(data.formData, data.registrationFields)

			const vars = {
				registrantName: data.registrantName || '',
				eventName: data.eventName || '',
				eventDate: eventDateHtml,
				eventDescription: eventDescHtml,
				registrationFields: fieldsHtml
			}

			subject = EmailTemplateService.substituteVariables(resolved.subject, vars)
			const rawBody = EmailTemplateService.substituteVariables(resolved.body, vars)
			body = createEmailWithTemplate(rawBody)
		} else {
			subject = `Registration Confirmed - ${data.eventName}`
			body = createRegistrationConfirmationEmail(data)
		}

		return await this.sendEmail({
			to: data.email,
			subject,
			body,
			bodyType: 'html',
			emailType: 'registration_confirmation',
			userId: data.userId,
			templateData: { eventName: data.eventName, eventId: data.eventId }
		}, context)
	}

	/**
	 * Build HTML table of registration fields.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} formData           Submitted form data.
	 * @param {Array}  registrationFields Event registration field definitions.
	 * @return {string} HTML string.
	 */
	_buildRegistrationFieldsHtml(formData, registrationFields) {
		if (!formData || !registrationFields || registrationFields.length === 0) {
			return ''
		}

		const fieldRows = registrationFields.map(field => {
			const value = formData[field.name]

			if (value === undefined || value === null || value === '') {
				return ''
			}

			const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)

			return `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #555;">${field.label}</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">${displayValue}</td></tr>`
		}).filter(Boolean).join('')

		if (!fieldRows) {
			return ''
		}

		return `<h3 style="margin-top: 24px;">Registration Details</h3><table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">${fieldRows}</table>`
	}

	/**
	 * Send an admin notification email.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} to          Recipient email.
	 * @param {string} title       Notification title.
	 * @param {string} message     Notification message.
	 * @param {string} actionUrl   Optional action URL.
	 * @param {string} actionText  Optional action text.
	 * @param {Object} context     Optional context for changelog.
	 * @return {Promise<Object>}   Send result.
	 */
	async sendAdminNotificationEmail(to, title, message, actionUrl = null, actionText = 'View Details', context = {}) {
		const { createAdminNotificationEmail, createEmailWithTemplate } = await import('../inc/emailTemplates.js')

		const resolved = await EmailTemplateService.getResolvedTemplate('admin_notification')
		let subject, body

		if (resolved && resolved.source !== 'default') {
			let actionButtonHtml = ''

			if (actionUrl) {
				actionButtonHtml = `<div style="text-align: center; margin: 30px 0;"><a href="${actionUrl}" style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${actionText}</a></div>`
			}

			const vars = { title, message, actionButton: actionButtonHtml }
			subject = EmailTemplateService.substituteVariables(resolved.subject, vars)
			const rawBody = EmailTemplateService.substituteVariables(resolved.body, vars)
			body = createEmailWithTemplate(rawBody)
		} else {
			subject = `Admin Notification - ${title}`
			body = createAdminNotificationEmail(title, message, actionUrl, actionText)
		}

		return await this.sendEmail({
			to,
			subject,
			body,
			bodyType: 'html',
			emailType: 'notification'
		}, context)
	}
}

export default new EmailService()

