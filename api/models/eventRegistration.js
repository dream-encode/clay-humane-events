import { model } from 'mongoose'

import EventRegistrationSchema from '../schemas/EventRegistration.js'

const EventRegistration = model('EventRegistration', EventRegistrationSchema)

EventRegistration.getRegistrationByID = (id) => {
	return EventRegistration.findById(id)
}

EventRegistration.getRegistrationByKey = (key) => {
	return EventRegistration.findOne({ key })
}

EventRegistration.getRegistrationsByEventId = (eventId) => {
	return EventRegistration.find({ eventId })
}

EventRegistration.getRegistrationsByUserId = (userId) => {
	return EventRegistration.find({ userId })
}

EventRegistration.getRegistrationByEventAndUser = (eventId, userId) => {
	return EventRegistration.findOne({ eventId, userId })
}

export default EventRegistration

