'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronRight,
  Sparkles,
  Layers,
  History,
  Calendar,
  ArrowUpRight,
  XCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useInvoices } from "@/hooks/useInvoices";
import { useOrganizationData } from "@/hooks/useOrganizationData";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlassTile } from "@/components/ui/glass-tile";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const CashfreeButton = dynamic(() => import("./CashfreeButton"), { ssr: false });

export default function OrganizationSubscriptionPage() {
  const { organization, orgLoading } = useOrganizationData();
  const { user } = useAuth();
  const {
    plans,
    currentPlan,
    usage,
    loading: subscriptionLoading,
    error: subscriptionError,
    updateSubscriptionPlan,
    getUsagePercentages,
    getUsageAlerts
  } = useSubscription();

  const {
    invoices: invoiceData,
    loading: invoicesLoading,
    generateInvoice
  } = useInvoices();

  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (orgLoading || subscriptionLoading || !organization) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-32 px-4 animate-pulse">
        <div className="container mx-auto max-w-6xl">
          <div className="h-16 bg-white/5 rounded-3xl w-1/3 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="h-64 bg-white/5 rounded-3xl" />
            <div className="h-64 bg-white/5 rounded-3xl" />
          </div>
          <div className="h-[400px] bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  const usagePercentages = getUsagePercentages();
  const usageAlerts = getUsageAlerts();

  const handlePlanChange = async (newPlanName: string) => {
    if (!currentPlan || newPlanName === currentPlan.name) return;
    setIsUpdating(true);
    try {
      const newPlan = plans.find(p => p.name === newPlanName);
      if (!newPlan) throw new Error('Plan not found');
      await generateInvoice(newPlan.name, newPlan.price_monthly);
      await updateSubscriptionPlan(newPlanName);
      toast({ title: "Module Synchronized", description: `Matrix power scaled to ${newPlan.display_name}.` });
      setShowUpgrade(false);
    } catch (error: any) {
      toast({ title: "Sync Failure", description: error.message, variant: "destructive" });
    } finally { setIsUpdating(false); }
  };

  const getNextBillingDate = () => {
    if (!organization.subscription_start_date) return "N/A";
    const nextDate = new Date(organization.subscription_start_date);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

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
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Resource Matrix</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
              Matrix Power.
            </h1>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
              Subscription Protocols / {organization.name}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Current Plan Card */}
            <div className="lg:col-span-5">
              <GlassTile className="p-10 h-full flex flex-col relative overflow-hidden group" interactive={false}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-32 h-32" />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-8">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Current Tier</h3>
                    <Badge className="bg-blue-500 text-white font-black tracking-widest text-[10px] uppercase h-6 px-3 rounded-lg border-0">
                      {currentPlan?.display_name || organization.subscription_plan}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-10">
                    <div className="text-5xl font-black tracking-tighter">
                      {currentPlan?.price_monthly === 0 ? "Void" : `$${currentPlan?.price_monthly}`}
                      <span className="text-lg text-neutral-500 font-bold uppercase tracking-widest ml-1">/ mo</span>
                    </div>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                      Next cycle initialization: {getNextBillingDate()}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", organization.subscription_status === 'ACTIVE' ? "bg-green-500" : "bg-red-500")} />
                      <span className="text-sm font-black uppercase tracking-widest">System Status: {organization.subscription_status}</span>
                    </div>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                      Your organization is currently synchronized with the <span className="text-foreground font-bold">{currentPlan?.display_name}</span> protocols. Scaling is available at any time.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowUpgrade(true)}
                  className="h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all border-0 shadow-2xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Adjust Power Grid
                </Button>
              </GlassTile>
            </div>

            {/* Usage Dashboard */}
            <div className="lg:col-span-7">
              <GlassTile className="p-10 h-full" interactive={false}>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Operational Usage</h3>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Event Registry</span>
                        <span className="text-xl font-black tracking-tighter">{usage?.current_events_count} / {usage?.max_events}</span>
                      </div>
                      <span className="text-xs font-bold font-mono">{usagePercentages.events}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercentages.events}%` }}
                        className={cn("h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]")}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Operative Capacity</span>
                        <span className="text-xl font-black tracking-tighter">{usage?.current_users_count} / {usage?.max_users}</span>
                      </div>
                      <span className="text-xs font-bold font-mono">{usagePercentages.users}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercentages.users}%` }}
                        className={cn("h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]")}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Data Storage Flow</span>
                        <span className="text-xl font-black tracking-tighter">{usage?.current_storage_mb}MB / {usage?.max_storage_mb}MB</span>
                      </div>
                      <span className="text-xs font-bold font-mono">{usagePercentages.storage}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercentages.storage}%` }}
                        className={cn("h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]")}
                      />
                    </div>
                  </div>

                  {usageAlerts.length > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Matrix Alert: {usageAlerts[0]} Consider scaling up.
                      </p>
                    </div>
                  )}
                </div>
              </GlassTile>
            </div>
          </div>

          {/* Invoice History */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-blue-500" />
              <h3 className="text-2xl font-black tracking-tighter uppercase">Transaction Logs</h3>
            </div>

            <GlassTile className="overflow-hidden" interactive={false}>
              {invoicesLoading ? (
                <div className="p-20 text-center animate-pulse text-neutral-400 font-bold uppercase tracking-widest text-xs">Accessing Ledgers...</div>
              ) : invoiceData.length === 0 ? (
                <div className="p-20 text-center text-neutral-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">No transaction history found in the matrix.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Ledger ID</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Cycle Date</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Extraction</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Tier</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoiceData.map((invoice) => (
                        <tr key={invoice.id} className="group hover:bg-white/5 transition-colors">
                          <td className="p-6 font-mono text-xs">{invoice.invoice_number}</td>
                          <td className="p-6 text-xs font-bold">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                          <td className="p-6 text-lg font-black tracking-tighter">${invoice.amount.toFixed(2)}</td>
                          <td className="p-6">
                            <Badge className="bg-neutral-100 dark:bg-white/5 text-neutral-500 font-black uppercase text-[8px] h-5 rounded-md border-0">
                              {invoice.plan_name}
                            </Badge>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1.5 h-1.5 rounded-full", invoice.status === 'PAID' ? "bg-green-500" : "bg-yellow-500")} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{invoice.status}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassTile>
          </div>
        </div>
      </main>

      {/* Plan Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgrade(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <GlassTile className="p-12" interactive={false}>
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Power Scaling.</h2>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Select Resource Protocol for Your Syndicate</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowUpgrade(false)} className="h-14 w-14 rounded-2xl hover:bg-white/10">
                    <XCircle className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <GlassTile
                      key={plan.id}
                      onClick={() => handlePlanChange(plan.name)}
                      className={cn(
                        "p-8 flex flex-col group",
                        plan.name === currentPlan?.name ? "border-blue-500/50 bg-blue-500/5 shadow-2xl shadow-blue-500/20" : "hover:border-white/40"
                      )}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-black tracking-tighter uppercase">{plan.display_name}</h3>
                          {plan.name === currentPlan?.name && <Badge className="bg-blue-500 text-white font-black text-[8px] h-4 rounded-full border-0">ACTIVE</Badge>}
                        </div>
                        <div className="text-3xl font-black tracking-tighter mb-4">
                          {plan.price_monthly === 0 ? "FREE" : `$${plan.price_monthly}`}
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">/ mo</span>
                        </div>
                        <p className="text-neutral-500 text-xs font-medium mb-8 leading-relaxed line-clamp-2">{plan.description}</p>

                        <div className="space-y-3 mb-10">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-neutral-400">Events</span>
                            <span>{plan.max_events}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-neutral-400">Users</span>
                            <span>{plan.max_users}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-neutral-400">Storage</span>
                            <span>{plan.max_storage_mb}MB</span>
                          </div>
                        </div>
                      </div>

                      {plan.price_monthly > 0 && (
                        <div className="mb-4">
                          <CashfreeButton
                            amount={Math.round(plan.price_monthly * 100)}
                            currency="USD"
                            customer={{
                              customer_id: organization.id,
                              customer_email: organization.contact_email || "operative@syndicate.io",
                              customer_phone: organization.contact_phone || "0000000000"
                            }}
                            onSuccess={() => handlePlanChange(plan.name)}
                          />
                        </div>
                      )}

                      <Button
                        disabled={plan.name === currentPlan?.name || isUpdating}
                        className={cn(
                          "w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-0",
                          plan.name === currentPlan?.name ? "bg-neutral-100 dark:bg-white/10 text-neutral-400" : "bg-blue-600 text-white"
                        )}
                      >
                        {plan.name === currentPlan?.name ? "Synced" : isUpdating ? "Scaling..." : "Commit Tier"}
                      </Button>
                    </GlassTile>
                  ))}
                </div>
              </GlassTile>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
