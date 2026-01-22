'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Calendar,
	Clock,
	MapPin,
	DollarSign,
	Image as ImageIcon,
	Type,
	AlignLeft,
	Layers,
	Save,
	X,
	Sparkles,
	ChevronRight,
	ArrowLeft,
	Upload,
	CheckCircle2,
	ShieldCheck,
	Globe,
	Lock,
	Users,
	Hash
} from 'lucide-react';

import { useEvents } from '@/contexts/EventContext';
import { useCategories } from '@/contexts/CategoryContext';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/lib/api';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GlassTile } from '@/components/ui/glass-tile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function EventArchitectComponent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = searchParams.get('id');

	const { addEvent, updateEvent, loading: eventContextLoading } = useEvents();
	const { categories, loading: categoriesLoading } = useCategories();
	const { organization, orgLoading } = useOrganizationData();
	const { user } = useAuth();
	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const [form, setForm] = useState({
		title: '',
		description: '',
		category_id: '' as string,
		location: '',
		price: '',
		date: '',
		time: '',
		image: null as File | null,
		image_url: '',
		is_public: true,
		requires_approval: false,
		max_attendees: '',
		tags: ''
	});

	useEffect(() => {
		const loadEvent = async () => {
			if (eventId) {
				try {
					setIsLoading(true);
					const eventData = await eventsAPI.getEventById(eventId);
					if (eventData) {
						setForm({
							title: eventData.title || '',
							description: eventData.description || '',
							category_id: eventData.category_id || '',
							location: eventData.location || '',
							price: eventData.price?.toString() || '',
							date: eventData.date || '',
							time: eventData.time || '',
							image: null,
							image_url: eventData.image_url || '',
							is_public: eventData.is_public ?? true,
							requires_approval: eventData.requires_approval ?? false,
							max_attendees: eventData.max_attendees?.toString?.() || '',
							tags: Array.isArray(eventData.event_tags)
								? eventData.event_tags
									.map((et: any) => et?.tag?.name)
									.filter(Boolean)
									.join(', ')
								: ''
						});
						if (eventData.image_url) setPreviewImage(eventData.image_url);
					}
				} catch (error) {
					console.error('Error loading event:', error);
					toast({ title: "Extraction Error", description: "Failed to pull incident data from the matrix.", variant: "destructive" });
				} finally {
					setIsLoading(false);
				}
			}
		};
		loadEvent();
	}, [eventId, toast]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setForm(prev => ({ ...prev, image: file }));
			const reader = new FileReader();
			reader.onloadend = () => setPreviewImage(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!organization || !organization.id) {
			toast({ title: "Sync Required", description: "Establish organization synchronization before event deployment.", variant: "destructive" });
			return;
		}

		setIsSubmitting(true);
		try {
			const tags = form.tags
				.split(',')
				.map(t => t.trim())
				.filter(Boolean)
				.slice(0, 12);

			const maxAttendeesParsed = form.max_attendees.trim()
				? Math.max(0, parseInt(form.max_attendees, 10))
				: null;

			const eventData = {
				...form,
				organization_id: organization.id,
				price: parseFloat(form.price) || 0,
				max_attendees: Number.isFinite(maxAttendeesParsed as any) && (maxAttendeesParsed as number) > 0 ? maxAttendeesParsed : null,
				tags: tags.length > 0 ? tags : null
			};

			console.log('Submitting event data:', eventData);

			if (eventId) {
				// events table doesn't have a `tags` column; tags are managed via `event_tags`
				// (creation uses the safe RPC to attach tags; update skips tag writes for now)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { tags: _tags, ...eventUpdateData } = eventData as any;
				await updateEvent(eventId, eventUpdateData);
				toast({ title: "Matrix Updated", description: "Event configuration successfully synchronized." });
			} else {
				await addEvent(eventData);
				toast({ title: "Deployment Successful", description: "New event has been projected into the grid." });
			}
			router.push('/organization/events');
		} catch (error: any) {
			console.error('Submission error:', error);
			toast({ title: "Deployment Failure", description: error.message || "Network interference during deployment.", variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (orgLoading || isLoading) {
		return (
			<div className="min-h-screen bg-background flex flex-col pt-32 px-4">
				<div className="container mx-auto max-w-5xl animate-pulse">
					<div className="h-16 bg-white/5 rounded-3xl w-64 mb-12" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="md:col-span-2 h-[600px] bg-white/5 rounded-3xl" />
						<div className="h-[400px] bg-white/5 rounded-3xl" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
			{/* Mesh Accents */}
			<div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
			</div>

			<Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

			<main className="flex-grow pt-32 pb-20">
				<div className="container mx-auto px-4 max-w-6xl">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
					>
						<div>
							<div className="flex items-center gap-3 mb-2">
								<div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
									<Sparkles className="h-5 w-5" />
								</div>
								<span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Event Architect</span>
							</div>
							<h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
								{eventId ? 'Refine Event.' : 'Design Event.'}
							</h1>
							<p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
								Orchestrating {organization?.name} Experience
							</p>
						</div>

						<Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
							<Link href="/organization/events"><ArrowLeft className="h-4 w-4" /> Cancel Build</Link>
						</Button>
					</motion.div>

					<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Core Matrix */}
						<div className="lg:col-span-8 space-y-8">
							<GlassTile className="p-10" interactive={false}>
								<div className="flex items-center gap-3 mb-10">
									<Type className="h-5 w-5 text-blue-500" />
									<h3 className="text-2xl font-black tracking-tighter">Identity & Concept</h3>
								</div>

								<div className="space-y-8">
									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Event Designation</Label>
										<Input
											name="title"
											value={form.title}
											onChange={handleChange}
											placeholder="Ex: Neo-Tokyo Tech Summit 2026"
											required
											className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-8 text-lg"
										/>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Operational Protocol (Description)</Label>
										<Textarea
											name="description"
											value={form.description}
											onChange={handleChange}
											placeholder="Define the core objectives and experience architecture..."
											required
											className="min-h-[180px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-medium p-8 leading-relaxed text-base"
										/>
									</div>
								</div>
							</GlassTile>

							<GlassTile className="p-10" interactive={false}>
								<div className="flex items-center gap-3 mb-10">
									<MapPin className="h-5 w-5 text-blue-500" />
									<h3 className="text-2xl font-black tracking-tighter">Spatio-Temporal Data</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Physical Location</Label>
										<div className="relative">
											<Input
												name="location"
												value={form.location}
												onChange={handleChange}
												placeholder="Virtual Hub or Physical Address"
												required
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-12"
											/>
											<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
										</div>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Archetype (Category)</Label>
										<select
											name="category_id"
											value={form.category_id}
											onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
											required
											className="h-14 w-full rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
										>
											<option value="">Select Category</option>
											{categories?.map(cat => (
												<option key={cat.id} value={cat.id}>{cat.name}</option>
											))}
										</select>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Deployment Date</Label>
										<div className="relative">
											<Input
												name="date"
												type="date"
												value={form.date}
												onChange={handleChange}
												required
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-12"
											/>
											<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
										</div>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Extraction Time</Label>
										<div className="relative">
											<Input
												name="time"
												type="time"
												value={form.time}
												onChange={handleChange}
												required
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-12"
											/>
											<Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
										</div>
									</div>
								</div>
							</GlassTile>
						</div>

						{/* Sidebar Assets */}
						<div className="lg:col-span-4 space-y-8">
							<GlassTile className="p-8 overflow-hidden" interactive={false}>
								<div className="flex items-center gap-3 mb-6">
									<ImageIcon className="h-5 w-5 text-blue-500" />
									<h3 className="text-xl font-black tracking-tighter">Visual Asset</h3>
								</div>

								<div
									className="aspect-video rounded-2xl bg-neutral-100 dark:bg-white/5 border-2 border-dashed border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer"
									onClick={() => document.getElementById('image-upload')?.click()}
								>
									{previewImage ? (
										<>
											<img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
												<Upload className="h-8 w-8 text-white animate-bounce" />
											</div>
										</>
									) : (
										<div className="text-center p-6">
											<Upload className="h-8 w-8 text-neutral-400 mx-auto mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
											<p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Initialize Image</p>
										</div>
									)}
									<input
										id="image-upload"
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
									/>
								</div>
								<p className="mt-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-center">Recommended: 16:9 Aspect Ratio / Max 5MB</p>
							</GlassTile>

							<GlassTile className="p-8" interactive={false}>
								<div className="flex items-center gap-3 mb-8">
									<DollarSign className="h-5 w-5 text-blue-500" />
									<h3 className="text-xl font-black tracking-tighter">Access Tier</h3>
								</div>

								<div className="space-y-6">
									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Admission Toll (USD)</Label>
										<div className="relative">
											<Input
												name="price"
												type="number"
												step="0.01"
												value={form.price}
												onChange={handleChange}
												placeholder="0.00"
												required
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-black px-12 text-xl"
											/>
											<DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
										</div>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Max Attendees (optional)</Label>
										<div className="relative">
											<Input
												name="max_attendees"
												type="number"
												value={form.max_attendees}
												onChange={handleChange}
												placeholder="e.g. 150"
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-black px-12"
											/>
											<Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
										</div>
									</div>

									<div className="space-y-3">
										<Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Tags (comma separated)</Label>
										<div className="relative">
											<Input
												name="tags"
												value={form.tags}
												onChange={handleChange}
												placeholder="tech, music, workshop"
												className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-12"
											/>
											<Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
										</div>
										<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
											Up to 12 tags • used for discovery filters
										</p>
									</div>

									<div className="pt-4 space-y-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Globe className="h-4 w-4 text-neutral-400" />
												<span className="text-xs font-bold uppercase tracking-widest">Public Grid</span>
											</div>
											<Switch
												checked={form.is_public}
												onCheckedChange={(val) => setForm(prev => ({ ...prev, is_public: val }))}
												className="data-[state=checked]:bg-blue-500"
											/>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<ShieldCheck className="h-4 w-4 text-neutral-400" />
												<span className="text-xs font-bold uppercase tracking-widest">Pre-Approval</span>
											</div>
											<Switch
												checked={form.requires_approval}
												onCheckedChange={(val) => setForm(prev => ({ ...prev, requires_approval: val }))}
												className="data-[state=checked]:bg-blue-500"
											/>
										</div>
									</div>
								</div>
							</GlassTile>

							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-20 rounded-3xl bg-black dark:bg-white text-white dark:text-black font-black text-xl tracking-tighter hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-4 group"
							>
								{isSubmitting ? (
									<div className="h-6 w-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
								) : (
									<>
										<Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
										{eventId ? 'Sync Matrix' : 'Deploy Event'}
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</main>

			<Footer />
		</div>
	);
}

export default function EventArchitect() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="relative">
					<div className="w-24 h-24 border-8 border-white/5 rounded-full" />
					<div className="absolute inset-0 w-24 h-24 border-8 border-t-blue-500 rounded-full animate-spin" />
				</div>
			</div>
		}>
			<EventArchitectComponent />
		</Suspense>
	);
}
