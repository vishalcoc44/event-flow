"use client";
import React from "react";
import {
	motion,
	useScroll,
	useTransform,
	useSpring,
	MotionValue,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";

export const HeroParallax = ({
	products,
}: {
	products: {
		title: string;
		link: string;
		thumbnail: string;
	}[];
}) => {
	const firstRow = products.slice(0, 7);
	const secondRow = products.slice(7, 15);
	const ref = React.useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

	const translateX = useSpring(
		useTransform(scrollYProgress, [0, 1], [0, 1000]),
		springConfig
	);
	const translateXReverse = useSpring(
		useTransform(scrollYProgress, [0, 1], [0, -1000]),
		springConfig
	);
	const rotateX = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [15, 0]),
		springConfig
	);
	// START CHANGE: Fix opacity start value
	const opacity = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [1, 1], { clamp: false }),
		springConfig
	);
	// END CHANGE

	const rotateZ = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [20, 0]),
		springConfig
	);
	const translateY = useSpring(
		useTransform(scrollYProgress, [0, 0.2], [-700, 100]),
		springConfig
	);
	return (
		<div
			ref={ref}
			className="h-[280vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
		>
			<Header />
			<motion.div
				style={{
					rotateX,
					rotateZ,
					translateY,
					opacity,
				}}
				className=""
			>
				<motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
					{firstRow.map((product) => (
						<ProductCard
							product={product}
							translate={translateX}
							key={product.title}
						/>
					))}
				</motion.div>
				<motion.div className="flex flex-row mb-20 space-x-20 ">
					{secondRow.map((product) => (
						<ProductCard
							product={product}
							translate={translateXReverse}
							key={product.title}
						/>
					))}
				</motion.div>
			</motion.div>
		</div>
	);
};

export const Header = () => {
	return (
		<div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full  left-0 top-0 z-50 pointer-events-none">
			<h1 className="text-2xl md:text-7xl font-black uppercase tracking-tight dark:text-white pointer-events-auto [text-shadow:0_4px_8px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)] hover:[text-shadow:0_8px_16px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300">
				The Ultimate <br /> Event Management Platform
			</h1>
			<p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200 pointer-events-auto font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
				We build beautiful products with the latest technologies and frameworks.
				We are a team of passionate developers and designers that love to build
				amazing products.
			</p>
		</div>
	);
};

export const ProductCard = ({
	product,
	translate,
}: {
	product: {
		title: string;
		link: string;
		thumbnail: string;
	};
	translate: MotionValue<number>;
}) => {
	return (
		<motion.div
			style={{
				x: translate,
			}}
			whileHover={{
				y: -20,
			}}
			key={product.title}
			className="group/product h-80 w-[24rem] relative flex-shrink-0"
		>
			<Link
				href={product.link}
				className="block group-hover/product:shadow-2xl w-full h-full"
			>
				<Image
					src={product.thumbnail}
					height="600"
					width="600"
					className="object-cover object-left-top absolute h-full w-full inset-0"
					alt={product.title}
				/>
			</Link>
			{/* Dark overlay for better text visibility */}
			<div className="absolute inset-0 h-full w-full opacity-50 group-hover/product:opacity-80 bg-black pointer-events-none transition-opacity duration-300"></div>
			<h2 className="absolute bottom-4 left-4 opacity-100 text-white font-bold drop-shadow-md z-20 transition-opacity duration-300">
				{product.title}
			</h2>
		</motion.div>
	);
};
