'use client';

import { useState, useEffect } from 'react';
import {
	Activity,
	UserPlus,
	Settings,
	Calendar,
	Layout,
	Trash2,
	LogOut,
	Clock,
	ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GlassTile } from '@/components/ui/glass-tile';
import { cn } from '@/lib/utils';
import { organizationAPI } from '@/lib/api';


interface ActivityLogProps {
	organizationId: string;
}

const actionIcons: Record<string, any> = {
	'MEMBER_INVITED': UserPlus,
	'MEMBER_REMOVED': LogOut,
	'ORGANIZATION_UPDATED': Settings,
	'EVENT_CREATED': Calendar,
	'EVENT_UPDATED': Calendar,
	'SPACE_CREATED': Layout,
	'SPACE_UPDATED': Layout,
	'SPACE_DELETED': Trash2,
};

const actionColors: Record<string, string> = {
	'MEMBER_INVITED': 'text-blue-500 bg-blue-500/10',
	'MEMBER_REMOVED': 'text-red-500 bg-red-500/10',
	'ORGANIZATION_UPDATED': 'text-purple-500 bg-purple-500/10',
	'EVENT_CREATED': 'text-green-500 bg-green-500/10',
	'SPACE_CREATED': 'text-orange-500 bg-orange-500/10',
};

export function ActivityLog({ organizationId }: ActivityLogProps) {
	const [activities, setActivities] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadActivities() {
			try {
				const data = await organizationAPI.getActivityLog(organizationId);
				setActivities(data);
			} catch (error) {
				console.error('Failed to load activity log:', error);
			} finally {
				setIsLoading(false);
			}
		}


		if (organizationId) {
			loadActivities();
		}
	}, [organizationId]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
				))}
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
				<Activity className="h-12 w-12 mb-4" />
				<p className="text-[10px] font-black uppercase tracking-[0.2em]">No recent activity detected.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{activities.map((activity, idx) => {
				const Icon = actionIcons[activity.action] || Activity;
				const colorClass = actionColors[activity.action] || 'text-neutral-500 bg-neutral-500/10';

				return (
					<div
						key={activity.id}
						className="animate-in slide-in-from-left-10 fade-in duration-300"
						style={{ animationDelay: `${idx * 50}ms` }}
					>
						<GlassTile className="p-4" interactive={false}>
							<div className="flex items-center gap-4">
								<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
									<Icon className="w-5 h-5" />
								</div>

								<div className="flex-grow min-w-0">
									<div className="flex items-center justify-between gap-2 mb-1">
										<p className="text-xs font-black uppercase tracking-widest truncate">
											{activity.action.replace(/_/g, ' ')}
										</p>
										<span className="text-[10px] whitespace-nowrap opacity-40 flex items-center gap-1 font-bold italic">
											<Clock className="w-3 h-3" />
											{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
										</span>
									</div>

									<div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500">
										<span className="font-black text-neutral-800 dark:text-neutral-200">
											{activity.actor?.email || 'System'}
										</span>
										<ArrowRight className="w-3 h-3 opacity-30" />
										<span className="truncate italic">
											{activity.entity_type} {activity.details?.name || ''}
										</span>
									</div>
								</div>
							</div>
						</GlassTile>
					</div>
				);
			})}
		</div>
	);
}
