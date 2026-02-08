import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import ScheduledTaskService from '../../services/scheduledTask.js'

class ScheduledTaskRoutes extends BaseEntityRoutes {
	constructor() {
		super(ScheduledTaskService, 'ScheduledTask', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/pending', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const tasks = await ScheduledTaskService.getPendingTasks()
				res.status(200).json(tasks)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/recurring', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const tasks = await ScheduledTaskService.getRecurringTasks()
				res.status(200).json(tasks)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/frequencies', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const frequencies = ScheduledTaskService.getRecurringFrequencies()
				res.status(200).json(frequencies)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:taskId/complete', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const task = await ScheduledTaskService.completeTask(req.params.taskId, { user: req.user })
				res.status(200).json(task)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:taskId/fail', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const task = await ScheduledTaskService.failTask(req.params.taskId, req.body.error, { user: req.user })
				res.status(200).json(task)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/:taskId/logs', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const logs = await ScheduledTaskService.getTaskLogs(req.params.taskId)
				res.status(200).json(logs)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new ScheduledTaskRoutes().getRouter()

