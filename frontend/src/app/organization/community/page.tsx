'use client';

import { useEffect, useState } from 'react';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GlassTile } from '@/components/ui/glass-tile';
import {
	Users,
	UserPlus,
	UserMinus,
	MessageSquare,
	Search,
	Share2,
	Heart,
	TrendingUp,
	ArrowRight,
	Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Follower {
	id: string;
	follower_id: string;
	target_id: string;
	created_at: string;
	profiles?: {
		username: string;
		first_name: string;
		last_name: string;
		avatar_url: string;
	};
}

export default function CommunityPage() {
	const { organization, orgLoading } = useOrganizationData();
	const { user } = useAuth();
	const { toast } = useToast();

	const [followers, setFollowers] = useState<Follower[]>([]);
	const [following, setFollowing] = useState<Follower[]>([]);
	const [loading, setLoading] = useState(true);
	const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

	useEffect(() => {
		if (user?.id) {
			fetchSocialData();
		}
	}, [user]);

	const fetchSocialData = async () => {
		if (!user?.id) return;

		setLoading(true);
		try {
			// Step 1: Fetch follow records
			const [followersResponse, followingResponse] = await Promise.all([
				supabase
					.from('follows')
					.select('id, follower_id, target_id, created_at')
					.eq('target_id', user.id)
					.eq('target_type', 'USER'),
				supabase
					.from('follows')
					.select('id, follower_id, target_id, created_at')
					.eq('follower_id', user.id)
					.eq('target_type', 'USER')
			]);

			if (followersResponse.error) throw followersResponse.error;
			if (followingResponse.error) throw followingResponse.error;

			const followersData = followersResponse.data || [];
			const followingData = followingResponse.data || [];

			// Step 2: Collect all unique user IDs to fetch profiles
			const userIds = Array.from(new Set([
				...followersData.map(f => f.follower_id),
				...followingData.map(f => f.target_id)
			]));

			if (userIds.length === 0) {
				setFollowers([]);
				setFollowing([]);
				return;
			}

			// Step 3: Fetch profiles for these users
			const { data: profilesData, error: profilesError } = await supabase
				.from('users')
				.select(`
					id,
					username,
					first_name,
					last_name,
					user_profiles (
						profile_image_url
					)
				`)
				.in('id', userIds);

			if (profilesError) throw profilesError;

			// Create a lookup map for profiles
			const profileMap = (profilesData || []).reduce((acc: any, profile: any) => {
				acc[profile.id] = {
					id: profile.id,
					username: profile.username,
					first_name: profile.first_name,
					last_name: profile.last_name,
					avatar_url: profile.user_profiles?.[0]?.profile_image_url || profile.user_profiles?.profile_image_url
				};
				return acc;
			}, {});

			// Step 4: Map back to Followers/Following state
			const mappedFollowers = followersData.map(f => ({
				...f,
				profiles: profileMap[f.follower_id]
			}));

			const mappedFollowing = followingData.map(f => ({
				...f,
				profiles: profileMap[f.target_id]
			}));

			setFollowers(mappedFollowers);
			setFollowing(mappedFollowing);
		} catch (error: any) {
			toast({
				title: "Link Disturbance",
				description: error.message || "Failed to synchronize social graph.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleUnfollow = async (targetId: string, followRecordId: string) => {
		if (!user?.id || unfollowingId) return;
		setUnfollowingId(followRecordId);

		try {
			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('id', followRecordId);

			if (error) throw error;

			// Update local state
			setFollowing(prev => prev.filter(f => f.id !== followRecordId));
			toast({
				title: "Unfollowed",
				description: "You are no longer following this user.",
			});
		} catch (error: any) {
			toast({
				title: "Failed to Unfollow",
				description: error.message || "An error occurred.",
				variant: "destructive",
			});
		} finally {
			setUnfollowingId(null);
		}
	};

	if (orgLoading || loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
			{/* Mesh Background */}
			<div className="fixed inset-0 z-[-1] opacity-30 pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
			</div>

			<Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

			<main className="flex-grow pt-32 pb-20">
				<div className="container mx-auto px-4 max-w-5xl">
					{/* Header */}
					<div className="mb-12">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
								<Share2 className="h-5 w-5" />
							</div>
							<span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-500">Social Graph</span>
						</div>
						<h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
							Community Layer.
						</h1>
						<p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1">
							Analyze relationships and interaction density
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
						<GlassTile className="p-8 text-center" interactive={false}>
							<h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Followers</h4>
							<p className="text-5xl font-black tracking-tighter">{followers.length}</p>
						</GlassTile>
						<GlassTile className="p-8 text-center" interactive={false}>
							<h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Following</h4>
							<p className="text-5xl font-black tracking-tighter">{following.length}</p>
						</GlassTile>
						<GlassTile className="p-8 text-center bg-gradient-to-br from-purple-500/5 to-blue-500/5" interactive={false}>
							<h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Social Rank</h4>
							<p className="text-5xl font-black tracking-tighter text-purple-500">#12</p>
						</GlassTile>
					</div>

					<Tabs defaultValue="followers" className="w-full">
						<TabsList className="w-full h-16 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 p-2 rounded-[24px] mb-8">
							<TabsTrigger value="followers" className="flex-1 rounded-[18px] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 shadow-none">
								<Users className="h-4 w-4 mr-2" /> Followers
							</TabsTrigger>
							<TabsTrigger value="following" className="flex-1 rounded-[18px] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 shadow-none">
								<UserPlus className="h-4 w-4 mr-2" /> Following
							</TabsTrigger>
							<TabsTrigger value="discover" className="flex-1 rounded-[18px] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 shadow-none">
								<Search className="h-4 w-4 mr-2" /> Discover
							</TabsTrigger>
						</TabsList>

						<TabsContent value="followers">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{followers.length === 0 ? (
									<GlassTile className="col-span-full p-16 text-center" interactive={false}>
										<Users className="h-12 w-12 text-purple-500/30 mx-auto mb-4" />
										<h3 className="text-xl font-black tracking-tighter mb-2">No Followers Yet</h3>
										<p className="text-neutral-500 font-medium text-sm mb-6 max-w-xs mx-auto">
											Share your events and engage with the community to grow your following.
										</p>
										<Button variant="outline" className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
											Explore Events
										</Button>
									</GlassTile>
								) : (
									followers.map((f, i) => (
										<UserCard key={f.id} profile={f.profiles} type="follower" index={i} followRecordId={f.id} />
									))
								)}
							</div>
						</TabsContent>

						<TabsContent value="following">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{following.length === 0 ? (
									<GlassTile className="col-span-full p-16 text-center" interactive={false}>
										<UserPlus className="h-12 w-12 text-purple-500/30 mx-auto mb-4" />
										<h3 className="text-xl font-black tracking-tighter mb-2">Not Following Anyone</h3>
										<p className="text-neutral-500 font-medium text-sm mb-6 max-w-xs mx-auto">
											Discover event organizers and community members to follow.
										</p>
										<Button variant="outline" className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
											Discover People
										</Button>
									</GlassTile>
								) : (
									following.map((f, i) => (
										<UserCard
											key={f.id}
											profile={f.profiles}
											type="following"
											index={i}
											followRecordId={f.id}
											onUnfollow={handleUnfollow}
											isUnfollowing={unfollowingId === f.id}
										/>
									))
								)}
							</div>
						</TabsContent>

						<TabsContent value="discover">
							<GlassTile className="p-16 text-center" interactive={false}>
								<TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-6" />
								<h3 className="text-2xl font-black tracking-tighter mb-4">Discovery Mode Offline.</h3>
								<p className="text-neutral-500 font-medium max-w-sm mx-auto">
									Algorithmic discovery is currently restricted. Establish more manual links to activate recommendation protocols.
								</p>
							</GlassTile>
						</TabsContent>
					</Tabs>
				</div>
			</main>

			<Footer />
		</div>
	);
}

function UserCard({
	profile,
	type,
	index,
	followRecordId,
	onUnfollow,
	isUnfollowing
}: {
	profile: any;
	type: string;
	index: number;
	followRecordId?: string;
	onUnfollow?: (targetId: string, followRecordId: string) => void;
	isUnfollowing?: boolean;
}) {
	if (!profile) return null;

	const handleUnfollowClick = () => {
		if (onUnfollow && followRecordId) {
			onUnfollow(profile.id || '', followRecordId);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
		>
			<GlassTile className="p-6 flex items-center justify-between group overflow-hidden">
				<div className="flex items-center gap-4 relative z-10">
					<Avatar className="h-16 w-16 rounded-2xl border-2 border-white/60 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
						<AvatarImage src={profile.avatar_url} />
						<AvatarFallback className="bg-purple-500/10 text-purple-500 font-black">
							{profile.username?.substring(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<h4 className="text-lg font-black tracking-tighter uppercase group-hover:text-purple-500 transition-colors">
							{profile.first_name || 'Anonymous'} {profile.last_name || ''}
						</h4>
						<p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
							@{profile.username || 'unknown'}
						</p>
					</div>
				</div>

				<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10 rounded-xl hover:bg-purple-500/20 hover:text-purple-500"
						aria-label="Send message"
					>
						<MessageSquare className="h-4 w-4" />
					</Button>
					{type === 'following' && onUnfollow && (
						<Button
							variant="ghost"
							size="icon"
							className="h-10 w-10 text-red-500 rounded-xl hover:bg-red-500/20"
							onClick={handleUnfollowClick}
							disabled={isUnfollowing}
							aria-label="Unfollow user"
						>
							{isUnfollowing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<UserMinus className="h-4 w-4" />
							)}
						</Button>
					)}
				</div>

				{/* Decorative elements */}
				<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
					<Heart className="h-24 w-24" />
				</div>
			</GlassTile>
		</motion.div>
	);
}
