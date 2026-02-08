export const requireSuperadmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: true, message: 'Authentication required' })
	}

	if (req.user.role !== 'superadmin') {
		return res.status(403).json({ error: true, message: 'Superadmin access required' })
	}

	next()
}

export const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: true, message: 'Authentication required' })
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({ error: true, message: 'Admin access required' })
	}

	next()
}

export const requireAdminOrSuperadmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: true, message: 'Authentication required' })
	}

	if (!['admin', 'superadmin'].includes(req.user.role)) {
		return res.status(403).json({ error: true, message: 'Admin or superadmin access required' })
	}

	next()
}

