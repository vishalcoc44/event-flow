'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

interface LightboxModalProps {
	images: string[]
	initialIndex: number
	onClose: () => void
}

export function LightboxModal({ images, initialIndex, onClose }: LightboxModalProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		return () => setMounted(false)
	}, [])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
			if (e.key === 'ArrowRight') nextImage()
			if (e.key === 'ArrowLeft') prevImage()
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [currentIndex, onClose])

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => { document.body.style.overflow = 'unset' }
	}, [])

	const nextImage = () => {
		setCurrentIndex((prev) => (prev + 1) % images.length)
	}

	const prevImage = () => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
	}

	return mounted ? createPortal(
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
			onClick={onClose}
		>
			{/* Ambient Depth Background */}
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				<Image
					src={images[currentIndex]}
					alt="Ambient Background"
					fill
					className="object-cover blur-3xl opacity-30 scale-110"
				/>
			</div>

			{/* Theatre vignette — dark curtains on left & right */}
			<div className="absolute inset-0 z-10 pointer-events-none"
				style={{
					background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.72) 100%)'
				}}
			/>
			{/* Top & bottom soft fade */}
			<div className="absolute inset-0 z-10 pointer-events-none"
				style={{
					background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.45) 100%)'
				}}
			/>

			{/* Nav buttons — absolutely positioned on the sides */}
			<button
				onClick={(e) => { e.stopPropagation(); prevImage(); }}
				className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all transform hover:scale-110"
			>
				<ChevronLeft size={32} />
			</button>
			<button
				onClick={(e) => { e.stopPropagation(); nextImage(); }}
				className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all transform hover:scale-110"
			>
				<ChevronRight size={32} />
			</button>

			{/* Main Image Container — truly centered */}
			<div
				className="relative z-20 flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button — top-right corner of the image */}
				<button
					onClick={(e) => { e.stopPropagation(); onClose(); }}
					className="absolute -top-3 -right-3 z-30 p-1.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-110 shadow-lg"
				>
					<X size={18} />
				</button>

				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0, x: 20, scale: 0.95 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -20, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="rounded-2xl overflow-hidden shadow-2xl"
					>
						<Image
							src={images[currentIndex]}
							alt={`Preview ${currentIndex + 1}`}
							width={0}
							height={0}
							sizes="80vw"
							className="w-auto h-auto max-w-[80vw] max-h-[80vh] block"
						/>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Pill Indicator */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white font-medium tracking-widest text-sm">
				{String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
			</div>
		</motion.div>,
		document.body
	) : null
}
