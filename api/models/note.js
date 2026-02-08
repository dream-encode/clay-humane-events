import { model } from 'mongoose'

import NoteSchema from '../schemas/Note.js'

const Note = model('Note', NoteSchema)

Note.getNoteByID = (id) => {
	return Note.findById(id)
}

Note.getNoteByKey = (key) => {
	return Note.findOne({ key })
}

Note.getNotesByEntity = (entityType, entityId) => {
	return Note.find({ entityType, entityId }).sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName email')
}

Note.getNotesByEntityType = (entityType) => {
	return Note.find({ entityType }).sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName email')
}

Note.searchNotes = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return Note.find({
		$or: [
			{ note: regex },
			{ entityType: regex }
		]
	}).sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName email')
}

export default Note

