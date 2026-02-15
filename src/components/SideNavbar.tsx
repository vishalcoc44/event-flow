'use client';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { adminLinks, customerLinks } from '@/config/navigation';

interface NavItem {
	icon: React.ElementType;
	label: string;
	href: string;
	badge?: number;
	isSpecial?: boolean;
}

interface SidebarProps {
	activeItem?: string;
	onNavigate?: (href: string) => void;
}

export function SideNavbar({ activeItem, onNavigate }: SidebarProps) {
	const [collapsed, setCollapsed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [date, setDate] = useState<Date | null>(null);
	const [mounted, setMounted] = useState(false);

	const router = useRouter();
	const pathname = usePathname();
	const { user } = useAuth();

	useEffect(() => {
		setMounted(true);
		setDate(new Date());

		// Auto-collapse after delay
		const collapseTimer = setTimeout(() => {
			setCollapsed(true);
		}, 1000);

		// Clock ticker
		const clockInterval = setInterval(() => {
			setDate(new Date());
		}, 1000);

		return () => {
			clearTimeout(collapseTimer);
			clearInterval(clockInterval);
		};
	}, []);

	// Don't render for guests or server-side
	if (!user || !mounted) return null;

	// Determine which links to show based on role
	const userRole = user.role as string;
	let linksToRender: NavItem[] = [];
	let roleLabel = "User";

	if (userRole === 'ADMIN' || user.is_org_admin) {
		linksToRender = adminLinks;
		roleLabel = "Admin";
	} else if (userRole === 'customer' || userRole === 'USER') {
		linksToRender = customerLinks;
		roleLabel = "Customer";
	}

	if (linksToRender.length === 0) return null;

	const currentPath = activeItem || pathname;

	const handleNavigate = (href: string) => {
		if (onNavigate) {
			onNavigate(href);
		} else {
			router.push(href);
		}
	};

	// The sidebar is visually collapsed only if it's pinned closed AND not hovered
	const isDisplayCollapsed = collapsed && !isHovered;
	const avatarUrl = (user as any)?.avatar_url as string | undefined;

	// Date/Time Values
	const dayNum = date ? date.getDate() : '--';
	const month = date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '---';
	const time = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '--:--';
	const weekday = date ? date.toLocaleDateString('en-US', { weekday: 'long' }) : '---';

	const NavItemComponent = ({ item }: { item: NavItem }) => {
		const isActive = item.href === currentPath || pathname.startsWith(item.href);
		const Icon = item.icon;

		return (
			<button
				onClick={() => handleNavigate(item.href)}
				className={cn(
					"flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative",
					isDisplayCollapsed ? "justify-center px-2" : "w-full px-4",
					isActive && "bg-black dark:bg-white text-white dark:text-black",
					!isActive && "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
				)}
			>
				<div className={cn(
					"flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200",
					isActive ? "scale-110" : "group-hover:scale-110"
				)}>
					<Icon className="w-full h-full" strokeWidth={isActive ? 2.5 : 2} />
				</div>

				<span className={cn(
					"text-xs font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap transition-all duration-300 origin-left",
					isDisplayCollapsed ? "w-0 opacity-0 scale-0 hidden" : "w-auto opacity-100 scale-100 block"
				)}>
					{item.label}
				</span>

				{item.badge && (
					<div className={cn(
						"absolute right-2 top-1/2 -translate-y-1/2",
						isDisplayCollapsed ? "right-1 top-2" : ""
					)}>
						<Badge className={cn(
							"h-4 min-w-[1rem] flex items-center justify-center rounded-full text-[9px] font-bold p-0 border-none shadow-none",
							isActive ? "bg-white text-black dark:bg-black dark:text-white" : "bg-black text-white dark:bg-white dark:text-black"
						)}>
							{item.badge}
						</Badge>
					</div>
				)}
			</button>
		);
	};

	return (
		<aside
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"fixed left-0 top-0 flex flex-col h-screen z-[90] transition-all duration-300",
				"bg-white/80 dark:bg-black/80 backdrop-blur-xl border-r border-neutral-200 dark:border-white/10",
				isDisplayCollapsed ? "w-[72px]" : "w-[240px]"
			)}
			style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
		>
			{/* Live Chronometer (Replaces Logo) */}
			<div className={cn(
				"h-24 flex items-center px-6 border-b border-neutral-100 dark:border-white/5 mb-2 transition-all duration-300",
				isDisplayCollapsed ? "justify-center px-0" : "justify-start"
			)}>
				{/* Compact Date */}
				<div className={cn(
					"h-12 w-12 rounded-2xl bg-neutral-50 dark:bg-white/5 flex flex-col items-center justify-center flex-shrink-0 border border-neutral-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors",
					isDisplayCollapsed && "bg-black dark:bg-white text-white dark:text-black border-transparent"
				)}>
					<div className={cn(
						"absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse",
						isDisplayCollapsed && "bg-white dark:bg-black"
					)} />
					<span className={cn(
						"text-[8px] font-black uppercase leading-none mb-0.5",
						isDisplayCollapsed ? "text-white/60 dark:text-black/60" : "text-neutral-400"
					)}>{month}</span>
					<span className="text-xl font-black leading-none tracking-tight">{dayNum}</span>
				</div>

				{/* Expanded Time */}
				<div className={cn(
					"ml-4 flex flex-col justify-center transition-all duration-300 overflow-hidden whitespace-nowrap",
					isDisplayCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
				)}>
					<span className="text-2xl font-black tracking-tighter text-black dark:text-white leading-none">
						{time}
					</span>
					<span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] leading-none mt-1.5">
						{weekday}
					</span>
				</div>
			</div>

			{/* Main Navigation */}
			<nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 [&::-webkit-scrollbar]:hidden">
				{!isDisplayCollapsed && (
					<h3 className="px-4 mb-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-50">
						{userRole === 'ADMIN' ? 'System' : 'Navigation'}
					</h3>
				)}
				{linksToRender.map((item) => (
					<NavItemComponent key={item.href} item={item} />
				))}
			</nav>

			{/* User Profile */}
			<div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50">
				<button
					onClick={() => handleNavigate('/customer/profile')}
					className={cn(
						"flex items-center gap-3 w-full p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors group",
						isDisplayCollapsed ? "justify-center" : "justify-start"
					)}
				>
					<Avatar className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 transition-transform group-hover:scale-105">
						<AvatarImage src={avatarUrl} />
						<AvatarFallback className="rounded-lg bg-neutral-100 dark:bg-white/10 text-xs font-bold">
							{user.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
						</AvatarFallback>
					</Avatar>

					<div className={cn(
						"flex-1 min-w-0 text-left transition-all duration-300 overflow-hidden",
						isDisplayCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
					)}>
						<p className="text-xs font-bold text-black dark:text-white truncate">
							{user.first_name || "User"}
						</p>
						<p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide truncate">
							{roleLabel}
						</p>
					</div>
				</button>
			</div>
		</aside>
	);
}