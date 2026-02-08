import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import ChangeLogService from '../../services/changeLog.js'

class ChangeLogRoutes extends BaseEntityRoutes {
	constructor() {
		super(ChangeLogService, 'ChangeLog', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/entity/:entityType/:entityId', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const entries = await ChangeLogService.getByEntity(req.params.entityType, req.params.entityId)
				res.status(200).json(entries)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/type/:entityType', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const entries = await ChangeLogService.getByEntityType(req.params.entityType)
				res.status(200).json(entries)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new ChangeLogRoutes().getRouter()

