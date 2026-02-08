import { model } from 'mongoose'

import SiteOptionSchema from '../schemas/SiteOption.js'

const SiteOption = model('SiteOption', SiteOptionSchema)

SiteOption.getSiteOptionByID = (id) => {
	return SiteOption.findById(id)
}

SiteOption.getSiteOptionByKey = (key) => {
	return SiteOption.findOne({ key })
}

SiteOption.getSiteOptionByOptionKey = (optionKey) => {
	return SiteOption.findOne({ optionKey })
}

SiteOption.getPublicSiteOptions = () => {
	return SiteOption.find({ optionIsPublic: true }).sort({ optionName: 1 })
}

SiteOption.getAdminSiteOptions = () => {
	return SiteOption.find().sort({ group: 1, optionName: 1 })
}

SiteOption.getSiteOptionsByGroup = (group) => {
	return SiteOption.find({ group }).sort({ optionName: 1 })
}

SiteOption.searchSiteOptions = (searchTerm) => {
	const regex = new RegExp(searchTerm, 'i')
	return SiteOption.find({
		$or: [
			{ optionKey: regex },
			{ optionName: regex },
			{ group: regex }
		]
	}).sort({ optionName: 1 })
}

export default SiteOption

