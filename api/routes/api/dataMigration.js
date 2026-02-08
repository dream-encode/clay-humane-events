import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import DataMigrationService from '../../services/dataMigration.js'

class DataMigrationRoutes extends BaseEntityRoutes {
	constructor() {
		super(DataMigrationService, 'DataMigration', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/id/:migrationId/progress', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const progress = await DataMigrationService.getMigrationProgress(req.params.migrationId)
				res.status(200).json(progress)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/migrator/:migrator/latest', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const migration = await DataMigrationService.getLatestByMigrator(req.params.migrator)
				res.status(200).json(migration)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.post('/id/:migrationId/cancel', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const migration = await DataMigrationService.cancelMigration(req.params.migrationId, { user: req.user })
				res.status(200).json(migration)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new DataMigrationRoutes().getRouter()

