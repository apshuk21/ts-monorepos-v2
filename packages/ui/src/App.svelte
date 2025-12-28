<script lang="ts">
import SeedPacket from './lib/SeedPacket.svelte'
import { onMount } from 'svelte'
import { seedPackets, isLoading, error, fetchSeedPackets } from './lib/seed-packets.state.js'

onMount(() => {
	fetchSeedPackets()
})
</script>

<main class="container mx-auto px-4 py-8">
	{#if $isLoading}
		<div class="text-center py-8 text-lg text-gray-600">Loading seed packets...</div>
	{:else if $error}
		<div class="text-center py-8 text-lg text-red-600">Error: {$error}</div>
	{:else}
		<div
			class="grid gap-8 justify-center grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]"
		>
			{#each $seedPackets as seedPacket}
				<SeedPacket seedPacket={seedPacket} />
			{/each}
		</div>
	{/if}
</main>
