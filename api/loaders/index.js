import expressLoader from './express.js'
import initChangelogListeners from '../listeners/changelog.js'
import mongooseLoader from './mongoose.js'
import routesLoader from './routes.js'

const load = async ({ expressApp }) => {
	await mongooseLoader()

	initChangelogListeners()

	await expressLoader({ app: expressApp })

	await routesLoader({ app: expressApp })
}

export default load

