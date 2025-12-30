import type { USDAHardinessZoneRangeMap, SeedPacketInfo, Distance } from '@seeds/models'

/**
 * Formats USDA hardiness zone data into a human-readable string
 * @param zoneData - The USDA zone range map from the seed packet
 * @returns Formatted zone string like "5", "5-8", or "Not specified"
 */
export function formatUSDAZone(zoneData: USDAHardinessZoneRangeMap): string {
	const zoneToDisplay = zoneData.multiSeason || zoneData.oneSeason

	if (!zoneToDisplay) return 'Not specified'

	if (
		typeof zoneToDisplay === 'object' &&
		'min' in zoneToDisplay &&
		'max' in zoneToDisplay
	) {
		return zoneToDisplay.min === zoneToDisplay.max
			? `${zoneToDisplay.min}`
			: `${zoneToDisplay.min}-${zoneToDisplay.max}`
	} else {
		return `${zoneToDisplay}`
	}
}

/**
 * Formats seed packet information into a compact string
 * @param seedInfo - Seed packet information object
 * @returns Formatted string like "30 • Viability: 4yr • Germination: 85%"
 */
export function formatSeedInfo(seedInfo: SeedPacketInfo): string {
	const parts: string[] = []

	if (seedInfo.seedCount) {
		parts.push(`# ${seedInfo.seedCount}`)
	}

	if (seedInfo.viabilityYears) {
		parts.push(`Viability: ${seedInfo.viabilityYears}yr`)
	}

	if (seedInfo.germinationRate) {
		parts.push(`Germination: ${seedInfo.germinationRate}%`)
	}

	return parts.join(' • ')
}

/**
 * Formats distance measurement into a compact string
 * @param distance - Distance object with value and unit
 * @returns Formatted string like "8inches" or "12 cm"
 */
export function formatDistance(distance: Distance): string {
	// For inches, remove space for compactness
	if (distance.unit === 'inches') {
		return `${distance.value} in`
	}

	// For other units, include space for readability
	return `${distance.value} ${distance.unit}`
}

/**
 * Formats an array of edible parts into a readable string
 * @param edibleParts - Array of edible parts
 * @returns Comma-separated string of edible parts
 */
export function formatEdibleParts(edibleParts: string[]): string {
	return edibleParts.join(', ')
}

/**
 * Formats light preference values into more readable format
 * @param lightPreference - Light preference enum value
 * @returns Formatted light preference string
 */
export function formatLightPreference(lightPreference: string): string {
	return lightPreference.replace('-', '-')
}

/**
 * Formats water needs into more readable format
 * @param waterNeeds - Water needs enum value
 * @returns Formatted water needs string
 */
export function formatWaterNeeds(waterNeeds: string): string {
	return waterNeeds
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalizeWords(str: string): string {
	return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Breaks text into multiple lines for SVG display
 * @param text - The text to wrap
 * @param maxCharsPerLine - Maximum characters per line (default: 12)
 * @returns Array of text lines
 */
export function wrapText(text: string, maxCharsPerLine: number = 12): string[] {
	const words = text.split(' ')
	const lines: string[] = []
	let currentLine = ''

	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word

		if (testLine.length <= maxCharsPerLine) {
			currentLine = testLine
		} else {
			if (currentLine) {
				lines.push(currentLine)
				currentLine = word
			} else {
				// Single word is longer than max chars, just add it
				lines.push(word)
			}
		}
	}

	if (currentLine) {
		lines.push(currentLine)
	}

	return lines
}
