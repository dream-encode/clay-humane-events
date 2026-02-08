import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import EventService from '../../services/event.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createUploadDir = (subDir) => {
	const dir = path.join(__dirname, '..', '..', 'uploads', 'events', subDir)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
	return dir
}

const logosDir = createUploadDir('logos')
const flyersDir = createUploadDir('flyers')
const waiversDir = createUploadDir('waivers')

const createStorage = (destDir, prefix) => {
	return multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, destDir)
		},
		filename: function (req, file, cb) {
			const eventId = req.params.eventID || 'unknown'
			const ext = path.extname(file.originalname)
			cb(null, `${prefix}-${eventId}-${Date.now()}${ext}`)
		}
	})
}

const imageFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/
	const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
	const mimetype = allowedTypes.test(file.mimetype)
	if (mimetype && extname) {
		return cb(null, true)
	}
	cb(new Error('Only image files are allowed!'))
}

const documentFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/
	const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
	const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf'
	if (mimetype && extname) {
		return cb(null, true)
	}
	cb(new Error('Only image and PDF files are allowed!'))
}

const uploadLogo = multer({ storage: createStorage(logosDir, 'logo'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter })
const uploadFlyer = multer({ storage: createStorage(flyersDir, 'flyer'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: documentFilter })
const uploadWaiver = multer({ storage: createStorage(waiversDir, 'waiver'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: documentFilter })

class EventRoutes extends BaseEntityRoutes {
	constructor() {
		super(EventService, 'Event', {
			requireAuth: true,
			publicInsert: false,
			publicGetById: false,
			publicGetByKey: true
		})
	}

	addCustomRoutes() {
		this.router.get('/next', authenticate, async (req, res) => {
			try {
				const event = await this.service.getNextEvent()
				res.status(200).json(event || null)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/public/open', async (req, res) => {
			try {
				const events = await this.service.getOpenRegistrationEvents()
				res.status(200).json(events)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/key/:eventKey', this.getAuthMiddleware('getByKey'), async (req, res) => {
			const { eventKey } = req.params

			try {
				const event = await this.service.getEventByKeyOrSlug(eventKey)
				res.status(200).json(event)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/upload-logo', authenticate, uploadLogo.single('logo'), async (req, res) => {
			try {
				const { eventID } = req.params

				if (!req.file) {
					throw new Error('No file uploaded!')
				}

				const event = await this.service.getEntityByID(eventID)
				if (event.eventLogo) {
					const oldPath = path.join(__dirname, '..', '..', event.eventLogo)
					if (fs.existsSync(oldPath)) {
						fs.unlinkSync(oldPath)
					}
				}

				const logoPath = `/uploads/events/logos/${req.file.filename}`
				const updatedEvent = await this.service.updateEntity(eventID, { eventLogo: logoPath }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/upload-flyer', authenticate, uploadFlyer.single('flyer'), async (req, res) => {
			try {
				const { eventID } = req.params

				if (!req.file) {
					throw new Error('No file uploaded!')
				}

				const flyerPath = `/uploads/events/flyers/${req.file.filename}`
				const event = await this.service.getEntityByID(eventID)
				const updatedFlyers = [...(event.eventFlyers || []), flyerPath]
				const updatedEvent = await this.service.updateEntity(eventID, { eventFlyers: updatedFlyers }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/delete-flyer', authenticate, async (req, res) => {
			try {
				const { eventID } = req.params
				const { filePath } = req.body

				if (!filePath) {
					throw new Error('File path is required!')
				}

				const fullPath = path.join(__dirname, '..', '..', filePath)
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath)
				}

				const event = await this.service.getEntityByID(eventID)
				const updatedFlyers = (event.eventFlyers || []).filter(f => f !== filePath)
				const updatedEvent = await this.service.updateEntity(eventID, { eventFlyers: updatedFlyers }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/upload-waiver', authenticate, uploadWaiver.single('waiver'), async (req, res) => {
			try {
				const { eventID } = req.params

				if (!req.file) {
					throw new Error('No file uploaded!')
				}

				const waiverPath = `/uploads/events/waivers/${req.file.filename}`
				const event = await this.service.getEntityByID(eventID)
				const updatedWaivers = [...(event.eventWaivers || []), waiverPath]
				const updatedEvent = await this.service.updateEntity(eventID, { eventWaivers: updatedWaivers }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/delete-waiver', authenticate, async (req, res) => {
			try {
				const { eventID } = req.params
				const { filePath } = req.body

				if (!filePath) {
					throw new Error('File path is required!')
				}

				const fullPath = path.join(__dirname, '..', '..', filePath)
				if (fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath)
				}

				const event = await this.service.getEntityByID(eventID)
				const updatedWaivers = (event.eventWaivers || []).filter(f => f !== filePath)
				const updatedEvent = await this.service.updateEntity(eventID, { eventWaivers: updatedWaivers }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:eventID/delete-logo', authenticate, async (req, res) => {
			try {
				const { eventID } = req.params
				const event = await this.service.getEntityByID(eventID)

				if (event.eventLogo) {
					const fullPath = path.join(__dirname, '..', '..', event.eventLogo)
					if (fs.existsSync(fullPath)) {
						fs.unlinkSync(fullPath)
					}
				}

				const updatedEvent = await this.service.updateEntity(eventID, { eventLogo: '' }, { user: req.user })

				res.status(200).json(updatedEvent)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}
}

export default new EventRoutes().getRouter()

