import { model } from 'mongoose'

import ApiKeySchema from '../schemas/ApiKey.js'

const ApiKey = model('ApiKey', ApiKeySchema)

ApiKey.getApiKeyByID = (id) => {
	return ApiKey.findById(id)
}

ApiKey.getApiKeyByKey = (key) => {
	return ApiKey.findOne({ key })
}

ApiKey.searchApiKeys = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return ApiKey.find({
		$or: [
			{ key: regex },
			{ name: regex }
		]
	}).sort({ createdAt: -1 })
}

export default ApiKey

