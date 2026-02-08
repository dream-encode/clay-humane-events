import BaseEntityService from './abstracts/BaseEntityService.js'
import DataMigration from '../models/dataMigration.js'

/**
 * DataMigration service.
 *
 * @since 1.1.0
 */
class DataMigrationService extends BaseEntityService {
	constructor() {
		super(DataMigration, 'DataMigration')
	}

	getSearchFields() {
		return ['key', 'migrator', 'label']
	}

	/**
	 * Get the latest migration for a migrator.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} migrator The migrator identifier.
	 * @return {Promise<Object>} The latest migration.
	 */
	async getLatestByMigrator(migrator) {
		return DataMigration.getLatestByMigrator(migrator)
	}

	/**
	 * Get migration progress.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} id The migration ID.
	 * @return {Promise<Object>} Migration progress data.
	 */
	async getMigrationProgress(id) {
		const migration = await DataMigration.getDataMigrationByID(id)

		if (!migration) {
			throw new Error('Migration not found.')
		}

		return {
			status: migration.status,
			percentComplete: migration.percentComplete,
			totalRows: migration.totalRows,
			totalRowsMigrated: migration.totalRowsMigrated,
			totalRowsFailed: migration.totalRowsFailed,
			totalRowsSkipped: migration.totalRowsSkipped,
			complete: migration.complete
		}
	}

	/**
	 * Cancel a migration.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} id      The migration ID.
	 * @param {Object} context Request context.
	 * @return {Promise<Object>} The cancelled migration.
	 */
	async cancelMigration(id, context = {}) {
		const migration = await DataMigration.getDataMigrationByID(id)

		if (!migration) {
			throw new Error('Migration not found.')
		}

		if (!['pending', 'processing'].includes(migration.status)) {
			throw new Error('Only pending or processing migrations can be cancelled.')
		}

		return this.updateEntity(id, { status: 'cancelled' }, context)
	}
}

export default new DataMigrationService()

