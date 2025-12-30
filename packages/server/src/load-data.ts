import * as yaml from 'yaml'
import * as fs from 'fs'
import path from 'path'
import type { SeedPacketCollectionModel } from '@seeds/models'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'seeds.yml')

const data = fs.readFileSync(DATA_FILE_PATH, 'utf8')

export function loadData(): SeedPacketCollectionModel {
	return yaml.parse(data) as SeedPacketCollectionModel
}

export default loadData
