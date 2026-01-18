"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
	children: React.ReactNode;
	className?: string;
	duration?: number;
	yOffset?: number;
	enableBorderBeam?: boolean;
	beamColor?: string;
}

export function FloatingCard({
	children,
	className,
	duration = 4,
	yOffset = 10,
	enableBorderBeam = false,
	beamColor = "from-blue-500 via-purple-500 to-blue-500",
}: FloatingCardProps) {
	return (
		<motion.div
			className={cn("relative w-full h-full p-[1px] overflow-hidden rounded-xl", className)}
			animate={{
				y: [0, -yOffset, 0],
			}}
			transition={{
				duration: duration,
				repeat: Infinity,
				repeatType: "reverse",
				ease: "easeInOut",
			}}
		>
			{enableBorderBeam && (
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]">
						<div className={cn("w-full h-full bg-gradient-to-r opacity-50 blur-md", beamColor)} />
					</div>
				</div>
			)}
			<div className="relative z-10 w-full h-full bg-white dark:bg-black rounded-xl overflow-hidden">
				{children}
			</div>
		</motion.div>
	);
}
