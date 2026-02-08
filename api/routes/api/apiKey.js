import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireSuperadmin } from '../../middleware/superadmin.js'
import ApiKeyService from '../../services/apiKey.js'

class ApiKeyRoutes extends BaseEntityRoutes {
	constructor() {
		super(ApiKeyService, 'ApiKey', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/key/:apiKeyKey', authenticate, requireSuperadmin, async (req, res) => {
			try {
				const apiKey = await ApiKeyService.findByKey(req.params.apiKeyKey)

				if (!apiKey) {
					throw new Error('API key not found.')
				}

				res.status(200).json(apiKey)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireSuperadmin]
	}
}

export default new ApiKeyRoutes().getRouter()

