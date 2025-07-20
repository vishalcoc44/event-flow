'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'

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
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()

    useEffect(() => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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
                    setUser(userData);
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        // Initial session check
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
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
                setUser(userData);
            }
            setIsLoading(false);
        };
        
        initializeAuth();
        
        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            
            // Call login API
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            if (!data.user) {
                throw new Error('No user data received');
            }
            
            // Get user role from metadata
            const role = data.user.user_metadata.role as 'ADMIN' | 'USER' || 'USER';
            
            // Redirect based on role
            if (role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/customer/dashboard');
            }
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
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
            setIsLoading(true);
            
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
            console.error('Registration error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
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