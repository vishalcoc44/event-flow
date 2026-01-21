"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, Users, MapPin, CheckCircle2, MoreHorizontal, TrendingUp, Lock, Globe, ShieldCheck, LayoutGrid, UserPlus } from "lucide-react";

// --- Demo Components for Landing Page ---

export function EventCardDemo() {
	return (
		<div className="relative w-full max-w-xs mx-auto transform hover:scale-105 transition-transform duration-300">
			<div className={cn(
				"rounded-3xl border border-white/10 overflow-hidden",
				"bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/5",
				"flex flex-col p-4 gap-4"
			)}>
				{/* Real Image Area */}
				<div className="h-32 rounded-2xl relative overflow-hidden">
					<img
						src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=300&auto=format&fit=crop"
						className="absolute inset-0 h-full w-full object-cover"
						alt="Event"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
					<div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
						Oct 24
					</div>
				</div>

				<div className="space-y-2">
					<h3 className="font-bold text-lg leading-tight">Tech Innovators Summit 2024</h3>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3" />
						<span>San Francisco, CA</span>
					</div>
				</div>

				<div className="flex items-center justify-between pt-2 border-t border-white/10">
					<div className="flex -space-x-2">
						{[
							"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
							"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
							"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
						].map((src, i) => (
							<img key={i} src={src} className="h-6 w-6 rounded-full border border-white dark:border-black object-cover" alt="Avatar" />
						))}
					</div>
					<span className="text-xs font-bold text-pastel-sky-dark bg-pastel-sky/30 px-2 py-1 rounded-full">Coming Soon</span>
				</div>
			</div>
		</div>
	);
}

