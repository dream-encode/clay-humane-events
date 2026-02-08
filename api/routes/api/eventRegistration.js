import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import EventRegistrationService from '../../services/eventRegistration.js'
import { authenticate } from '../../middleware/auth.js'

class EventRegistrationRoutes extends BaseEntityRoutes {
	constructor() {
		super(EventRegistrationService, 'EventRegistration', {
			requireAuth: true,
			publicInsert: false,
			publicGetById: false
		})
	}

	addCustomRoutes() {
		this.router.get('/all', authenticate, async (req, res) => {
			try {
				const registrations = await EventRegistrationService.getAllRegistrations(req.query)

				res.status(200).json(registrations)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/counts', authenticate, async (req, res) => {
			try {
				const counts = await EventRegistrationService.getRegistrationCounts()

				res.status(200).json(counts)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/register', async (req, res) => {
			try {
				const registrationData = {
					...req.body,
					registrationIp: req.ip,
					userAgent: req.get('User-Agent')
				}

				const result = await EventRegistrationService.registerForEvent(registrationData)

				res.status(201).json(result)
			} catch (error) {
				res.status(400).json({ error: true, message: error.message })
			}
		})

		this.router.get('/event/:eventId', authenticate, async (req, res) => {
			try {
				const registrations = await EventRegistrationService.getRegistrationsByEvent(req.params.eventId)

				res.status(200).json(registrations)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/user/:userId', authenticate, async (req, res) => {
			try {
				const registrations = await EventRegistrationService.getRegistrationsByUser(req.params.userId)

				res.status(200).json(registrations)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}
}

export default new EventRegistrationRoutes().getRouter()

