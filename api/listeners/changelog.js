import changelogEmitter from '../inc/changelogEmitter.js'
import ChangeLogService from '../services/changeLog.js'

const computeChanges = (before, after) => {
	if (!before || !after) return {}

	const changes = {}
	const beforeObj = before.toObject ? before.toObject() : before
	const afterObj = after.toObject ? after.toObject() : after

	for (const key of Object.keys(afterObj)) {
		if (['_id', '__v', 'updatedAt', 'createdAt'].includes(key)) continue

		const oldVal = JSON.stringify(beforeObj[key])
		const newVal = JSON.stringify(afterObj[key])

		if (oldVal !== newVal) {
			changes[key] = { from: beforeObj[key], to: afterObj[key] }
		}
	}

	return changes
}

const toPlainObject = (doc) => {
	if (!doc) return {}
	return doc.toObject ? doc.toObject() : { ...doc }
}

const EXCLUDED_ENTITY_TYPES = ['ChangeLog']

const initChangelogListeners = () => {
	changelogEmitter.on('entity:created', async ({ entityType, entity, user }) => {
		if (EXCLUDED_ENTITY_TYPES.includes(entityType)) return

		try {
			await ChangeLogService.logChange({
				entityType,
				entityId: entity._id.toString(),
				action: 'create',
				userId: user?._id || null,
				userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'System',
				snapshot: toPlainObject(entity)
			})
		} catch (error) {
			console.error('Changelog create error:', error.message)
		}
	})

	changelogEmitter.on('entity:updated', async ({ entityType, entityId, before, after, user }) => {
		if (EXCLUDED_ENTITY_TYPES.includes(entityType)) return

		try {
			const changes = computeChanges(before, after)

			if (Object.keys(changes).length === 0) return

			await ChangeLogService.logChange({
				entityType,
				entityId: entityId.toString(),
				action: 'update',
				userId: user?._id || null,
				userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'System',
				changes,
				snapshot: toPlainObject(after)
			})
		} catch (error) {
			console.error('Changelog update error:', error.message)
		}
	})

	changelogEmitter.on('entity:deleted', async ({ entityType, entity, user }) => {
		if (EXCLUDED_ENTITY_TYPES.includes(entityType)) return

		try {
			await ChangeLogService.logChange({
				entityType,
				entityId: entity._id.toString(),
				action: 'delete',
				userId: user?._id || null,
				userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'System',
				snapshot: toPlainObject(entity)
			})
		} catch (error) {
			console.error('Changelog delete error:', error.message)
		}
	})
}

export default initChangelogListeners