export function BookingTableDemo() {
	const attendees = [
		{ name: "Alice M.", status: "Confirmed", type: "VIP" },
		{ name: "David K.", status: "Pending", type: "General" },
		{ name: "Sarah J.", status: "Confirmed", type: "Speaker" },
	];

	return (
		<div className="w-full max-w-sm mx-auto rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden">
			{/* Visual Header */}
			<div className="h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative">
				<div className="absolute inset-0 bg-grid-white/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
				<div className="absolute bottom-2 left-4 px-2 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
						<span className="text-[10px] font-bold text-white/80">Live Updates</span>
					</div>
				</div>
			</div>

			<div className="p-4 flex flex-col gap-3">
				<div className="flex items-center justify-between mb-2">
					<h4 className="font-bold text-sm">Recent Bookings</h4>
					<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
				</div>
				{attendees.map((att, i) => (
					<div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 transition-colors">
						<div className="flex items-center gap-3">
							<img
								src={i === 0 ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" : i === 1 ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" : "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=100&auto=format&fit=crop"}
								className="h-8 w-8 rounded-full object-cover"
								alt={att.name}
							/>
							<div>
								<p className="text-xs font-bold">{att.name}</p>
								<p className="text-[10px] text-muted-foreground">{att.type}</p>
							</div>
						</div>
						<span className={cn(
							"text-[10px] px-2 py-0.5 rounded-full font-medium",
							att.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
						)}>
							{att.status}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

export function ActivityDemo() {
	return (
		<div className="w-full max-w-xs mx-auto p-5 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl">
			<div className="flex justify-between items-end mb-4">
				<div>
					<p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Revenue</p>
					<h3 className="text-2xl font-black text-foreground">$12,450</h3>
				</div>
				<div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-[10px] font-bold">
					<TrendingUp className="h-3 w-3" />
					<span>+12.5%</span>
				</div>
			</div>
			<div className="h-16 flex items-end gap-1">
				{[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
					<div key={i} className="flex-1 bg-pastel-sky-dark/20 rounded-t-sm hover:bg-pastel-sky-dark/50 transition-colors" style={{ height: `${h}%` }} />
				))}
			</div>
		</div>
	)
}

export function SocialDemo() {
	return (
		<div className="w-full max-w-sm mx-auto p-4 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl space-y-3">
			<div className="flex gap-3">
				<div className="h-10 w-10 rounded-full bg-pastel-rose/30 flex items-center justify-center text-xs font-bold text-pink-600">
					EF
				</div>
				<div className="flex-1 bg-white/50 rounded-2xl p-3 text-xs leading-relaxed">
					<p>Just launched our new event page! 🚀 Check it out directly on EventFlow.</p>
				</div>
			</div>
			<div className="flex justify-end gap-3 pr-2 items-center">
				<div className="flex items-center gap-1">
					<div className="h-4 w-4 rounded-full bg-pink-500/20 flex items-center justify-center">
						<div className="h-2 w-2 rounded-full bg-pink-500" />
					</div>
					<span className="text-[10px] font-bold text-muted-foreground">1.2k</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center">
						<div className="h-2 w-2 rounded-full bg-blue-500" />
					</div>
					<span className="text-[10px] font-bold text-muted-foreground">450</span>
				</div>
			</div>
		</div>
	)
}

export function SupportDemo() {
	return (
		<div className="w-full max-w-xs mx-auto rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl text-center overflow-hidden">
			{/* Visual Header */}
			<div className="h-24 bg-gradient-to-br from-orange-400/20 to-pink-500/20 relative flex items-center justify-center">
				<div className="flex -space-x-3">
					{[
						"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
						"https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
						"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
					].map((src, i) => (
						<img
							key={i}
							src={src}
							className="h-10 w-10 rounded-full border-2 border-white dark:border-black object-cover shadow-sm"
							alt="Support Staff"
						/>
					))}
				</div>
				<div className="absolute bottom-2 right-10 h-3 w-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
			</div>

			<div className="p-4">
				<h4 className="font-bold text-sm mb-1">24/7 Expert Support</h4>
				<p className="text-xs text-muted-foreground">Our team is here to help you succeed anytime, anywhere.</p>
				<button className="mt-4 w-full py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity">
					Chat Now
				</button>
			</div>
		</div>
	)
}

export function SecurityDemo() {
	return (
		<div className="w-full max-w-xs mx-auto p-6 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl flex flex-col items-center">
			<div className="relative h-20 w-20 mb-4 flex items-center justify-center">
				<div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
				<div className="h-20 w-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
					<ShieldCheck className="h-10 w-10 text-white" />
				</div>
				<div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-1 shadow-sm">
					<CheckCircle2 className="h-5 w-5 text-green-500" />
				</div>
			</div>
			<h3 className="font-bold text-lg mb-1">Bank-Grade Security</h3>
			<p className="text-xs text-center text-muted-foreground">End-to-end encryption for every transaction.</p>
		</div>
	)
}

export function GlobalDemo() {
	return (
		<div className="w-full max-w-xs mx-auto p-6 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl relative overflow-hidden group">
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
			<div className="h-32 w-full relative flex items-center justify-center">
				<Globe className="h-24 w-24 text-blue-500/20 absolute animate-[spin_10s_linear_infinite]" />
				<Globe className="h-24 w-24 text-blue-500/40 absolute" />

				{/* Connectivity Dots */}
				<div className="absolute top-8 left-10 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
				<div className="absolute bottom-10 right-12 h-2 w-2 bg-purple-500 rounded-full animate-pulse delay-75" />
				<div className="absolute top-12 right-8 h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-150" />
			</div>
			<div className="text-center relative z-10">
				<h3 className="font-bold text-lg">150+ Countries</h3>
				<p className="text-xs text-muted-foreground">Connect borders instantly.</p>
			</div>
		</div>
	)
}

export function VenueDemo() {
	return (
		<div className="w-full max-w-xs mx-auto p-4 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl flex flex-col gap-3">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<LayoutGrid className="h-4 w-4 text-purple-500" />
					<h4 className="font-bold text-sm">Venue Layouts</h4>
				</div>
				<div className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">3 Active</div>
			</div>
			<div className="grid grid-cols-2 gap-2">
				{["Main Hall", "Conf Room A", "Conf Room B", "Open Area"].map((room, i) => (
					<div key={i} className="bg-white/50 dark:bg-black/50 p-2 rounded-xl border border-white/10 text-center">
						<div className={`h-8 w-full rounded-lg mb-1 ${i === 0 ? 'bg-purple-200' : 'bg-gray-100 dark:bg-gray-800'}`} />
						<span className="text-[10px] font-medium text-muted-foreground">{room}</span>
					</div>
				))}
			</div>
		</div>
	)
}

export function TeamDemo() {
	const members = [
		{ name: "John D.", role: "Admin", img: "bg-blue-200" },
		{ name: "Sarah W.", role: "Manager", img: "bg-pink-200" },
		{ name: "Mike R.", role: "Editor", img: "bg-green-200" },
	];
	return (
		<div className="w-full max-w-xs mx-auto p-4 rounded-3xl border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-xl">
			<div className="flex items-center justify-between mb-4">
				<h4 className="font-bold text-sm">Team Members</h4>
				<UserPlus className="h-4 w-4 text-blue-500" />
			</div>
			<div className="space-y-3">
				{members.map((m, i) => (
					<div key={i} className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<img
								src={i === 0 ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=100&auto=format&fit=crop" : i === 1 ? "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop" : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"}
								className="h-8 w-8 rounded-full object-cover"
								alt={m.name}
							/>
							<div className="flex flex-col">
								<span className="text-xs font-bold">{m.name}</span>
								<span className="text-[10px] text-muted-foreground">{m.role}</span>
							</div>
						</div>
						<div className="h-2 w-2 rounded-full bg-green-500" />
					</div>
				))}
			</div>
		</div>
	)
}
