import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import EmailService from '../../services/email.js'
import EmailTemplateService from '../../services/emailTemplate.js'
import { createEmailWithTemplate } from '../../inc/emailTemplates.js'

class EmailTemplateRoutes extends BaseEntityRoutes {
	constructor() {
		super(EmailTemplateService, 'EmailTemplate', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/types', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const types = await EmailTemplateService.getAllTemplateTypes()
				res.status(200).json(types)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/resolve/:templateType', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const { templateType } = req.params
				const { eventId } = req.query
				const template = await EmailTemplateService.getResolvedTemplate(templateType, eventId || null)

				if (!template) {
					return res.status(404).json({ error: true, message: `Template not found: ${templateType}` })
				}

				res.status(200).json(template)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.put('/save', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const template = await EmailTemplateService.saveTemplate(req.body, req.user._id)
				res.status(200).json(template)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/preview', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const { subject, body, variables = {} } = req.body

				if (!body) {
					return res.status(400).json({ error: true, message: 'body is required' })
				}

				const resolvedSubject = EmailTemplateService.substituteVariables(subject || '', variables)
				const resolvedBody = EmailTemplateService.substituteVariables(body, variables)
				const html = createEmailWithTemplate(resolvedBody)

				res.status(200).json({
					subject: resolvedSubject,
					body: resolvedBody,
					html
				})
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/reset/:templateType', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const { templateType } = req.params
				const { eventId } = req.body
				const result = await EmailTemplateService.resetTemplate(templateType, eventId || null)

				res.status(200).json({ success: result })
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/send-test', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const { testEmail, subject, body, variables = [] } = req.body

				if (!testEmail || !subject || !body) {
					return res.status(400).json({ error: true, message: 'Email address, subject, and body are required.' })
				}

				const sampleVars = {}

				variables.forEach((v) => {
					sampleVars[v] = `[Sample ${v}]`
				})

				const resolvedSubject = EmailTemplateService.substituteVariables(subject, sampleVars)
				const resolvedBody = EmailTemplateService.substituteVariables(body, sampleVars)
				const html = createEmailWithTemplate(resolvedBody)

				const result = await EmailService.sendEmail({
					to: testEmail,
					subject: `[TEST] ${resolvedSubject}`,
					body: html,
					bodyType: 'html',
					emailType: 'test',
					userId: req.user._id,
					templateData: { test: true }
				}, { user: req.user })

				if (!result.success) {
					throw new Error('Failed to send test email.')
				}

				res.status(200).json({ success: true })
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/key/:emailTemplateKey', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const template = await this.service.getEntityByKey(req.params.emailTemplateKey)
				res.status(200).json(template)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new EmailTemplateRoutes().getRouter()

