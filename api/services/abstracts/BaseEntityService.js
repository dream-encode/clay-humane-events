import changelogEmitter from '../../inc/changelogEmitter.js'
import { parseParamsWithDefaults } from '../../inc/helpers.js'

class BaseEntityService {
	constructor(model, entityName) {
		if (this.constructor === BaseEntityService) {
			throw new Error('BaseEntityService is abstract and cannot be instantiated directly')
		}

		this.model = model
		this.entityName = entityName
		this.entityNameLower = entityName.toLowerCase()
	}

	async getEntityByID(id) {
		return this.getEntityBy('id', id)
	}

	async getEntityByKey(key) {
		return this.getEntityBy('key', key)
	}

	async insertEntity(entityData, context = {}) {
		const newEntity = new this.model(entityData)
		const savedEntity = await newEntity.save()

		if (!savedEntity) {
			throw new Error(`Unable to save ${this.entityName}!`)
		}

		changelogEmitter.emit('entity:created', {
			entityType: this.entityName,
			entity: savedEntity,
			user: context.user || null
		})

		return savedEntity
	}

	async updateEntity(id, entityData, context = {}) {
		const before = await this.model.findById(id)
		const updatedEntity = await this.model.findByIdAndUpdate(id, entityData, { new: true })

		if (!updatedEntity) {
			throw new Error(`Unable to update ${this.entityName}!`)
		}

		changelogEmitter.emit('entity:updated', {
			entityType: this.entityName,
			entityId: id,
			before,
			after: updatedEntity,
			user: context.user || null
		})

		return updatedEntity
	}

	async deleteEntity(id, context = {}) {
		const deletedEntity = await this.model.findByIdAndDelete(id)

		if (!deletedEntity) {
			throw new Error(`Unable to delete ${this.entityName}!`)
		}

		changelogEmitter.emit('entity:deleted', {
			entityType: this.entityName,
			entity: deletedEntity,
			user: context.user || null
		})

		return deletedEntity
	}

	async getEntityBy(field, value) {
		let entity

		switch (field) {
			case 'id':
				entity = await this.model.findById(value)
				break
			case 'key':
				entity = await this.model.findOne({ key: value })
				break
			default:
				entity = await this.model.findOne({ [field]: value })
				break
		}

		if (!entity) {
			throw new Error(`No ${this.entityNameLower} found`)
		}

		return entity
	}

	async getAllEntities() {
		return await this.model.find()
	}

	async getEntities(params) {
		const { query, limit, page, sort } = parseParamsWithDefaults(params)

		const aggregation = this.model.aggregate([
			{
				$match: query
			},
			{
				$sort: sort
			},
			{
				$skip: page * limit
			},
			{
				$limit: limit || 99999999
			}
		])

		const entities = await aggregation.exec()

		if (!entities) {
			throw new Error(`Unable to get ${this.entityName}s!`)
		}

		return entities
	}

	async searchEntities(query) {
		const { s } = query

		if (!s) {
			throw new Error('Search term is required!')
		}

		return await this.model.find().or(
			this.getSearchFields().map(field => ({
				[field]: {
					"$regex": s,
					"$options": "i"
				}
			}))
		).sort({ createdAt: -1 })
	}

	getSearchFields() {
		return ['key']
	}
}

export default BaseEntityService

