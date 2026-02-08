import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { requireApiKeyScope } from '../../middleware/apiKeyScope.js'

class BaseEntityRoutes {
	constructor(service, entityName, options = {}) {
		if (this.constructor === BaseEntityRoutes) {
			throw new Error('BaseEntityRoutes is abstract and cannot be instantiated directly')
		}

		this.service = service
		this.entityName = entityName
		this.entityNameLower = entityName.toLowerCase()
		this.entityNameCamel = this.toCamelCase(entityName)
		this.entityIdParam = `${this.entityNameCamel}ID`

		this.options = {
			requireAuth: true,
			publicInsert: false,
			publicGetById: false,
			publicGetByKey: false,
			...options
		}

		this.router = Router()
		this.addCustomRoutes()
		this.setupRoutes()
	}

	addCustomRoutes() {
		// Default implementation does nothing.
	}

	toCamelCase(str) {
		return str.charAt(0).toLowerCase() + str.slice(1)
	}

	setupRoutes() {
		this.router.post('/', this.getAuthMiddleware('insert'), requireApiKeyScope(this.entityNameCamel, 'write'), this.insertEntityHandler.bind(this))
		this.router.get(`/id/:${this.entityIdParam}`, this.getAuthMiddleware('getById'), requireApiKeyScope(this.entityNameCamel, 'read'), this.getEntityByIdHandler.bind(this))
		this.router.get('/search', this.getAuthMiddleware('search'), requireApiKeyScope(this.entityNameCamel, 'read'), this.searchEntitiesHandler.bind(this))
		this.router.delete(`/:${this.entityIdParam}`, this.getAuthMiddleware('delete'), requireApiKeyScope(this.entityNameCamel, 'write'), this.deleteEntityHandler.bind(this))
		this.router.post(`/:${this.entityIdParam}`, this.getAuthMiddleware('update'), requireApiKeyScope(this.entityNameCamel, 'write'), this.updateEntityHandler.bind(this))
		this.router.get('/', this.getAuthMiddleware('getAll'), requireApiKeyScope(this.entityNameCamel, 'read'), this.getEntitiesHandler.bind(this))
	}

	getAuthMiddleware(operation) {
		const publicOperations = {
			insert: this.options.publicInsert,
			getById: this.options.publicGetById,
			getByKey: this.options.publicGetByKey,
			search: false,
			delete: false,
			update: false,
			getAll: false
		}

		return publicOperations[operation] ? (req, res, next) => next() : authenticate
	}

	async insertEntityHandler(req, res) {
		try {
			const entity = await this.service.insertEntity(req.body, { user: req.user })

			if (!entity) {
				throw new Error(`Unable to save ${this.entityName}!`)
			}

			res.status(200).json(entity)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	async getEntityByIdHandler(req, res) {
		const entityId = req.params[this.entityIdParam]

		try {
			const entity = await this.service.getEntityByID(entityId)

			res.status(200).json(entity)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	async searchEntitiesHandler(req, res) {
		const params = req.query

		try {
			const entities = await this.service.searchEntities(params)

			if (!entities) {
				throw new Error(`Unable to search ${this.entityName}s!`)
			}

			res.status(200).json(entities)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	async deleteEntityHandler(req, res) {
		const entityId = req.params[this.entityIdParam]

		try {
			const removed = await this.service.deleteEntity(entityId, { user: req.user })

			if (!removed) {
				throw new Error(`Unable to delete ${this.entityName}!`)
			}

			res.status(200).json(removed)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	async updateEntityHandler(req, res) {
		const entityId = req.params[this.entityIdParam]

		try {
			const entity = await this.service.updateEntity(entityId, req.body, { user: req.user })

			if (!entity) {
				throw new Error(`Unable to update ${this.entityName}!`)
			}

			res.status(200).json(entity)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	async getEntitiesHandler(req, res) {
		const params = req.query

		try {
			const entities = await this.service.getEntities(params)

			if (!entities) {
				throw new Error(`Unable to get ${this.entityName}s!`)
			}

			res.status(200).json(entities)
		} catch (error) {
			res.status(200).json({ error: true, message: error.message })
		}
	}

	getRouter() {
		return this.router
	}
}

export default BaseEntityRoutes

