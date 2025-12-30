import { initApp } from './app.js'

// eslint-disable-next-line @typescript-eslint/require-await
async function main() {
	const { app, cfg } = initApp()

	app.listen(cfg.port, () => {
		console.log(`Server listening on port http://localhost:${cfg.port}`)
	})
}

main().catch(console.error)
