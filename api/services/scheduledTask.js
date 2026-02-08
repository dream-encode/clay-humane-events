import BaseEntityService from './abstracts/BaseEntityService.js'
import ScheduledTask from '../models/scheduledTask.js'
import ScheduledTaskLog from '../models/scheduledTaskLog.js'

/**
 * ScheduledTask service.
 *
 * @since [NEXT_VERSION]
 */
class ScheduledTaskService extends BaseEntityService {
	constructor() {
		super(ScheduledTask, 'ScheduledTask')
	}

	getSearchFields() {
		return ['key', 'taskService', 'taskMethod']
	}

	/**
	 * Get pending tasks ready to run.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Promise<Array>} Pending tasks.
	 */
	async getPendingTasks() {
		return ScheduledTask.getPendingTasks()
	}

	/**
	 * Get recurring tasks.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Promise<Array>} Recurring tasks.
	 */
	async getRecurringTasks() {
		return ScheduledTask.getRecurringTasks()
	}

	/**
	 * Complete a scheduled task.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} id      The task ID.
	 * @param {Object} context Request context.
	 * @return {Promise<Object>} The completed task.
	 */
	async completeTask(id, context = {}) {
		return this.updateEntity(id, { status: 'COMPLETE', lastAttempt: new Date() }, context)
	}

	/**
	 * Fail a scheduled task.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} id      The task ID.
	 * @param {string} error   The error message.
	 * @param {Object} context Request context.
	 * @return {Promise<Object>} The failed task.
	 */
	async failTask(id, error, context = {}) {
		const task = await ScheduledTask.getScheduledTaskByID(id)

		if (!task) {
			throw new Error('Task not found.')
		}

		const errors = [...(task.errors || []), { message: error, date: new Date() }]
		return this.updateEntity(id, { status: 'FAILED', lastAttempt: new Date(), errors, attempts: task.attempts + 1 }, context)
	}

	/**
	 * Get task logs for a specific task.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} taskId The task ID.
	 * @return {Promise<Array>} Task logs.
	 */
	async getTaskLogs(taskId) {
		return ScheduledTaskLog.getLogsByTaskId(taskId)
	}

	/**
	 * Create a task log entry.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {Object} logData The log data.
	 * @return {Promise<Object>} The saved log entry.
	 */
	async createTaskLog(logData) {
		const log = new ScheduledTaskLog(logData)
		return log.save()
	}

	/**
	 * Get recurring frequency options.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Array} Available recurring frequencies.
	 */
	getRecurringFrequencies() {
		return ['minutely', 'hourly', 'daily', 'weekly', 'monthly']
	}
}

export default new ScheduledTaskService()

