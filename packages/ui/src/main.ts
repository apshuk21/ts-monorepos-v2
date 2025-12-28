import { mount } from 'svelte'
import './app.scss'
import App from './App.svelte'

const appContainer = document.getElementById('app')

if (!appContainer) {
	throw new Error('App container not found')
}

const app = mount(App, {
	target: appContainer,
})

export default app
