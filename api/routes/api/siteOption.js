import BaseEntityRoutes from '../abstracts/BaseEntityRoutes.js'
import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import SiteOptionService from '../../services/siteOption.js'

class SiteOptionRoutes extends BaseEntityRoutes {
	constructor() {
		super(SiteOptionService, 'SiteOption', {
			requireAuth: true
		})
	}

	addCustomRoutes() {
		this.router.get('/public', async (req, res) => {
			try {
				const options = await SiteOptionService.getPublicOptions()
				res.status(200).json(options)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/admin', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const options = await SiteOptionService.getAdminOptions()
				res.status(200).json(options)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/key/:optionKey', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const option = await SiteOptionService.getByOptionKey(req.params.optionKey)
				res.status(200).json(option)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})

		this.router.get('/group/:group', authenticate, requireAdminOrSuperadmin, async (req, res) => {
			try {
				const options = await SiteOptionService.getByGroup(req.params.group)
				res.status(200).json(options)
			} catch (error) {
				res.status(200).json({ error: true, message: error.message })
			}
		})
	}

	getAuthMiddleware(operation) {
		return [authenticate, requireAdminOrSuperadmin]
	}
}

export default new SiteOptionRoutes().getRouter()

