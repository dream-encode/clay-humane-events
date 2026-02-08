import BaseEntityService from './abstracts/BaseEntityService.js'
import ApiKey from '../models/apiKey.js'

/**
 * ApiKey service.
 *
 * @since 1.1.0
 */
class ApiKeyService extends BaseEntityService {
	constructor() {
		super(ApiKey, 'ApiKey')
	}

	getSearchFields() {
		return ['key', 'name']
	}

	/**
	 * Find an API key by its key value.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} key The API key value.
	 * @return {Promise<Object|null>} The API key or null.
	 */
	async findByKey(key) {
		return ApiKey.findOne({ key, isActive: true })
	}
}

export default new ApiKeyService()

