import BaseEntityService from './abstracts/BaseEntityService.js'
import SiteOption from '../models/siteOption.js'

/**
 * SiteOption service.
 *
 * @since 1.1.0
 */
class SiteOptionService extends BaseEntityService {
	constructor() {
		super(SiteOption, 'SiteOption')
	}

	getSearchFields() {
		return ['key', 'optionKey', 'optionName', 'group']
	}

	/**
	 * Get a site option by its option key.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} optionKey The option key.
	 * @return {Promise<Object>} The site option.
	 */
	async getByOptionKey(optionKey) {
		const option = await SiteOption.getSiteOptionByOptionKey(optionKey)

		if (!option) {
			throw new Error('Site option not found.')
		}

		return option
	}

	/**
	 * Get all public site options.
	 *
	 * @since 1.1.0
	 *
	 * @return {Promise<Array>} Public site options.
	 */
	async getPublicOptions() {
		return SiteOption.getPublicSiteOptions()
	}

	/**
	 * Get all admin site options.
	 *
	 * @since 1.1.0
	 *
	 * @return {Promise<Array>} All site options for admin.
	 */
	async getAdminOptions() {
		return SiteOption.getAdminSiteOptions()
	}

	/**
	 * Get site options by group.
	 *
	 * @since 1.1.0
	 *
	 * @param {string} group The option group.
	 * @return {Promise<Array>} Site options in the group.
	 */
	async getByGroup(group) {
		return SiteOption.getSiteOptionsByGroup(group)
	}
}

export default new SiteOptionService()

