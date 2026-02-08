import { model } from 'mongoose'

import NoteReadSchema from '../schemas/NoteRead.js'

const NoteRead = model('NoteRead', NoteReadSchema)

/**
 * Mark a note as read for a user.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} noteId The note ID.
 * @param {string} userId The user ID.
 * @return {Promise<Object>} The upserted NoteRead document.
 */
NoteRead.markAsRead = (noteId, userId) => {
	return NoteRead.findOneAndUpdate(
		{ noteId, userId },
		{ noteId, userId, readAt: new Date() },
		{ upsert: true, new: true }
	)
}

/**
 * Mark multiple notes as read for a user.
 *
 * @since [NEXT_VERSION]
 *
 * @param {Array}  noteIds The note IDs.
 * @param {string} userId  The user ID.
 * @return {Promise<Object>} The bulk write result.
 */
NoteRead.markManyAsRead = (noteIds, userId) => {
	const ops = noteIds.map((noteId) => ({
		updateOne: {
			filter: { noteId, userId },
			update: { noteId, userId, readAt: new Date() },
			upsert: true
		}
	}))

	return NoteRead.bulkWrite(ops)
}

/**
 * Get read note IDs for a user from a list of note IDs.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} userId  The user ID.
 * @param {Array}  noteIds The note IDs to check.
 * @return {Promise<Array>} Array of read note ID strings.
 */
NoteRead.getReadNoteIds = async (userId, noteIds) => {
	const reads = await NoteRead.find({ userId, noteId: { $in: noteIds } }).select('noteId').lean()
	return reads.map((r) => r.noteId.toString())
}

/**
 * Get unread note count for an entity and user.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} userId     The user ID.
 * @param {Array}  allNoteIds All note IDs for the entity.
 * @return {Promise<number>} The unread count.
 */
NoteRead.getUnreadCount = async (userId, allNoteIds) => {
	if (!allNoteIds.length) return 0

	const readCount = await NoteRead.countDocuments({ userId, noteId: { $in: allNoteIds } })
	return allNoteIds.length - readCount
}

export default NoteRead

