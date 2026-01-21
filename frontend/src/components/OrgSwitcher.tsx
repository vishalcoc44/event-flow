'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Building2, ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function OrgSwitcher() {
	const {
		organization,
		userMemberships,
		switchOrganization,
		isLoading
	} = useOrganization();

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

	if (!organization && userMemberships.length === 0) return null;

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
				<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-inner">
					{organization?.logo_url ? (
						<img src={organization.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
					) : (
						<Building2 className="w-3 h-3" />
					)}
				</div>

				<span className="text-xs font-semibold text-foreground truncate max-w-[100px] hidden sm:block">
					{organization?.name || 'Select'}
				</span>

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
						className="absolute top-full left-0 mt-2 w-56 z-50 origin-top-left"
					>
						<div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-white/10 rounded-xl p-1.5 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
							<div className="px-2.5 py-1.5 mb-1">
								<h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Organizations</h4>
							</div>

							<div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
								{userMemberships.map((membership) => {
									const isActive = membership.organization_id === organization?.id;
									return (
										<button
											key={membership.organization_id}
											onClick={() => {
												if (!isActive) switchOrganization(membership.organization_id);
												setIsOpen(false);
											}}
											className={cn(
												"w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-200 group",
												isActive
													? "bg-primary/10 text-primary"
													: "hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400"
											)}
										>
											<div className="flex items-center gap-2">
												<div className={cn(
													"w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200",
													isActive
														? "bg-primary text-white"
														: "bg-neutral-100 dark:bg-white/10"
												)}>
													{membership.organizations?.logo_url ? (
														<img src={membership.organizations.logo_url} alt="" className="w-full h-full object-cover rounded-md" />
													) : (
														<Building2 className="w-3.5 h-3.5" />
													)}
												</div>
												<div className="text-left">
													<p className="text-xs font-semibold">{membership.organizations?.name}</p>
													<p className="text-[9px] font-medium opacity-50 uppercase">{membership.role_in_org}</p>
												</div>
											</div>

											{isActive && <Check className="w-3.5 h-3.5" />}
											{isLoading && !isActive && <Loader2 className="w-3.5 h-3.5 animate-spin opacity-40" />}
										</button>
									);
								})}
							</div>

							<div className="mt-1 pt-1 border-t border-neutral-200/60 dark:border-white/5">
								<Link
									href="/create-organization"
									onClick={() => setIsOpen(false)}
									className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-all group"
								>
									<div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
										<Plus className="w-3.5 h-3.5" />
									</div>
									<span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-primary transition-colors">Create New</span>
								</Link>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
