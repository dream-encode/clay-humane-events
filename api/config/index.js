import dotenv from 'dotenv'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath( import.meta.url )
const __dirname = path.dirname( __filename )
const rootDir = path.resolve( __dirname, '../..' )

const envFiles = [
	path.join( rootDir, '.env.local' ),
	path.join( rootDir, `.env.${process.env.NODE_ENV || 'development'}` ),
	path.join( rootDir, '.env' ),
]

for ( const file of envFiles ) {
	if ( existsSync( file ) ) {
		dotenv.config( { path: file } )
	}
}

export default {
	NODE_ENV: process.env.NODE_ENV,
	MONGO_DB: process.env.MONGO_DB,
	MONGO_USER: process.env.MONGO_USER,
	MONGO_PASSWORD: process.env.MONGO_PASSWORD,
	MONGO_HOST: process.env.MONGO_HOST,
	MONGO_PORT: process.env.MONGO_PORT,
	MONGO_AUTH_SOURCE: process.env.MONGO_AUTH_SOURCE,
	API_PORT: process.env.API_PORT,
	FRONTEND_URL: process.env.FRONTEND_URL,
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_SECURE: process.env.SMTP_SECURE === 'true',
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASS: process.env.SMTP_PASS,
	SMTP_FROM: process.env.SMTP_FROM,
}
