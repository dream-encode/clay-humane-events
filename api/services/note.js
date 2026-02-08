import BaseEntityService from './abstracts/BaseEntityService.js'
import Note from '../models/note.js'
import NoteRead from '../models/noteRead.js'

/**
 * Note service for abstract notes linked to any entity type.
 *
 * @since 1.1.0
 */
class NoteService extends BaseEntityService {
	constructor() {
		super(Note, 'Note')
	}

	getSearchFields() {
		return ['key', 'note', 'entityType']
	}

	/**
	 * Get notes for a specific entity.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} entityType The entity type.
	 * @param {string} entityId   The entity ID.
	 * @return {Promise<Array>} Notes for the entity.
	 */
	async getNotesByEntity(entityType, entityId) {
		return Note.getNotesByEntity(entityType, entityId)
	}

	/**
	 * Get notes by entity type.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} entityType The entity type.
	 * @return {Promise<Array>} Notes for the entity type.
	 */
	async getNotesByEntityType(entityType) {
		return Note.getNotesByEntityType(entityType)
	}

	/**
	 * Insert a note with the creating user.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} noteData The note data.
	 * @param {Object} context  Request context.
	 * @return {Promise<Object>} The saved note.
	 */
	async insertNote(noteData, context = {}) {
		if (context.user) {
			noteData.createdBy = context.user._id
		}

		return this.insertEntity(noteData, context)
	}

	/**
	 * Mark notes as read for a user.
	 *
	 * @since 1.1.0
	 *
	 * @param {Array}  noteIds The note IDs.
	 * @param {string} userId  The user ID.
	 * @return {Promise<Object>} The bulk write result.
	 */
	async markNotesAsRead(noteIds, userId) {
		return NoteRead.markManyAsRead(noteIds, userId)
	}

	/**
	 * Get unread note count for an entity and user.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} entityType The entity type.
	 * @param {string} entityId   The entity ID.
	 * @param {string} userId     The user ID.
	 * @return {Promise<number>} The unread count.
	 */
	async getUnreadCount(entityType, entityId, userId) {
		const notes = await Note.find({ entityType, entityId }).select('_id').lean()
		const noteIds = notes.map((n) => n._id)
		return NoteRead.getUnreadCount(userId, noteIds)
	}

	/**
	 * Get read note IDs for a user from a set of notes.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} userId  The user ID.
	 * @param {Array}  noteIds The note IDs.
	 * @return {Promise<Array>} Array of read note ID strings.
	 */
	async getReadNoteIds(userId, noteIds) {
		return NoteRead.getReadNoteIds(userId, noteIds)
	}
}

export default new NoteService()

