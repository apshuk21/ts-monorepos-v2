export interface IRGBColor {
	red: number
	green: number
	blue: number
}

export function rgbToCss(rgb: IRGBColor): string {
	return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`
}
