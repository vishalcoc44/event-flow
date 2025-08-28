'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { performanceUtils } from '@/lib/performance'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

type User = {
    id: string
    role: 'ADMIN' | 'USER'
    email: string
    username?: string
    first_name?: string
    last_name?: string
    contact_number?: string
    city?: string
    pincode?: string
    street_address?: string
    created_at?: string
    // Organization-related fields
    organization_id?: string
    role_in_org?: 'OWNER' | 'ADMIN' | 'USER'
    is_org_admin?: boolean
    joined_at?: string
}

type AuthContextType = {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    register: (userData: { 
        email: string, 
        password: string, 
        username?: string,
        firstName?: string,
        lastName?: string,
        contactNumber?: string,
        city?: string,
        pincode?: string,
        streetAddress?: string,
        role?: string,
        isAdminRequest?: boolean
    }) => Promise<boolean>
    refreshAuth: () => Promise<void>
    clearInvalidSession: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    // Stabilized loading setter to prevent flickering
    const setLoadingStabilized = (loading: boolean) => {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout)
        }

        if (loading) {
            setIsLoading(true)
        } else {
            // Add a small delay before setting loading to false to prevent flickering
            const timeout = setTimeout(() => {
                setIsLoading(false)
            }, 100)
            setLoadingTimeout(timeout)
        }
    }

    useEffect(() => {
        let isInitialized = false;

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: any, session: any) => {
                console.log('🔄 Auth state change:', event, !!session, window?.location?.pathname);
                console.log('🔍 Session details:', session?.user?.email, session?.expires_at);

                // Handle token refresh errors by checking session validity
                if (event === 'TOKEN_REFRESHED' && !session) {
                    console.log('🔄 Token refresh failed, clearing session...');
                    await clearInvalidSession();
                    return;
                }

                // Handle authentication errors (including refresh token errors)
                if (event === 'SIGNED_OUT') {
                    console.log('🔄 User signed out, clearing session...');
                    setUser(null);
                    isInitialized = true;
                    return;
                }

                // Prevent duplicate processing during initialization
                if (event === 'INITIAL_SESSION' && isInitialized) {
                    return;
                }
                
                if (session && session.user) {
                    // Get user data including custom metadata
                    const userData = {
                        id: session.user.id,
                        email: session.user.email || '',
                        role: (session.user.user_metadata.role as 'ADMIN' | 'USER') || 'USER',
                        username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
                        first_name: session.user.user_metadata.first_name,
                        last_name: session.user.user_metadata.last_name,
                        contact_number: session.user.user_metadata.contact_number,
                        city: session.user.user_metadata.city,
                        pincode: session.user.user_metadata.pincode,
                        street_address: session.user.user_metadata.street_address,
                        created_at: session.user.created_at
                    };
                    
                    // Load organization data asynchronously (non-blocking)
                    // Set a timeout to prevent hanging on organization data fetch
                    Promise.race([
                        authAPI.getUserOrganizationData(session.user.id),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Organization data timeout')), 2000)
                        )
                    ])
                        .then((orgData: any) => {
                            if (orgData) {
                                // Update user data with organization info
                                setUser(prevUser => {
                                    if (prevUser && prevUser.id === session.user.id) {
                                        return {
                                            ...prevUser,
                                            organization_id: orgData.organization_id,
                                            role_in_org: orgData.role_in_org,
                                            is_org_admin: orgData.is_org_admin,
                                            joined_at: orgData.joined_at
                                        };
                                    }
                                    return prevUser;
                                });
                            }
                        })
                        .catch((error) => {
                            console.log('Organization data loading skipped or failed:', error.message);
                            // Continue without organization data - user can still use the app
                        });
                    
                    setUser(userData);
                    isInitialized = true;
                    
                    // Check if we should redirect after sign in
                    // Don't redirect during password reset flows or if already on auth pages
                    if (typeof window !== 'undefined' && event === 'SIGNED_IN') {
                        const pathname = window.location.pathname;
                        const search = window.location.search;

                        // Check for password reset mode in sessionStorage
                        const isPasswordResetMode = sessionStorage.getItem('passwordResetMode') === 'true';
                        const passwordResetTimestamp = sessionStorage.getItem('passwordResetTimestamp');
                        const isRecentPasswordReset = passwordResetTimestamp &&
                            (Date.now() - parseInt(passwordResetTimestamp)) < 300000; // 5 minutes

                        // Skip redirect if on auth pages or password reset flow
                        const isAuthPage = pathname === '/reset-password' || pathname === '/forgot-password' || pathname === '/login' || pathname === '/register';
                        const isPasswordReset = search.includes('type=recovery') || search.includes('access_token') || search.includes('mode=reset');

                        console.log('🔍 Auth redirect check:', {
                            pathname,
                            search,
                            isAuthPage,
                            isPasswordReset,
                            isPasswordResetMode,
                            passwordResetTimestamp,
                            isRecentPasswordReset,
                            timeSinceReset: passwordResetTimestamp ? (Date.now() - parseInt(passwordResetTimestamp)) / 1000 + 's' : 'N/A',
                            shouldSkip: isAuthPage || isPasswordReset || (isPasswordResetMode && isRecentPasswordReset)
                        });

                        if (isAuthPage || isPasswordReset || (isPasswordResetMode && isRecentPasswordReset)) {
                            console.log('Skipping redirect - auth page or password reset flow');
                            setIsLoading(false);
                            return;
                        }
                        
                        // Normal login redirect
                        const role = userData.role;
                        if (role === 'ADMIN') {
                            router.push('/admin/dashboard');
                        } else {
                            router.push('/customer/dashboard');
                        }
                    }
                } else {
                    setUser(null);
                    isInitialized = true;
                }
                setIsLoading(false);
            }
        );

        // Optimized initial session check - must complete within 3 seconds
        const initializeAuth = async () => {
            const startTime = performance.now();

            try {
                console.log('🔄 Initializing auth - checking session...');

                // Use optimized auth status check with retries and increased timeout
                const authResult = await authAPI.checkAuthStatus(2); // 2 retries

                if (authResult.error) {
                    // Handle different types of errors differently
                    if (authResult.error.includes('Invalid Refresh Token') ||
                        authResult.error.includes('Refresh Token Not Found') ||
                        authResult.error.includes('invalid_grant')) {
                        console.log('🔄 Invalid refresh token detected, clearing session...');
                        await clearInvalidSession();
                        isInitialized = true;
                        setLoadingStabilized(false);
                        return;
                    } else if (authResult.error.includes('timeout')) {
                        // Don't block the app due to timeout - proceed as unauthenticated
                        console.log('⏰ Auth check timeout, proceeding as unauthenticated');
                        setUser(null);
                        isInitialized = true;
                        setLoadingStabilized(false);
                        return;
                    }

                    console.log('⚠️ Auth error:', authResult.error);
                    setUser(null);
                    isInitialized = true;
                    setLoadingStabilized(false);
                    return;
                }

                if (authResult.isAuthenticated && authResult.session?.user) {
                    console.log('✅ Session found, loading user data...');

                    const userData = {
                        id: authResult.session.user.id,
                        email: authResult.session.user.email || '',
                        role: (authResult.session.user.user_metadata.role as 'ADMIN' | 'USER') || 'USER',
                        username: authResult.session.user.user_metadata.username || authResult.session.user.email?.split('@')[0] || '',
                        first_name: authResult.session.user.user_metadata.first_name,
                        last_name: authResult.session.user.user_metadata.last_name,
                        contact_number: authResult.session.user.user_metadata.contact_number,
                        city: authResult.session.user.user_metadata.city,
                        pincode: authResult.session.user.user_metadata.pincode,
                        street_address: authResult.session.user.user_metadata.street_address,
                        created_at: authResult.session.user.created_at
                    };

                    // Load organization data asynchronously (non-blocking)
                    // This will complete in background and update user data when ready
                    Promise.race([
                        authAPI.getUserOrganizationData(authResult.session.user.id),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Organization data timeout')), 2000)
                        )
                    ])
                        .then((orgData: any) => {
                            if (orgData) {
                                console.log('✅ Organization data loaded in background');
                                const updatedUserData = {
                                    ...userData,
                                    organization_id: orgData.organization_id,
                                    role_in_org: orgData.role_in_org,
                                    is_org_admin: orgData.is_org_admin,
                                    joined_at: orgData.joined_at
                                };
                                setUser(updatedUserData);
                            }
                        })
                        .catch((error) => {
                            console.log('⚠️ Organization data load failed or timed out:', error.message);
                            // Continue with user data without organization info
                        });

                    console.log('✅ User data loaded successfully');
                    setUser(userData);
                    isInitialized = true;
                } else {
                    console.log('ℹ️ No active session found');
                    setUser(null);
                    isInitialized = true;
                }

                const totalTime = performance.now() - startTime;
                console.log(`⚡ Auth initialization completed in ${totalTime.toFixed(2)}ms ${totalTime > 3000 ? '(SLOW!)' : '(FAST!)'}`);

            } catch (error: any) {
                setUser(null);
                isInitialized = true;
            } finally {
                setLoadingStabilized(false);
            }
        };
        
        initializeAuth();
        
        // Safety timeout to prevent indefinite loading (reduced since we have individual timeouts)
        const loadingTimeout = setTimeout(() => {
            console.warn('Auth loading timeout reached, resetting loading state');
            setLoadingStabilized(false);
        }, 3000); // 3 seconds timeout to match our performance requirement
        
        // Cleanup subscription and timeout
        return () => {
            subscription.unsubscribe();
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
        };
    }, []);

    // Method to force refresh auth state
    const refreshAuth = async () => {
        try {
            console.log('🔄 Refreshing auth state...');
            setLoadingStabilized(true);

            // Use optimized auth check with retries
            const authResult = await authAPI.checkAuthStatus(1); // 1 retry for refresh

            if (authResult.error) {
                // Handle different types of errors
                if (authResult.error.includes('Invalid Refresh Token') ||
                    authResult.error.includes('Refresh Token Not Found') ||
                    authResult.error.includes('invalid_grant')) {
                    console.log('🔄 Invalid refresh token during refresh, clearing session...');
                    await clearInvalidSession();
                    return;
                } else if (authResult.error.includes('timeout')) {
                    console.log('⏰ Auth refresh timeout');
                    setIsLoading(false);
                    return;
                }

                console.log('⚠️ Auth refresh error:', authResult.error);
                setUser(null);
                return;
            }

            if (authResult.isAuthenticated && authResult.session?.user) {
                console.log('✅ Session found during refresh');
                const userData = {
                    id: authResult.session.user.id,
                    email: authResult.session.user.email || '',
                    role: (authResult.session.user.user_metadata.role as 'ADMIN' | 'USER') || 'USER',
                    username: authResult.session.user.user_metadata.username || authResult.session.user.email?.split('@')[0] || '',
                    first_name: authResult.session.user.user_metadata.first_name,
                    last_name: authResult.session.user.user_metadata.last_name,
                    contact_number: authResult.session.user.user_metadata.contact_number,
                    city: authResult.session.user.user_metadata.city,
                    pincode: authResult.session.user.user_metadata.pincode,
                    street_address: authResult.session.user.user_metadata.street_address,
                    created_at: authResult.session.user.created_at
                };

                // Load organization data asynchronously using cache
                authAPI.getUserOrganizationData(authResult.session.user.id)
                    .then((orgData) => {
                        if (orgData) {
                            const updatedUserData = {
                                ...userData,
                                organization_id: orgData.organization_id,
                                role_in_org: orgData.role_in_org,
                                is_org_admin: orgData.is_org_admin,
                                joined_at: orgData.joined_at
                            };
                            setUser(updatedUserData);
                        }
                    })
                    .catch((error) => {
                        console.log('Organization data load failed during refresh:', error.message);
                        // Still set user data without organization info
                        setUser(userData);
                    });

                // Set user data immediately, organization data will be added asynchronously
                setUser(userData);
            } else {
                console.log('ℹ️ No session found during refresh');
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setLoadingStabilized(true);
            console.log('🔄 Starting login process for:', email);

            // First check if there's already an active session
            try {
                const { data: { session: existingSession }, error: sessionCheckError } = await supabase.auth.getSession();

                if (sessionCheckError) {
                    // If it's a refresh token error, clear the invalid session
                    if (sessionCheckError.message?.includes('Invalid Refresh Token') ||
                        sessionCheckError.message?.includes('Refresh Token Not Found') ||
                        sessionCheckError.message?.includes('invalid_grant')) {
                        console.log('🔄 Clearing invalid session before login...');
                        await clearInvalidSession();
                    }
                } else if (existingSession && existingSession.user) {
                    console.log('✅ Existing session found - refreshing auth state');
                    await refreshAuth();
                    return true;
                }
            } catch (sessionError: any) {
                // If it's a refresh token error, clear the invalid session
                if (sessionError?.message?.includes('Invalid Refresh Token') ||
                    sessionError?.message?.includes('Refresh Token Not Found') ||
                    sessionError?.message?.includes('invalid_grant')) {
                    console.log('🔄 Clearing invalid session before login...');
                    await clearInvalidSession();
                }
            }

            // Call login API with new result-based approach
            console.log('🔄 Calling authAPI.login...');
            const loginResult = await authAPI.login(email, password);
            console.log('🔍 Login API result:', loginResult);

            if (!loginResult.success) {
                console.log('❌ Login API returned error:', loginResult.error);
                // For invalid credentials, throw a specific error that the UI can catch
                if (loginResult.error?.includes('Invalid login credentials') || 
                    loginResult.error?.includes('invalid_credentials') ||
                    loginResult.error?.includes('Invalid email or password')) {
                    throw new Error('Invalid email or password. Please check your credentials and try again.');
                } else {
                    // Throw the specific error for other types of failures
                    throw new Error(loginResult.error || 'Login failed');
                }
            }

            if (!loginResult.data?.user) {
                throw new Error('No user data received');
            }

            const data = loginResult.data;

            console.log('✅ Supabase authentication successful');
            
            // Get user role from metadata
            const role = data.user.user_metadata.role as 'ADMIN' | 'USER' || 'USER';
            
            // Load organization data using optimized cached method
            const userData = {
                id: data.user.id,
                email: data.user.email || '',
                role: role,
                username: data.user.user_metadata.username || data.user.email?.split('@')[0] || '',
                first_name: data.user.user_metadata.first_name,
                last_name: data.user.user_metadata.last_name,
                contact_number: data.user.user_metadata.contact_number,
                city: data.user.user_metadata.city,
                pincode: data.user.user_metadata.pincode,
                street_address: data.user.user_metadata.street_address,
                created_at: data.user.created_at
            };

            // Load organization data asynchronously (non-blocking)
            authAPI.getUserOrganizationData(data.user.id)
                .then((orgData) => {
                    if (orgData) {
                        console.log('✅ Organization data loaded after login');
                        const updatedUserData = {
                            ...userData,
                            organization_id: orgData.organization_id,
                            role_in_org: orgData.role_in_org,
                            is_org_admin: orgData.is_org_admin,
                            joined_at: orgData.joined_at
                        };
                        setUser(updatedUserData);
                    }
                })
                .catch((error) => {
                    console.log('⚠️ Organization data load failed after login:', error.message);
                    // Continue with user data without organization info
                    setUser(userData);
                });

            // Set user data immediately
            setUser(userData);
            
            // Set loading to false before redirect
            setLoadingStabilized(false);
            
            // Don't auto-redirect if user is on password reset page
            if (typeof window !== 'undefined' && window.location.pathname === '/reset-password') {
                return true;
            }
            
            // Redirect based on role and organization
            if (role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/customer/dashboard');
            }
            
            return true;
        } catch (error) {
            setLoadingStabilized(false);
            console.log('❌ Login function throwing error:', error);
            throw error; // Re-throw to allow the login page to handle it
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);

            // Clear all auth-related storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token');
                sessionStorage.removeItem('passwordResetMode');
            }

            router.push('/login');
        } catch (error) {
            // Logout error - silently handle
        }
    };

    // Utility function to clear invalid sessions
    const clearInvalidSession = async () => {
        console.log('🔄 Clearing invalid session...');

        try {
            setLoadingStabilized(true);
            setUser(null);

            // Clear Supabase session
            await supabase.auth.signOut();

            // Clear all auth-related storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token');
                sessionStorage.removeItem('passwordResetMode');
                // Clear any other Supabase-related localStorage items
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('supabase.auth.')) {
                        localStorage.removeItem(key);
                    }
                });
            }

            console.log('✅ Invalid session cleared');
        } catch (error) {
            // Error clearing invalid session - silently handle
        } finally {
            setLoadingStabilized(false);
        }
    };

    const register = async (userData: { 
        email: string, 
        password: string, 
        username?: string,
        firstName?: string,
        lastName?: string,
        contactNumber?: string,
        city?: string,
        pincode?: string,
        streetAddress?: string,
        role?: string,
        isAdminRequest?: boolean
    }) => {
        try {
            setLoadingStabilized(true);
            
            // Register the user with Supabase
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
            
            if (error) {
                throw error;
            }
            
            // If registration is successful and we have a user
            if (data.user) {
                // If this is an admin request, create the request in the database
                if (userData.isAdminRequest) {
                    try {
                        const { error: requestError } = await supabase.rpc('create_admin_request', {
                            p_user_id: data.user.id,
                            p_email: userData.email,
                            p_reason: 'Admin access requested during registration',
                            p_first_name: userData.firstName || '',
                            p_last_name: userData.lastName || '',
                            p_contact_number: userData.contactNumber || '',
                            p_organization: '',
                            p_experience_level: 'INTERMEDIATE',
                            p_intended_use: 'Event management and administration'
                        });
                        
                        if (requestError) {
                            console.error('Error creating admin request:', requestError);
                            // Continue anyway as the user is registered
                        }
                    } catch (requestError) {
                        console.error('Error creating admin request:', requestError);
                        // Continue anyway as the user is registered
                    }
                    
                    // Don't sign in automatically for admin requests
                    // User will need to wait for approval
                    return true;
                } else {
                    // Regular user registration - sign in immediately
                    try {
                        // Sign in the user immediately after registration
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: userData.email,
                            password: userData.password
                        });
                        
                        if (signInError) {
                            throw signInError;
                        }
                        
                        // Determine where to redirect based on role
                        const role = userData.role || 'USER';
                        
                        if (role === 'ADMIN') {
                            router.push('/admin/dashboard');
                        } else {
                            router.push('/customer/dashboard');
                        }
                    } catch (signInError) {
                        console.error('Error signing in after registration:', signInError);
                        router.push('/login');
                    }
                }
            }
            
            return true;
        } catch (error) {
            // Registration error - silently handle
            return false;
        } finally {
            setLoadingStabilized(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, refreshAuth, clearInvalidSession, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Custom hook to force refresh auth state when inconsistencies are detected
export const useAuthRefresh = () => {
    const { refreshAuth } = useAuth();

    return {
        forceRefreshAuth: async () => {
            console.log('🔄 Force refreshing auth state due to detected inconsistency...');
            await refreshAuth();
        }
    };
};