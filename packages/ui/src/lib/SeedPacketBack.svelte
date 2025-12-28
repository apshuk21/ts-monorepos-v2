<script lang="ts">
import type { SeedPacketModel } from '../models/seed-packet.model.js'
import {
	formatUSDAZone,
	formatSeedInfo,
	formatDistance,
	formatEdibleParts,
} from '../utils/formatting.js'

interface Props {
	seedPacket: SeedPacketModel
}

const { seedPacket }: Props = $props()
</script>

<div class="p-3 rounded-lg">
	<!-- Header Section -->
	<div class="text-center mb-3">
		<div class="flex justify-center mb-2">
			<img
				class="w-12 h-12 object-contain"
				src={`/plant-icons/${seedPacket.presentation.iconPath}`}
				alt={seedPacket.commonName}
			/>
		</div>
		<h1 class="text-xl font-bold text-gray-800 mb-1">{seedPacket.commonName}</h1>
		{#if seedPacket.latinName}
			<p class="italic text-gray-500 text-sm">{seedPacket.latinName}</p>
		{/if}
	</div>

	<!-- Scrollable Content Container -->
	<div class="overflow-y-auto h-62 pr-2">
		<!-- Plant Characteristics Badges -->
		<div class="flex flex-wrap justify-center gap-1 mb-3 text-xs">
			<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded"
				>Life: {seedPacket.growth.lifespan}</span
			>
			<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded"
				>Habit: {seedPacket.growth.habit}</span
			>
			<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded"
				>Support: {seedPacket.growth.supportNeeds}</span
			>
		</div>

		<!-- Compact Growing Conditions -->
		<div class="mb-3 text-sm">
			<div class="grid grid-cols-2 gap-x-3 gap-y-1">
				<div>
					<span class="font-semibold">Spacing:</span>
					{formatDistance(seedPacket.spacing.optimal)}
				</div>
				<div>
					<span class="font-semibold">Light:</span>
					{seedPacket.environmental.light}
				</div>
				<div>
					<span class="font-semibold">Water:</span>
					{seedPacket.environmental.water}
				</div>
				{#if seedPacket.environmental.hardiness?.usdaZone}
					<div>
						<span class="font-semibold">Zone:</span>
						{formatUSDAZone(seedPacket.environmental.hardiness.usdaZone)}
					</div>
				{/if}
			</div>
		</div>

		<!-- Compact Additional Information -->
		{#if seedPacket.production?.edibleParts || seedPacket.seedPacketInfo || seedPacket.toxInfo?.humanToxicity}
			<div class="mb-3 text-sm">
				{#if seedPacket.production?.edibleParts}
					<div class="mb-1">
						<span class="font-semibold">Edible Parts:</span>
						{formatEdibleParts(seedPacket.production.edibleParts)}
					</div>
				{/if}

				{#if seedPacket.seedPacketInfo}
					<div class="mb-1">
						<span class="font-semibold">Seeds:</span>
						{formatSeedInfo(seedPacket.seedPacketInfo)}
					</div>
				{/if}

				{#if seedPacket.toxInfo?.humanToxicity}
					<div class="mb-1 text-red-600">
						<span class="font-semibold">⚠ Toxicity:</span>
						{seedPacket.toxInfo.humanToxicity.level}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Compact Description -->
		<div class="mb-3">
			<h2 class="font-bold text-sm text-gray-800 mb-1">Description</h2>
			<p class="text-xs text-gray-700 leading-tight">{seedPacket.description}</p>
		</div>
	</div>
</div>
