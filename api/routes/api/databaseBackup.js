import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import DatabaseBackupService from '../../services/databaseBackup.js'

class DatabaseBackupRoutes extends BaseEntityRoutes {
	constructor() {
		super(DatabaseBackupService, 'DatabaseBackup', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/active', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const operations = await DatabaseBackupService.getActiveOperations()
				res.status(200).json(operations)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/type/:type', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const backups = await DatabaseBackupService.getByType(req.params.type)
				res.status(200).json(backups)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/:operationId/cancel', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const operation = await DatabaseBackupService.cancelOperation(req.params.operationId, { user: req.user })
				res.status(200).json(operation)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new DatabaseBackupRoutes().getRouter()

