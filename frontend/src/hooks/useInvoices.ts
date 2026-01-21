'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { OrganizationContext } from '@/contexts/OrganizationContext';

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
  const context = useContext(OrganizationContext);
  const organization = context?.organization;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organization.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (planName: string, amount: number) => {
    if (!organization?.id) throw new Error('No organization context');

    try {
      const invoice_number = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const issue_date = new Date().toISOString().split('T')[0];
      const due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          organization_id: organization.id,
          invoice_number,
          amount,
          currency: 'USD',
          status: 'PENDING',
          plan_name: planName,
          issue_date,
          due_date,
          billing_period_start: issue_date,
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      setInvoices(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error generating invoice:', err);
      throw err;
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string, paymentMethod?: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'PAID',
          paid_date: new Date().toISOString(),
          payment_method: paymentMethod || 'Credit Card'
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? data : inv));
      return data;
    } catch (err: any) {
      console.error('Error marking invoice as paid:', err);
      throw err;
    }
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
