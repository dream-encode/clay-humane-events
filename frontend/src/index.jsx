import { library } from '@fortawesome/fontawesome-svg-core'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

const iconList = Object.keys( Icons )
	.filter( ( key ) => key !== 'fas' && key !== 'prefix' )
	.map( ( icon ) => Icons[ icon ] )

library.add( ...iconList )

import './assets/sass/main.scss'

const root = ReactDOM.createRoot( document.getElementById( 'root' ) )

root.render(
	<BrowserRouter future={{
		v7_startTransition: true,
		v7_relativeSplatPath: true
	}}>
		<App />
	</BrowserRouter>
)

