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
	const router = useRouter();
	const pathname = usePathname();
	const { user } = useAuth();

	// Don't render for guests
	if (!user) return null;

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

	useEffect(() => {
		const timer = setTimeout(() => {
			setCollapsed(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// The sidebar is visually collapsed only if it's pinned closed AND not hovered
	const isDisplayCollapsed = collapsed && !isHovered;

	const NavItemComponent = ({ item }: { item: NavItem }) => {
		const isActive = item.href === currentPath || pathname.startsWith(item.href);
		const Icon = item.icon;

		return (
			<button
				onClick={() => handleNavigate(item.href)}
				className={cn(
					"flex items-center gap-3 py-2 rounded-xl transition-all duration-200 group",
					isDisplayCollapsed ? "w-auto px-1" : "w-full px-3",
					isActive && !isDisplayCollapsed && "bg-gradient-to-r from-sky-400/15 to-cyan-400/15",
					!isActive && "hover:bg-white/50 dark:hover:bg-white/5"
				)}
			>
				<div className={cn(
					"flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 flex-shrink-0",
					isActive
						? "bg-gradient-to-br from-sky-400 to-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.35)]"
						: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-white/15"
				)}>
					<Icon className="w-5 h-5" />
				</div>
				<span className={cn(
					"flex-1 text-left text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
					isActive ? "text-sky-500 dark:text-sky-400" : "text-gray-600 dark:text-gray-400",
					isDisplayCollapsed ? "w-0 opacity-0 min-w-0" : "w-auto opacity-100"
				)}>
					{item.label}
				</span>
				{item.badge && (
					<div className={cn(
						"transition-all duration-300 overflow-hidden",
						isDisplayCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
					)}>
						<Badge className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-500 text-white text-[10px] p-0 shadow-sm">
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
				"fixed left-0 top-0 flex flex-col h-screen z-[90] transition-all duration-300 ease-in-out",
				"bg-white/60 dark:bg-black/60 backdrop-blur-xl border-r border-white/20 dark:border-white/10",
				"shadow-[4px_0_24px_-2px_rgba(0,0,0,0.1)]",
				isDisplayCollapsed ? "w-[80px]" : "w-[280px]"
			)}
		>
			{/* Main Navigation */}
			<nav className={cn(
				"flex-1 overflow-y-auto pt-6 pb-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
				isDisplayCollapsed ? "px-3" : "px-3"
			)}>
				<div>
					<div className={cn(
						"overflow-hidden transition-all duration-300 ease-in-out",
						isDisplayCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-3"
					)}>
						<h3 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
							{userRole === 'ADMIN' ? 'Admin Tools' : 'Main Menu'}
						</h3>
					</div>
					<div className="space-y-1">
						{linksToRender.map((item) => (
							<NavItemComponent key={item.href} item={item} />
						))}
					</div>
				</div>
			</nav>

			{/* User Profile */}
			<div className="border-t border-gray-200/50 dark:border-white/10 p-3">
				<div
					onClick={() => handleNavigate('/customer/profile')}
					className={cn(
						"flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer",
						isDisplayCollapsed && "justify-center"
					)}
				>
					<Avatar className="h-10 w-10 border-2 border-sky-400/20 shadow-sm">
						<AvatarImage src={user.avatar_url} />
						<AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-400 text-white text-sm font-bold">
							{user.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
						</AvatarFallback>
					</Avatar>
					<div className={cn(
						"flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap",
						isDisplayCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
					)}>
						<p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
							{user.first_name || "User"}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
							{roleLabel}
						</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
