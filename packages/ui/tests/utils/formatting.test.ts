import { describe, it, expect } from 'vitest'
import {
	formatUSDAZone,
	formatSeedInfo,
	formatDistance,
	formatEdibleParts,
	wrapText,
	capitalizeWords,
} from '../../src/utils/formatting.js'
import type {
	USDAHardinessZoneRangeMap,
	SeedPacketInfo,
	Distance,
} from '../../src/models/seed-packet.model.js'

describe('formatUSDAZone', () => {
	it('should format single zone from multiSeason', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			multiSeason: 5,
		}
		expect(formatUSDAZone(zoneData)).toBe('5')
	})

	it('should format zone range from multiSeason', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			multiSeason: { min: 5, max: 8 },
		}
		expect(formatUSDAZone(zoneData)).toBe('5-8')
	})

	it('should format single zone with same min/max', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			multiSeason: { min: 7, max: 7 },
		}
		expect(formatUSDAZone(zoneData)).toBe('7')
	})

	it('should prioritize multiSeason over oneSeason', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			oneSeason: 3,
			multiSeason: 5,
		}
		expect(formatUSDAZone(zoneData)).toBe('5')
	})

	it('should fall back to oneSeason if multiSeason not available', () => {
		const zoneData: USDAHardinessZoneRangeMap = {
			oneSeason: { min: 4, max: 6 },
		}
		expect(formatUSDAZone(zoneData)).toBe('4-6')
	})

	it('should return "Not specified" if no zone data', () => {
		const zoneData: USDAHardinessZoneRangeMap = {}
		expect(formatUSDAZone(zoneData)).toBe('Not specified')
	})
})

describe('formatSeedInfo', () => {
	it('should format all seed info fields', () => {
		const seedInfo: SeedPacketInfo = {
			seedCount: 30,
			viabilityYears: 4,
			germinationRate: 85,
		}
		expect(formatSeedInfo(seedInfo)).toBe('# 30 • Viability: 4yr • Germination: 85%')
	})

	it('should handle missing seed count', () => {
		const seedInfo: SeedPacketInfo = {
			viabilityYears: 3,
			germinationRate: 90,
		}
		expect(formatSeedInfo(seedInfo)).toBe('Viability: 3yr • Germination: 90%')
	})

	it('should handle only seed count', () => {
		const seedInfo: SeedPacketInfo = {
			seedCount: 25,
		}
		expect(formatSeedInfo(seedInfo)).toBe('# 25')
	})

	it('should handle empty seed info', () => {
		const seedInfo: SeedPacketInfo = {}
		expect(formatSeedInfo(seedInfo)).toBe('')
	})
})

describe('formatDistance', () => {
	it('should format inches with abbreviated unit', () => {
		const distance: Distance = {
			value: 8,
			unit: 'inches',
		}
		expect(formatDistance(distance)).toBe('8 in')
	})

	it('should format other units with full name', () => {
		const distance: Distance = {
			value: 12,
			unit: 'centimeters',
		}
		expect(formatDistance(distance)).toBe('12 centimeters')
	})

	it('should handle feet', () => {
		const distance: Distance = {
			value: 2,
			unit: 'feet',
		}
		expect(formatDistance(distance)).toBe('2 feet')
	})
})

describe('formatEdibleParts', () => {
	it('should join edible parts with commas', () => {
		const parts = ['leaves', 'fruit', 'stems']
		expect(formatEdibleParts(parts)).toBe('leaves, fruit, stems')
	})

	it('should handle single edible part', () => {
		const parts = ['fruit']
		expect(formatEdibleParts(parts)).toBe('fruit')
	})

	it('should handle empty array', () => {
		const parts: string[] = []
		expect(formatEdibleParts(parts)).toBe('')
	})
})

describe('wrapText', () => {
	it('should wrap long text into multiple lines', () => {
		const text = 'Big Boy Tomato Variety'
		const result = wrapText(text, 10)
		expect(result).toEqual(['Big Boy', 'Tomato', 'Variety'])
	})

	it('should keep short text on single line', () => {
		const text = 'Celery'
		const result = wrapText(text, 12)
		expect(result).toEqual(['Celery'])
	})

	it('should handle single long word', () => {
		const text = 'Supercalifragilisticexpialidocious'
		const result = wrapText(text, 10)
		expect(result).toEqual(['Supercalifragilisticexpialidocious'])
	})

	it('should use default max chars when not specified', () => {
		const text = 'This is a longer text'
		const result = wrapText(text)
		expect(result.length).toBeGreaterThan(1)
	})

	it('should handle empty string', () => {
		const text = ''
		const result = wrapText(text)
		expect(result).toEqual([])
	})
})

describe('capitalizeWords', () => {
	it('should capitalize first letter of each word', () => {
		const text = 'hello world test'
		expect(capitalizeWords(text)).toBe('Hello World Test')
	})

	it('should handle single word', () => {
		const text = 'hello'
		expect(capitalizeWords(text)).toBe('Hello')
	})

	it('should handle empty string', () => {
		const text = ''
		expect(capitalizeWords(text)).toBe('')
	})

	it('should handle text with punctuation', () => {
		const text = 'hello, world!'
		expect(capitalizeWords(text)).toBe('Hello, World!')
	})
})
