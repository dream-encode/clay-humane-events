import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

const rootDir = path.resolve( __dirname, '..' )

export default defineConfig(({ command, mode }) => {
	process.env = { ...process.env, ...loadEnv( mode, rootDir ) }

	return {
		envDir: rootDir,
		define: {
			'process.env': {},
			global: {},
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
		server: {
			port: parseInt( process.env.VITE_SERVE_PORT ) || 3000,
			open: false,
			host: true,
			allowedHosts: [
				'.clayhumaneevents.local'
			]
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern'
				}
			}
		},
		plugins: [
			react()
		]
	}
})
