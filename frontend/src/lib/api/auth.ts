import { supabase, handleAuthError } from '../supabase';

// Types for organization data cache
interface OrgData {
	organization_id: string | null;
	role_in_org: 'OWNER' | 'ADMIN' | 'USER' | null;
	is_org_admin: boolean;
	joined_at: string | null;
	role: 'ADMIN' | 'USER';
}

// Simple cache for organization data to avoid repeated DB calls
const orgDataCache = new Map<string, { data: OrgData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Auth timeout configuration
export const AUTH_TIMEOUT_CONFIG = {
	baseTimeout: 2000,
	maxTimeout: 5000,
	maxRetries: 2
};

const getCachedOrgData = (userId: string) => {
	const cached = orgDataCache.get(userId);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}
	return null;
};

const setCachedOrgData = (userId: string, data: any) => {
	orgDataCache.set(userId, { data, timestamp: Date.now() });
};

const clearCachedOrgData = (userId: string) => {
	orgDataCache.delete(userId);
};

export const authAPI = {
	login: async (email: string, password: string) => {
		try {
			console.log('🔐 Attempting login for:', email);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				console.log('❌ Supabase auth error:', error);
				return {
					success: false,
					data: null,
					error: error.message
				};
			}

			console.log('✅ Supabase auth success:', data?.user?.email);
			return {
				success: true,
				data: data,
				error: null
			};
		} catch (error: any) {
			console.log('💥 Supabase auth exception:', error);
			return {
				success: false,
				data: null,
				error: error.message || 'Login failed'
			};
		}
	},

	register: async (userData: {
		email: string;
		password: string;
		username?: string;
		firstName?: string;
		lastName?: string;
		contactNumber?: string;
		city?: string;
		pincode?: string;
		streetAddress?: string;
		role?: string;
	}) => {
		try {
			const { data, error } = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					data: {
						username: userData.username || userData.email.split('@')[0],
						first_name: userData.firstName || '',
						last_name: userData.lastName || '',
						contact_number: userData.contactNumber || '',
						city: userData.city || '',
						pincode: userData.pincode || '',
						street_address: userData.streetAddress || '',
						role: userData.role || 'USER'
					}
				}
			});

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		}
	},

	getCurrentUser: async () => {
		try {
			const userPromise = supabase.auth.getUser();
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error('User fetch timeout')), 2000)
			);

			const { data, error } = await Promise.race([userPromise, timeoutPromise]) as { data: any; error: any };
			if (error) throw error;
			return data.user;
		} catch (error) {
			console.error('Get user error:', error);
			throw error;
		}
	},

	checkAuthStatus: async (customRetries?: number) => {
		const maxRetries = customRetries ?? AUTH_TIMEOUT_CONFIG.maxRetries;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				const timeoutMs = Math.min(
					AUTH_TIMEOUT_CONFIG.baseTimeout * (attempt + 1),
					AUTH_TIMEOUT_CONFIG.maxTimeout
				);

				const sessionPromise = supabase.auth.getSession();
				const timeoutPromise = new Promise((_, reject) =>
					setTimeout(() => reject(new Error(`Auth check timeout (${timeoutMs}ms)`)), timeoutMs)
				);

				const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

				if (error) {
					const authErrorResult = handleAuthError(error);
					if (authErrorResult.shouldSignOut) {
						await supabase.auth.signOut();
						return {
							isAuthenticated: false,
							user: null,
							session: null,
							error: authErrorResult.error
						};
					}

					if (attempt === maxRetries) throw error;
					continue;
				}

				return {
					isAuthenticated: !!data.session,
					user: data.session?.user || null,
					session: data.session
				};
			} catch (error: any) {
				if (attempt === maxRetries) {
					return {
						isAuthenticated: false,
						user: null,
						session: null,
						error: error.message
					};
				}
				const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}

		return {
			isAuthenticated: false,
			user: null,
			session: null,
			error: 'Auth check failed after all retries'
		};
	},

	getUserOrganizationData: async (userId: string, useCache: boolean = true) => {
		try {
			if (useCache) {
				const cachedData = getCachedOrgData(userId);
				if (cachedData) return cachedData;
			}

			const orgPromise = supabase
				.from('users')
				.select('organization_id, role_in_org, is_org_admin, joined_at, role, onboarding_step')
				.eq('id', userId)
				.single();

			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Organization data timeout')), 5000)
			);

			const { data, error } = await Promise.race([orgPromise, timeoutPromise]) as any;

			if (error) throw error;

			if (useCache) setCachedOrgData(userId, data);

			return data;
		} catch (error) {
			console.error('Get organization data error:', error);
			return null;
		}
	},

	signOut: async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		}
	},

	clearUserOrganizationCache: (userId: string) => {
		clearCachedOrgData(userId);
	},

	// Added for forensic improvement: persistent onboarding
	updateOnboardingStep: async (userId: string, step: number) => {
		try {
			const { error } = await supabase
				.from('users')
				.update({ onboarding_step: step })
				.eq('id', userId);

			if (error) throw error;
			return true;
		} catch (error) {
			console.error('Update onboarding step error:', error);
			return false;
		}
	}
};
