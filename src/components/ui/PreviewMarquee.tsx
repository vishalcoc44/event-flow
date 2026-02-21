'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { LightboxModal } from './LightboxModal'
import { Play } from 'lucide-react'

export function PreviewMarquee() {
	const [images, setImages] = useState<string[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
	const [userClosed, setUserClosed] = useState(false)

	// Scroll intelligence
	const { scrollY } = useScroll()
	const opacity = useTransform(scrollY, [0, 500], [1, 0])
	const y = useTransform(scrollY, [0, 500], [0, -50])
	const pointerEvents = useTransform(scrollY, [0, 500], ['auto', 'none']) as any

	useEffect(() => {
		fetch('/api/images')
			.then((res) => res.json())
			.then((data) => {
				if (data.images && data.images.length > 0) {
					setImages([...data.images, ...data.images])
					if (!userClosed) setIsOpen(true)
				}
			})
			.catch((err) => console.error('Error fetching images:', err))
	}, [])

	// Handle restoring on scroll to top, UNLESS user manually closed it
	useEffect(() => {
		const unsubscribe = scrollY.on('change', (v) => {
			if (v < 50 && !userClosed && !isOpen && images.length > 0) {
				setIsOpen(true)
			} else if (v > 500 && isOpen) {
				setIsOpen(false)
			}
		})
		return () => unsubscribe()
	}, [scrollY, userClosed, isOpen, images])

	const togglePreview = () => {
		if (isOpen) {
			setUserClosed(true)
			setIsOpen(false)
		} else {
			setUserClosed(false)
			setIsOpen(true)
		}
	}

	// If there are no images, don't show the feature at all to prevent broken UI
	if (images.length === 0) return null

	return (
		<div className="relative flex flex-col items-center z-50">
			{/* Preview Button */}
			<button
				onClick={togglePreview}
				className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300
          ${isOpen ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-secondary/50 hover:bg-secondary text-foreground'}
        `}
			>
				<Play size={16} className={isOpen ? 'fill-current' : ''} />
				Preview
			</button>

			{/* Marquee Container */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: -20 }}
						style={{ opacity, y, pointerEvents }}
						className="absolute top-full mt-2 flex flex-col items-center"
					>
						{/* The Pipe */}
						<div className="w-px h-6 bg-gradient-to-b from-primary/50 to-transparent backdrop-blur-sm" />

						{/* Marquee Panel */}
						<div
							className="w-[320px] h-[100px] rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg relative flex items-center"
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							<div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/80 dark:from-gray-900/60 to-transparent z-10 pointer-events-none" />
							<div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/80 dark:from-gray-900/60 to-transparent z-10 pointer-events-none" />

							<div
								className="flex gap-3 px-4"
								style={{
									animation: 'marquee-scroll 15s linear infinite',
									animationPlayState: isHovered ? 'paused' : 'running',
								}}
							>
								{images.map((src, idx) => (
									<motion.div
										key={`${src}-${idx}`}
										className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0 cursor-pointer group shadow-lg"
										whileHover={{ scale: 1.05, zIndex: 20 }}
										onClick={() => setActiveImageIndex(idx % (images.length / 2))}
									>
										<Image
											src={src}
											alt="Preview image"
											fill
											sizes="112px"
											className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0"
										/>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{activeImageIndex !== null && (
					<LightboxModal
						images={images.slice(0, images.length / 2)}
						initialIndex={activeImageIndex}
						onClose={() => setActiveImageIndex(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	)
}
