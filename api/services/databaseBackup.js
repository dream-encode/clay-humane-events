import BaseEntityService from './abstracts/BaseEntityService.js'
import DatabaseBackup from '../models/databaseBackup.js'

/**
 * DatabaseBackup service.
 *
 * @since 1.1.0
 */
class DatabaseBackupService extends BaseEntityService {
	constructor() {
		super(DatabaseBackup, 'DatabaseBackup')
	}

	getSearchFields() {
		return ['key', 'name', 'backupPath']
	}

	/**
	 * Get backups by type.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} type The backup type (backup/restore).
	 * @return {Promise<Array>} Backups of the given type.
	 */
	async getByType(type) {
		return DatabaseBackup.getDatabaseBackupsByType(type)
	}

	/**
	 * Get active operations.
	 *
	 * @since 1.1.0
	 *
	 * @return {Promise<Array>} Active backup/restore operations.
	 */
	async getActiveOperations() {
		return DatabaseBackup.getActiveOperations()
	}

	/**
	 * Cancel an operation.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} id       The operation ID.
	 * @param {Object} context  Request context.
	 * @return {Promise<Object>} The cancelled operation.
	 */
	async cancelOperation(id, context = {}) {
		const operation = await DatabaseBackup.getDatabaseBackupByID(id)

		if (!operation) {
			throw new Error('Operation not found.')
		}

		if (!['pending', 'processing'].includes(operation.status)) {
			throw new Error('Only pending or processing operations can be cancelled.')
		}

		return this.updateEntity(id, { status: 'cancelled' }, context)
	}
}

export default new DatabaseBackupService()

