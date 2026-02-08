import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import NoteService from '../../services/note.js'

class NoteRoutes extends BaseEntityRoutes {
	constructor() {
		super(NoteService, 'Note', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/entity/:entityType/:entityId', authenticate, async (req, res) => {
			try {
				const notes = await NoteService.getNotesByEntity(req.params.entityType, req.params.entityId)
				const noteIds = notes.map((n) => n._id)
				const readNoteIds = await NoteService.getReadNoteIds(req.user._id, noteIds)

				const notesWithReadStatus = notes.map((n) => {
					const noteObj = n.toObject ? n.toObject() : n
					noteObj.isRead = readNoteIds.includes(n._id.toString())
					return noteObj
				})

				res.status(200).json(notesWithReadStatus)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/type/:entityType', authenticate, async (req, res) => {
			try {
				const notes = await NoteService.getNotesByEntityType(req.params.entityType)
				res.status(200).json(notes)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/unread-count/:entityType/:entityId', authenticate, async (req, res) => {
			try {
				const count = await NoteService.getUnreadCount(req.params.entityType, req.params.entityId, req.user._id)
				res.status(200).json({ count })
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/mark-read', authenticate, async (req, res) => {
			try {
				const { noteIds } = req.body

				if (!Array.isArray(noteIds) || noteIds.length === 0) {
					return res.status(400).json({ error: true, message: 'noteIds array is required.' })
				}

				await NoteService.markNotesAsRead(noteIds, req.user._id)
				res.status(200).json({ success: true })
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	async insertEntityHandler(req, res) {
		try {
			const note = await NoteService.insertNote(req.body, { user: req.user })

			if (!note) {
				throw new Error('Unable to save Note!')
			}

			await NoteService.markNotesAsRead([note._id], req.user._id)

			res.status(200).json(note)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	getAuthMiddleware(operation) {
		return [authenticate]
	}
}

export default new NoteRoutes().getRouter()

