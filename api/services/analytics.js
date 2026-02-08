import AdminNotification from '../models/adminNotification.js'
import AuthSession from '../models/authSession.js'
import ChangeLog from '../models/changeLog.js'
import Email from '../models/email.js'
import Event from '../models/event.js'
import EventRegistration from '../models/eventRegistration.js'
import User from '../models/user.js'
import Note from '../models/note.js'
import DatabaseBackup from '../models/databaseBackup.js'
import DataMigration from '../models/dataMigration.js'
import ScheduledTask from '../models/scheduledTask.js'
import SiteOption from '../models/siteOption.js'

const ENTITY_MAP = {
	AdminNotification,
	AuthSession,
	ChangeLog,
	Email,
	Event,
	EventRegistration,
	User,
	Note,
	DatabaseBackup,
	DataMigration,
	ScheduledTask,
	SiteOption
}

/**
 * Analytics service for aggregating entity data.
 *
 * @since [NEXT_VERSION]
 */
class AnalyticsService {
	/**
	 * Get the model for an entity type.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} entityType The entity type.
	 * @return {Object} The mongoose model.
	 */
	getModel(entityType) {
		const model = ENTITY_MAP[entityType]

		if (!model) {
			throw new Error(`Invalid entity type: ${entityType}`)
		}

		return model
	}

	/**
	 * Get valid entity types.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @return {Array} Valid entity type names.
	 */
	getValidEntityTypes() {
		return Object.keys(ENTITY_MAP)
	}

	/**
	 * Get time-based aggregated data.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} entityType The entity type.
	 * @param {string} unit       The time unit (minute, hour, day, month, year).
	 * @param {Object} filters    Optional filters (startDate, endDate).
	 * @return {Promise<Array>} Aggregated data.
	 */
	async getTimeData(entityType, unit, filters = {}) {
		const model = this.getModel(entityType)
		const match = {}

		if (filters.startDate || filters.endDate) {
			match.createdAt = {}
			if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate)
			if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate)
		}

		const pipeline = [
			{ $match: match },
			{
				$group: {
					_id: { $dateTrunc: { date: '$createdAt', unit } },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } },
			{ $project: { _id: 0, date: '$_id', count: 1 } }
		]

		return model.aggregate(pipeline)
	}

	/**
	 * Get entity stats.
	 *
	 * @since [NEXT_VERSION]
	 *
	 * @param {string} entityType The entity type.
	 * @return {Promise<Object>} Entity statistics.
	 */
	async getEntityStats(entityType) {
		const model = this.getModel(entityType)

		const [total, firstRecord, lastRecord] = await Promise.all([
			model.countDocuments(),
			model.findOne().sort({ createdAt: 1 }).select('createdAt').lean(),
			model.findOne().sort({ createdAt: -1 }).select('createdAt').lean()
		])

		return {
			total,
			firstRecord: firstRecord?.createdAt || null,
			lastRecord: lastRecord?.createdAt || null
		}
	}
}

export default new AnalyticsService()

