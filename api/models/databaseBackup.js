import { model } from 'mongoose'

import DatabaseBackupSchema from '../schemas/DatabaseBackup.js'

const DatabaseBackup = model('DatabaseBackup', DatabaseBackupSchema)

DatabaseBackup.getDatabaseBackupByID = (id) => {
	return DatabaseBackup.findById(id)
}

DatabaseBackup.getDatabaseBackupByKey = (key) => {
	return DatabaseBackup.findOne({ key })
}

DatabaseBackup.getDatabaseBackupsByType = (type) => {
	return DatabaseBackup.find({ type }).sort({ createdAt: -1 })
}

DatabaseBackup.getDatabaseBackupsByStatus = (status) => {
	return DatabaseBackup.find({ status }).sort({ createdAt: -1 })
}

DatabaseBackup.getActiveOperations = () => {
	return DatabaseBackup.find({ status: { $in: ['pending', 'processing'] } }).sort({ createdAt: -1 })
}

DatabaseBackup.searchDatabaseBackups = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return DatabaseBackup.find({
		$or: [
			{ name: regex },
			{ backupPath: regex }
		]
	}).sort({ createdAt: -1 })
}

export default DatabaseBackup

