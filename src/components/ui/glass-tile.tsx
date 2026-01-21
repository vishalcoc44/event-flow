'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassTileProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	hoverScale?: number;
	interactive?: boolean;
	onClick?: () => void;
}

export const GlassTile: React.FC<GlassTileProps> = ({
	children,
	className,
	delay = 0,
	hoverScale = 1.02,
	interactive = true,
	onClick,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			onClick={onClick}
			whileHover={interactive ? {
				y: -5,
				scale: hoverScale,
				transition: { duration: 0.2, ease: "easeOut" }
			} : {}}
			className={cn(
				"relative overflow-hidden rounded-[32px] p-6",
				"bg-white/40 dark:bg-white/5 backdrop-blur-xl",
				"border border-white/60 dark:border-white/10",
				"shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",
				"before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/40 before:to-transparent",
				interactive && "cursor-pointer group",
				className
			)}
		>
			{/* Decorative inner glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

			{/* Subtle shine effect on hover */}
			{interactive && (
				<div
					className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
					style={{
						background: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)',
						backgroundSize: '200% 200%',
						animation: 'shine 3s infinite'
					}}
				/>
			)}

			<div className="relative z-10">
				{children}
			</div>

			<style jsx>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
		</motion.div>
	);
};
