import { Router } from 'express'

import { authenticate } from '../../middleware/auth.js'
import { requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import AnalyticsService from '../../services/analytics.js'

const AnalyticsRoutes = Router()

AnalyticsRoutes.get('/entityTypes', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const types = AnalyticsService.getValidEntityTypes()
		res.status(200).json(types)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

AnalyticsRoutes.get('/:entityType/hourly', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const data = await AnalyticsService.getTimeData(req.params.entityType, 'hour', req.query)
		res.status(200).json(data)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

AnalyticsRoutes.get('/:entityType/daily', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const data = await AnalyticsService.getTimeData(req.params.entityType, 'day', req.query)
		res.status(200).json(data)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

AnalyticsRoutes.get('/:entityType/monthly', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const data = await AnalyticsService.getTimeData(req.params.entityType, 'month', req.query)
		res.status(200).json(data)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

AnalyticsRoutes.get('/:entityType/yearly', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const data = await AnalyticsService.getTimeData(req.params.entityType, 'year', req.query)
		res.status(200).json(data)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

AnalyticsRoutes.get('/:entityType/stats', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const stats = await AnalyticsService.getEntityStats(req.params.entityType)
		res.status(200).json(stats)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

export default AnalyticsRoutes

