import { model } from 'mongoose'

import ScheduledTaskLogSchema from '../schemas/ScheduledTaskLog.js'

const ScheduledTaskLog = model('ScheduledTaskLog', ScheduledTaskLogSchema)

ScheduledTaskLog.getScheduledTaskLogByID = (id) => {
	return ScheduledTaskLog.findById(id)
}

ScheduledTaskLog.getScheduledTaskLogByKey = (key) => {
	return ScheduledTaskLog.findOne({ key })
}

ScheduledTaskLog.getLogsByTaskId = (scheduledTaskId) => {
	return ScheduledTaskLog.find({ scheduledTaskId }).sort({ createdAt: -1 })
}

ScheduledTaskLog.searchScheduledTaskLogs = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return ScheduledTaskLog.find({
		$or: [
			{ taskService: regex },
			{ taskMethod: regex },
			{ error: regex }
		]
	}).sort({ createdAt: -1 })
}

export default ScheduledTaskLog

