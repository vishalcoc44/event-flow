/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				eventflow: {
					background: '#FFFFFF',
					foreground: '#1D1D1D',
					primary: '#6CDAEC',
					primaryAccent: '#5BCFE3',
					secondary: '#F5F5F5',
					muted: '#F0F0F0',
					accent: '#E8E8E8',
					card: '#FFFFFF',
					border: '#E5E5E5',
					input: '#F8F8F8',
					destructive: '#E74C3C'
				},
				pastel: {
					sky: '#bae6fd',      // sky-200
					'sky-dark': '#0ea5e9', // sky-500
					rose: '#fecdd3',     // rose-200
					'rose-dark': '#f43f5e', // rose-500
					mint: '#a7f3d0',     // emerald-200
					'mint-dark': '#10b981', // emerald-500
					amber: '#fde68a',    // amber-200
					'amber-dark': '#f59e0b', // amber-500
					lavender: '#ddd6fe', // violet-200
					'lavender-dark': '#8b5cf6', // violet-500
					peach: '#fed7aa',    // orange-200
					'peach-dark': '#f97316', // orange-500
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [
					'var(--font-josefin-sans)',
					'system-ui',
					'sans-serif'
				],
				subtext: [
					'var(--font-josefin-sans)',
					'system-ui',
					'sans-serif'
				],
				heading: [
					'var(--font-open-sans)',
					'system-ui',
					'sans-serif'
				],
				mono: [
					'var(--font-geist-mono)',
					'monospace'
				]
			},
			boxShadow: {
				card: '0 4px 6px rgba(0, 0, 0, 0.05)',
				button: '0 2px 4px rgba(0, 0, 0, 0.05)'
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'move': 'move 3s ease-in-out infinite',
				spotlight: "spotlight 2s ease .75s 1 forwards",
				'gradient-x': 'gradient-x 15s ease infinite',
			},
			keyframes: {
				spotlight: {
					"0%": {
						opacity: 0,
						transform: "translate(-72%, -62%) scale(0.5)",
					},
					"100%": {
						opacity: 1,
						transform: "translate(-50%,-40%) scale(1)",
					},
				},
				'accordion-down': {
					from: {
						height: 0
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: 0
					}
				},
				'move': {
					'0%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					},
					'100%': {
						transform: 'translateY(0px)'
					}
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				}
			}
		},
	},
	plugins: [require("tailwindcss-animate")],
}

