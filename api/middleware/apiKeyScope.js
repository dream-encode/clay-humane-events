/**
 * Middleware to check API key scopes for entity access.
 *
 * @since [NEXT_VERSION]
 *
 * @param {string} entityType  The entity type to check scope for.
 * @param {string} permission  The permission level required ('read' or 'write').
 * @return {Function} Express middleware function.
 */
export const requireApiKeyScope = (entityType, permission) => {
	return (req, res, next) => {
		if (req.authType !== 'apiKey') {
			return next()
		}

		const scopes = req.apiKey.scopes

		if (!scopes || !scopes.has(entityType)) {
			return res.status(403).json({ error: true, message: `API key does not have ${permission} access to ${entityType}` })
		}

		const scope = scopes.get(entityType)

		if (!scope[permission]) {
			return res.status(403).json({ error: true, message: `API key does not have ${permission} access to ${entityType}` })
		}

		return next()
	}
}

