'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  issue_date: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
}

export function useInvoices() {
  const { organization } = useOrganization();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      
      // For now, we'll create mock invoice data based on organization subscription
      // In a real implementation, you'd have an invoices table
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          amount: organization.subscription_plan === 'BASIC' ? 19.99 : 
                 organization.subscription_plan === 'PRO' ? 49.99 : 
                 organization.subscription_plan === 'ENTERPRISE' ? 99.99 : 0,
          currency: 'USD',
          status: 'PAID',
          issue_date: '2024-04-01',
          due_date: '2024-04-01',
          paid_date: '2024-04-01',
          payment_method: 'Credit Card **** 4242',
          plan_name: organization.subscription_plan,
          billing_period_start: '2024-04-01',
          billing_period_end: '2024-05-01',
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          amount: organization.subscription_plan === 'BASIC' ? 19.99 : 
                 organization.subscription_plan === 'PRO' ? 49.99 : 
                 organization.subscription_plan === 'ENTERPRISE' ? 99.99 : 0,
          currency: 'USD',
          status: 'PAID',
          issue_date: '2024-03-01',
          due_date: '2024-03-01',
          paid_date: '2024-03-01',
          payment_method: 'Credit Card **** 4242',
          plan_name: organization.subscription_plan,
          billing_period_start: '2024-03-01',
          billing_period_end: '2024-04-01',
        },
      ];

      setInvoices(mockInvoices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (planName: string, amount: number) => {
    if (!organization) throw new Error('No organization context');

    // In a real implementation, this would create an actual invoice record
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      amount,
      currency: 'USD',
      status: 'PENDING',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      plan_name: planName,
      billing_period_start: new Date().toISOString().split('T')[0],
      billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const markInvoiceAsPaid = async (invoiceId: string, paymentMethod?: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? {
            ...invoice,
            status: 'PAID' as const,
            paid_date: new Date().toISOString().split('T')[0],
            payment_method: paymentMethod || 'Credit Card',
          }
        : invoice
    ));
  };

  useEffect(() => {
    fetchInvoices();
  }, [organization]);

  return {
    invoices,
    loading,
    error,
    generateInvoice,
    markInvoiceAsPaid,
    refetch: fetchInvoices,
  };
}
