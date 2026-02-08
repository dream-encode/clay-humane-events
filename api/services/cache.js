const CACHE_ENABLED = false

class CacheService {
	constructor() {
		this.cacheGroup = 'CLAY_HUMANE_EVENTS'
	}

	async add(key, value, expire = false) {
		if (!CACHE_ENABLED) {
			return
		}
	}

	async set(key, value, expire = false) {
		if (!CACHE_ENABLED) {
			return
		}
	}

	async get(key) {
		if (!CACHE_ENABLED) {
			return false
		}
	}

	async delete(key) {
		if (!CACHE_ENABLED) {
			return
		}
	}
}

export default new CacheService()

