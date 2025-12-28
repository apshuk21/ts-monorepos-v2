import { describe, it, expect } from 'vitest'
import type {
	USDAHardinessZoneRangeMap,
	Distance,
} from '../../src/models/seed-packet.model.js'

describe('SeedPacketModel Types', () => {
	it('should allow valid USDAHardinessZoneRangeMap with single zone', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			multiSeason: 5,
		}
		expect(zoneData.multiSeason).toBe(5)
	})

	it('should allow valid USDAHardinessZoneRangeMap with zone range', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			multiSeason: { min: 5, max: 8 },
		}
		expect(zoneData.multiSeason).toEqual({ min: 5, max: 8 })
	})

	it('should allow valid Distance object', () => {
		const distance: Distance = {
			value: 8,
			unit: 'inches',
		}
		expect(distance.value).toBe(8)
		expect(distance.unit).toBe('inches')
	})

	it('should handle different distance units', () => {
		const distances: Distance[] = [
			{ value: 12, unit: 'inches' },
			{ value: 2, unit: 'feet' },
			{ value: 30, unit: 'centimeters' },
			{ value: 1, unit: 'meters' },
			{ value: 3, unit: 'yards' },
		]

		expect(distances).toHaveLength(5)
		expect(distances[0].unit).toBe('inches')
		expect(distances[1].unit).toBe('feet')
		expect(distances[2].unit).toBe('centimeters')
	})
})
