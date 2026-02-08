import BaseEntityService from './abstracts/BaseEntityService.js'
import ChangeLog from '../models/changeLog.js'

class ChangeLogService extends BaseEntityService {
	constructor() {
		super(ChangeLog, 'ChangeLog')
	}

	getSearchFields() {
		return ['key', 'entityType', 'action', 'userName']
	}

	/**
	 * Log a changelog entry.
	 *
	 * @since 1.1.0
	 *
	 * @param {Object} data Changelog entry data.
	 * @return {Promise<Object>} The saved changelog entry.
	 */
	async logChange(data) {
		const entry = new this.model(data)
		return entry.save()
	}

	/**
	 * Get changelog entries for a specific entity.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} entityType The entity type.
	 * @param {string} entityId   The entity ID.
	 * @return {Promise<Array>} Changelog entries.
	 */
	async getByEntity(entityType, entityId) {
		return this.model.find({ entityType, entityId }).sort({ createdAt: -1 })
	}

	/**
	 * Get changelog entries by entity type.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} entityType The entity type.
	 * @return {Promise<Array>} Changelog entries.
	 */
	async getByEntityType(entityType) {
		return this.model.find({ entityType }).sort({ createdAt: -1 })
	}
}

export default new ChangeLogService()

