import { Schema } from 'mongoose'

/**
 * Tracks per-user read status for notes.
 *
 * @since [NEXT_VERSION]
 */
const NoteReadSchema = new Schema({
	noteId: {
		type: Schema.Types.ObjectId,
		ref: 'Note',
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	readAt: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true
})

NoteReadSchema.index({ noteId: 1, userId: 1 }, { unique: true })
NoteReadSchema.index({ userId: 1 })

export default NoteReadSchema

