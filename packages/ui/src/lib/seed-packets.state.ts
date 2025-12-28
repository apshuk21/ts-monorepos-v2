import { writable, derived } from 'svelte/store'
import { type SeedPacketModel } from '../models/seed-packet.model.js'
import type { SeedPacketCollectionModel } from '../models/seed-packet-collection.model.js'

interface SeedPacketsState {
	seedPackets: SeedPacketModel[]
	loading: boolean
	error: string | null
}

const initialState: SeedPacketsState = {
	seedPackets: [],
	loading: false,
	error: null,
}

// Create the writable store
const seedPacketsState = writable<SeedPacketsState>(initialState)

// Derived stores for convenience
export const seedPackets = derived(seedPacketsState, ($state) => $state.seedPackets)

export const isLoading = derived(seedPacketsState, ($state) => $state.loading)

export const error = derived(seedPacketsState, ($state) => $state.error)

// Function to get a seed packet by ID
export const getSeedPacketById = derived(seedPackets, ($seedPackets) => {
	return (id: string): SeedPacketModel | undefined => {
		return $seedPackets.find((seedPacket) => seedPacket.id === id)
	}
})

// Function to fetch seed packets
export async function fetchSeedPackets() {
	seedPacketsState.update((state) => ({ ...state, loading: true, error: null }))

	try {
		const response = await fetch('http://localhost:3000/api/seeds')
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = (await response.json()) as SeedPacketCollectionModel
		seedPacketsState.update((state) => ({
			...state,
			seedPackets: data.seedPackets,
			loading: false,
		}))
	} catch (e) {
		seedPacketsState.update((state) => ({
			...state,
			error: e instanceof Error ? e.message : 'An error occurred',
			loading: false,
		}))
	}
}

export default seedPacketsState
