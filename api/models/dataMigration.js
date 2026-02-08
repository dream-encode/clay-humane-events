import { model } from 'mongoose'

import DataMigrationSchema from '../schemas/DataMigration.js'

const DataMigration = model('DataMigration', DataMigrationSchema)

DataMigration.getDataMigrationByID = (id) => {
	return DataMigration.findById(id)
}

DataMigration.getDataMigrationByKey = (key) => {
	return DataMigration.findOne({ key })
}

DataMigration.getDataMigrationsByMigrator = (migrator) => {
	return DataMigration.find({ migrator }).sort({ createdAt: -1 })
}

DataMigration.getLatestByMigrator = (migrator) => {
	return DataMigration.findOne({ migrator }).sort({ createdAt: -1 })
}

DataMigration.getDataMigrationsByStatus = (status) => {
	return DataMigration.find({ status }).sort({ createdAt: -1 })
}

DataMigration.searchDataMigrations = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return DataMigration.find({
		$or: [
			{ migrator: regex },
			{ label: regex }
		]
	}).sort({ createdAt: -1 })
}

export default DataMigration

