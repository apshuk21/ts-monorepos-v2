import { describe, it, expect, beforeEach, vi } from 'vitest'
import { get } from 'svelte/store'
import seedPacketsState, {
	seedPackets,
	isLoading,
	error,
} from '../../src/lib/seed-packets.state.js'

describe('State Management', () => {
	beforeEach(() => {
		// Reset main store before each test
		seedPacketsState.set({
			seedPackets: [],
			loading: false,
			error: null,
		})
		vi.clearAllMocks()
	})

	it('should initialize with empty state', () => {
		expect(get(seedPackets)).toEqual([])
		expect(get(isLoading)).toBe(false)
		expect(get(error)).toBe(null)
	})

	it('should update loading state through main store', () => {
		seedPacketsState.update((state) => ({
			...state,
			loading: true,
		}))
		expect(get(isLoading)).toBe(true)

		seedPacketsState.update((state) => ({
			...state,
			loading: false,
		}))
		expect(get(isLoading)).toBe(false)
	})

	it('should update error state through main store', () => {
		const errorMessage = 'Test error'
		seedPacketsState.update((state) => ({
			...state,
			error: errorMessage,
		}))

		expect(get(error)).toBe(errorMessage)
	})

	it('should handle state updates correctly', () => {
		// Test that derived stores react to main store changes
		const initialState = get(seedPacketsState)
		expect(initialState.seedPackets).toEqual([])
		expect(initialState.loading).toBe(false)
		expect(initialState.error).toBe(null)

		// Update the state
		seedPacketsState.update((state) => ({
			...state,
			loading: true,
			error: 'Loading error',
		}))

		expect(get(isLoading)).toBe(true)
		expect(get(error)).toBe('Loading error')
	})
})
