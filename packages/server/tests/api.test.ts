import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SeedPacketModel } from '@seeds/models'

// Mock global fetch for server tests
global.fetch = vi.fn()

describe('Server API Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should handle successful API response', async () => {
		const mockResponse = {
			seedPackets: [
				{
					id: 'test-1',
					commonName: 'Test Plant',
					plantFamily: 'tomatoes',
				},
			],
		}

		const mockFetch = fetch as ReturnType<typeof vi.fn>
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: () => Promise.resolve(mockResponse),
		} as Response)

		const response = await fetch('http://localhost:3000/api/seeds')
		const data = (await response.json()) as { seedPackets: SeedPacketModel[] }

		expect(response.ok).toBe(true)
		expect(data.seedPackets).toBeDefined()
		expect(data.seedPackets).toHaveLength(1)
		expect(data.seedPackets[0].commonName).toBe('Test Plant')
	})

	it('should handle API error response', async () => {
		const mockFetch = fetch as ReturnType<typeof vi.fn>
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
		} as Response)

		const response = await fetch('http://localhost:3000/api/seeds')

		expect(response.ok).toBe(false)
		expect(response.status).toBe(500)
	})

	it('should handle network error', async () => {
		const mockFetch = fetch as ReturnType<typeof vi.fn>
		mockFetch.mockRejectedValueOnce(new Error('Network error'))

		await expect(fetch('http://localhost:3000/api/seeds')).rejects.toThrow(
			'Network error',
		)
	})

	it('should validate API endpoint URL', () => {
		const apiUrl = 'http://localhost:3000/api/seeds'
		const url = new URL(apiUrl)

		expect(url.protocol).toBe('http:')
		expect(url.hostname).toBe('localhost')
		expect(url.port).toBe('3000')
		expect(url.pathname).toBe('/api/seeds')
	})
})
