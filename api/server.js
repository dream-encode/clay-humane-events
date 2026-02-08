import express from 'express'
import CONFIG from './config/index.js'
import { logFile } from './inc/helpers.js'

async function startServer() {
	const app = express()

	await( await import('./loaders/index.js') ).default({ expressApp: app })

	app.listen(CONFIG.API_PORT, err => {
		if (err) {
			logFile(err)
			return
		}

		logFile(`App listening at http://localhost:${CONFIG.API_PORT}`)
	})
}

startServer()

