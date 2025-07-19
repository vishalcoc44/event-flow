'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Customer = {
    id: string
    email: string
    username?: string
    first_name?: string
    last_name?: string
    contact_number?: string
    city?: string
    pincode?: string
    street_address?: string
    role: string
    created_at?: string
}

type CustomerContextType = {
    customers: Customer[]
    loading: boolean
    error: string | null
    fetchCustomers: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Fetch all users from the users table
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'USER') // Only get customers (not admins)
            
            if (error) throw error
            
            setCustomers(data || [])
        } catch (err: any) {
            console.error('Error fetching customers:', err)
            setError(err.message || 'Failed to fetch customers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    return (
        <CustomerContext.Provider value={{ 
            customers, 
            loading, 
            error, 
            fetchCustomers 
        }}>
            {children}
        </CustomerContext.Provider>
    )
}

export const useCustomers = () => {
    const context = useContext(CustomerContext)
    if (context === undefined) {
        throw new Error('useCustomers must be used within a CustomerProvider')
    }
    return context
}

