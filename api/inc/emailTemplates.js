import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DEFAULT_TEMPLATES = {
	password_reset: {
		label: 'Password Reset',
		description: 'Sent when a user requests a password reset.',
		subject: 'Password Reset - Clay Humane Events',
		body: '<h2>Password Reset Request</h2>\n<p>You have requested to reset your password for Clay Humane Events.</p>\n<p>Click the button below to reset your password:</p>\n<div style="text-align: center; margin: 30px 0;">\n\t<a href="{{resetUrl}}" style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>\n</div>\n<p>If the button doesn\'t work, copy and paste this link into your browser:</p>\n<p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">{{resetUrl}}</p>\n<p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>\n<p>If you didn\'t request this password reset, please ignore this email and your password will remain unchanged.</p>',
		variables: ['resetUrl']
	},
	registration_confirmation: {
		label: 'Registration Confirmation',
		description: 'Sent when someone registers for an event.',
		subject: 'Registration Confirmed - {{eventName}}',
		body: '<h2>Registration Confirmed</h2>\n<p>Hi {{registrantName}},</p>\n<p>You have been successfully registered for <strong>{{eventName}}</strong>!</p>\n{{eventDate}}\n{{eventDescription}}\n{{registrationFields}}\n<p>Thank you for registering! We look forward to seeing you there.</p>',
		variables: ['registrantName', 'eventName', 'eventDate', 'eventDescription', 'registrationFields']
	},
	admin_notification: {
		label: 'Admin Notification',
		description: 'Sent to admins for system events (e.g., new registrations).',
		subject: 'Admin Notification - {{title}}',
		body: '<h2>{{title}}</h2>\n<p>{{message}}</p>\n{{actionButton}}\n<p style="color: #888; font-size: 12px;">This is an admin notification from Clay Humane Events.</p>',
		variables: ['title', 'message', 'actionButton']
	}
}

/**
 * Load email template from file.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} templateName Template filename without extension.
 * @return {string} Template HTML content.
 */
export const loadEmailTemplate = (templateName) => {
	try {
		const templatePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.html`)
		return fs.readFileSync(templatePath, 'utf8')
	} catch (error) {
		throw new Error(`Failed to load email template '${templateName}': ${error.message}`)
	}
}

/**
 * Create a complete email with header, content, and footer.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} content     HTML content for the email body.
 * @param {Object} options     Template options.
 * @return {string} Complete HTML email.
 */
export const createEmailWithTemplate = (content, options = {}) => {
	const {
		includeHeader = true,
		includeFooter = true,
		contentStyle = 'padding: 30px 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;'
	} = options

	let emailHtml = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Clay Humane Events</title>
			<style>
				body {
					margin: 0;
					padding: 0;
					font-family: Arial, sans-serif;
					background-color: #ffffff;
				}
				.email-container {
					max-width: 600px;
					margin: 0 auto;
					background-color: #ffffff;
					border: 1px solid #e9ecef;
				}
				.email-content {
					${contentStyle}
				}
				a {
					color: #2c5f2d;
				}
				h1, h2, h3, h4, h5, h6 {
					color: #333;
					margin-top: 0;
				}
				p {
					margin-bottom: 16px;
				}
				ul, ol {
					margin-bottom: 16px;
					padding-left: 20px;
				}
			</style>
		</head>
		<body>
			<div class="email-container">
	`

	if (includeHeader) {
		const header = loadEmailTemplate('header')
		emailHtml += header
	}

	emailHtml += `
				<div class="email-content">
					${content}
				</div>
	`

	if (includeFooter) {
		const footer = loadEmailTemplate('footer')
		emailHtml += footer
	}

	emailHtml += `
			</div>
		</body>
		</html>
	`

	return emailHtml
}

/**
 * Create password reset email template.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} resetUrl Password reset URL.
 * @return {string} Complete HTML email.
 */
export const createPasswordResetEmail = (resetUrl) => {
	const content = `
		<h2>Password Reset Request</h2>
		<p>You have requested to reset your password for Clay Humane Events.</p>
		<p>Click the button below to reset your password:</p>
		<div style="text-align: center; margin: 30px 0;">
			<a href="${resetUrl}" style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
		</div>
		<p>If the button doesn't work, copy and paste this link into your browser:</p>
		<p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
		<p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
		<p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
	`

	return createEmailWithTemplate(content)
}

/**
 * Create registration confirmation email template.
 *
 * @since [NEXT_VERSION]
 *
 * @param {Object} data Registration and event data.
 * @return {string} Complete HTML email.
 */
export const createRegistrationConfirmationEmail = (data) => {
	const { eventName, eventDate, eventDescription, registrantName, formData, registrationFields } = data

	const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''

	let fieldsHtml = ''

	if (formData && registrationFields && registrationFields.length > 0) {
		const fieldRows = registrationFields.map(field => {
			const value = formData[field.name]

			if (value === undefined || value === null || value === '') {
				return ''
			}

			const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)

			return `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #555;">${field.label}</td><td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef;">${displayValue}</td></tr>`
		}).filter(Boolean).join('')

		if (fieldRows) {
			fieldsHtml = `
				<h3 style="margin-top: 24px;">Registration Details</h3>
				<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
					${fieldRows}
				</table>
			`
		}
	}

	const content = `
		<h2>Registration Confirmed</h2>
		<p>Hi ${registrantName},</p>
		<p>You have been successfully registered for <strong>${eventName}</strong>!</p>
		${formattedDate ? `<p><strong>Date:</strong> ${formattedDate}</p>` : ''}
		${eventDescription ? `<p><strong>About:</strong> ${eventDescription}</p>` : ''}
		${fieldsHtml}
		<p>Thank you for registering! We look forward to seeing you there.</p>
	`

	return createEmailWithTemplate(content)
}

/**
 * Create admin notification email template.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string}      title      Email title.
 * @param {string}      message    Email message body.
 * @param {string|null} actionUrl  Optional action button URL.
 * @param {string}      actionText Action button text.
 * @return {string} Complete HTML email.
 */
export const createAdminNotificationEmail = (title, message, actionUrl = null, actionText = 'View Details') => {
	let content = `
		<h2>${title}</h2>
		<p>${message}</p>
	`

	if (actionUrl) {
		content += `
			<div style="text-align: center; margin: 30px 0;">
				<a href="${actionUrl}" style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${actionText}</a>
			</div>
		`
	}

	content += `
		<p style="color: #888; font-size: 12px;">This is an admin notification from Clay Humane Events.</p>
	`

	return createEmailWithTemplate(content)
}

/**
 * Create notification email template.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string}      title      Email title.
 * @param {string}      message    Email message body.
 * @param {string|null} actionUrl  Optional action button URL.
 * @param {string}      actionText Action button text.
 * @return {string} Complete HTML email.
 */
export const createNotificationEmail = (title, message, actionUrl = null, actionText = 'View Details') => {
	let content = `
		<h2>${title}</h2>
		<p>${message}</p>
	`

	if (actionUrl) {
		content += `
			<div style="text-align: center; margin: 30px 0;">
				<a href="${actionUrl}" style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${actionText}</a>
			</div>
		`
	}

	content += `
		<p>Thank you for supporting Clay Humane!</p>
	`

	return createEmailWithTemplate(content)
}

