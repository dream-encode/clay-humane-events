import mongoose from 'mongoose'

import CONFIG from '../config/index.js'
import { logFile } from '../inc/helpers.js'

export default async () => {
	const username = encodeURIComponent( CONFIG.MONGO_USER );
	const password = encodeURIComponent( CONFIG.MONGO_PASSWORD );
	const dbName = CONFIG.MONGO_DB;

	const uri = `mongodb://${username}:${password}@${CONFIG.MONGO_HOST}:${CONFIG.MONGO_PORT}/${dbName}?authSource=${CONFIG.MONGO_AUTH_SOURCE}`;

	try {
		const connection = await mongoose.connect(uri)

		logFile('MongoDB connected successfully')

		return connection.connection.db
	} catch (error) {
		logFile(`MongoDB connection error: ${error.message}`)

		throw error
	}
}
