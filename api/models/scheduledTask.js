import { model } from 'mongoose'

import ScheduledTaskSchema from '../schemas/ScheduledTask.js'

const ScheduledTask = model('ScheduledTask', ScheduledTaskSchema)

ScheduledTask.getScheduledTaskByID = (id) => {
	return ScheduledTask.findById(id)
}

ScheduledTask.getScheduledTaskByKey = (key) => {
	return ScheduledTask.findOne({ key })
}

ScheduledTask.getPendingTasks = () => {
	return ScheduledTask.find({
		status: 'PENDING',
		scheduledDate: { $lte: new Date() }
	}).sort({ scheduledDate: 1 })
}

ScheduledTask.getRecurringTasks = () => {
	return ScheduledTask.find({ recurring: true }).sort({ createdAt: -1 })
}

ScheduledTask.getTasksByStatus = (status) => {
	return ScheduledTask.find({ status }).sort({ createdAt: -1 })
}

ScheduledTask.searchScheduledTasks = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return ScheduledTask.find({
		$or: [
			{ taskService: regex },
			{ taskMethod: regex }
		]
	}).sort({ createdAt: -1 })
}

export default ScheduledTask

