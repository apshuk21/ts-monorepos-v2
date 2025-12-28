import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
	theme: {
		extend: {},
	},
	plugins: [daisyui],
	daisyui: {
		logs: false,
		themes: [
			{
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				light: {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					...daisyui.themes['light'],
					'primary-focus': 'mediumblue',
				},
			},
		],
	},
}
