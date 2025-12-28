import { describe, it, expect } from 'vitest'
import { rgbToCss, type IRGBColor } from '../../src/utils/color.js'

describe('rgbToCss', () => {
	it('should convert RGB values to CSS rgb() format', () => {
		const color: IRGBColor = {
			red: 255,
			green: 128,
			blue: 64,
		}
		expect(rgbToCss(color)).toBe('rgb(255, 128, 64)')
	})

	it('should handle zero values', () => {
		const color: IRGBColor = {
			red: 0,
			green: 0,
			blue: 0,
		}
		expect(rgbToCss(color)).toBe('rgb(0, 0, 0)')
	})

	it('should handle maximum RGB values', () => {
		const color: IRGBColor = {
			red: 255,
			green: 255,
			blue: 255,
		}
		expect(rgbToCss(color)).toBe('rgb(255, 255, 255)')
	})

	it('should handle partial values', () => {
		const color: IRGBColor = {
			red: 100,
			green: 200,
			blue: 50,
		}
		expect(rgbToCss(color)).toBe('rgb(100, 200, 50)')
	})
})
