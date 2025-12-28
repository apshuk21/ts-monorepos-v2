import { Router } from 'express'
import ServerConfig from './config.js'
import loadData from './load-data.js'

export function createRouter(cfg: ServerConfig): Router {
	const router = Router()
	const seeds = loadData()
	router.get('/seeds', (req, res) => {
		cfg.logger.info('Responding with seed list')
		res.json(seeds)
	})
	return router
}
