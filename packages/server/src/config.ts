import { createLogger, format, Logger, transports } from 'winston'

const PORT = parseInt(process.env.PORT ?? '3000')
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

export interface ServerConfigParams {
	port?: number
	logLevel?: string
}

export class ServerConfig {
	#logger!: Logger
	constructor(private readonly params: ServerConfigParams) {
		if (!this.params.port) {
			this.params.port = PORT
		}
		if (!this.params.logLevel) {
			this.params.logLevel = LOG_LEVEL
		}
		this.createLogger()
		this.params = params
	}

	private createLogger() {
		this.#logger = createLogger({
			level: this.params.logLevel,
			format: format.combine(format.timestamp(), format.json()),
			transports: [new transports.Console()],
		})
	}

	get logger() {
		return this.#logger
	}

	get port() {
		return this.params.port
	}
}

export default ServerConfig
