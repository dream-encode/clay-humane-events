import { model } from 'mongoose'

import EventSchema from '../schemas/Event.js'

const Event = model('Event', EventSchema)

Event.getEventByID = (id) => {
	return Event.findById(id)
}

Event.getEventByKey = (key) => {
	return Event.findOne({ key })
}

Event.searchEvents = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return Event.find({
		$or: [
			{ eventName: regex },
			{ eventDescription: regex }
		],
		isActive: true
	})
}

export default Event

