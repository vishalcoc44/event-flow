'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import {
	LayoutDashboard,
	Calendar,
	Users,
	Map as MapIcon,
	CreditCard,
	Settings,
	Rocket,
	Menu,
	ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OrgNavigation() {
	const pathname = usePathname();
	const { organization } = useOrganizationData();
	const {
		canManageMembers,
		canManageEventSpaces,
		isOwner,
		isAdmin
	} = useOrganizationPermissions();

	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	if (!organization) return null;

	const navLinks = [
		{ href: '/organization/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/organization/events', label: 'Events', icon: Calendar },
		{
			href: '/organization/members',
			label: 'Members',
			icon: Users,
			permission: 'canManageMembers'
		},
		{
			href: '/organization/community',
			label: 'Community',
			icon: Users,
			permission: 'canManageMembers'
		},
		{
			href: '/organization/spaces',
			label: 'Event Spaces',
			icon: MapIcon,
			permission: 'canManageEventSpaces'
		},
		{
			href: '/organization/plans',
			label: 'Plans & Pricing',
			icon: CreditCard,
			permission: 'isOwner'
		},
		{
			href: '/organization/settings',
			label: 'Settings',
			icon: Settings,
			permission: 'isOwner'
		},
		{
			href: '/organization/onboarding',
			label: 'Onboarding',
			icon: Rocket,
			permission: 'isOwner'
		}
	];

	const linksToRender = navLinks.filter(link => {
		if (!link.permission) return true;
		const permissions: Record<string, boolean> = {
			canManageMembers,
			canManageEventSpaces,
			isOwner,
			isAdmin
		};
		return permissions[link.permission];
	});

	return (
		<div className="relative" ref={containerRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-300",
					"bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10",
					"hover:bg-white/60 dark:hover:bg-white/10 group shadow-sm",
					isOpen && "ring-1 ring-neutral-300 dark:ring-neutral-600 shadow-md"
				)}
			>
				<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner">
					<Menu className="w-3 h-3" />
				</div>

				<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hidden sm:block">Menu</span>

				<ChevronDown className={cn(
					"w-3 h-3 text-neutral-400 transition-transform duration-300",
					isOpen && "rotate-180"
				)} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ type: "spring", damping: 20, stiffness: 300 }}
						className="absolute top-full left-0 mt-2 w-48 z-50 origin-top-left"
					>
						<div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-white/10 rounded-xl p-1.5 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
							<div className="px-2.5 py-1.5 mb-0.5">
								<h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Menu</h4>
							</div>

							<div className="space-y-0.5">
								{linksToRender.map((link) => {
									const Icon = link.icon;
									const isActive = pathname === link.href;

									return (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setIsOpen(false)}
											className={cn(
												"w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 group",
												isActive
													? "bg-primary/10 text-primary"
													: "hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400"
											)}
										>
											<div className={cn(
												"w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200",
												isActive
													? "bg-primary text-white"
													: "bg-neutral-100 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary"
											)}>
												<Icon className="w-3.5 h-3.5" />
											</div>
											<span className="text-xs font-semibold">{link.label}</span>
										</Link>
									);
								})}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
