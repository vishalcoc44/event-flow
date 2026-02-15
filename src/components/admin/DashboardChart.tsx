'use client'

import { motion } from 'framer-motion'

interface DashboardChartProps {
	data: number[]
	height?: number
	color?: string
}

export function DashboardChart({
	data,
	height = 200,
	color = "currentColor"
}: DashboardChartProps) {
	if (!data || data.length === 0) return null

	const max = Math.max(...data)
	const min = Math.min(...data)
	const range = max - min || 1
	const padding = 20
	const width = 1000

	// Coordinate calculation
	const points = data.map((val, i) => ({
		x: (i / (data.length - 1)) * width,
		y: height - padding - ((val - min) / range) * (height - padding * 2)
	}))

	// Path generators
	const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
	const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`

	return (
		<div className="w-full relative" style={{ height }}>
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="w-full h-full overflow-visible"
				preserveAspectRatio="none"
			>
				{/* Area under the curve */}
				<motion.path
					d={areaPath}
					fill={`url(#gradient-${color})`}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 0.2, y: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
				/>

				{/* The main line */}
				<motion.path
					d={linePath}
					fill="none"
					stroke={color}
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 1.5, ease: "easeInOut" }}
				/>

				{/* Gradients */}
				<defs>
					<linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor={color} stopOpacity="1" />
						<stop offset="100%" stopColor={color} stopOpacity="0" />
					</linearGradient>
				</defs>
			</svg>

			{/* Legend/Info overlaid */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between">
				<div className="flex justify-between items-start text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
					<span>${max.toLocaleString()}</span>
					<span>Peak Revenue</span>
				</div>
				<div className="flex justify-between items-end text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
					<span>${min.toLocaleString()}</span>
					<span>Baseline</span>
				</div>
			</div>
		</div>
	)
}
