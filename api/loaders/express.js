import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import nocache from 'nocache'
import path from 'path'
import { fileURLToPath } from 'url'

import CONFIG from '../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const corsOptions = {
	origin: CONFIG.FRONTEND_URL,
	credentials: true,
}

export default async ({ app }) => {
	app.use(cors(corsOptions))
	app.use(express.urlencoded({ extended: false, limit: '50mb' }))
	app.use(express.json({ limit: '50mb' }))
	app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
	app.use(compression())
	app.use(helmet())
	app.use(nocache())

	return app
}
