import { model } from 'mongoose'

import EmailSchema from '../schemas/Email.js'

const Email = model('Email', EmailSchema)

Email.getEmailByID = (id) => {
	return Email.findById(id)
}

Email.getEmailByKey = (key) => {
	return Email.findOne({ key })
}

Email.getEmailByMessageId = (messageId) => {
	return Email.findOne({ messageId })
}

Email.searchEmails = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return Email.find({
		$or: [
			{ to: regex },
			{ from: regex },
			{ subject: regex }
		]
	}).sort({ createdAt: -1 })
}

export default Email

