"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useInvoices } from "@/hooks/useInvoices";
import { useOrganization } from "@/contexts/OrganizationContext";
import dynamic from "next/dynamic";
const CashfreeButton = dynamic(() => import("./CashfreeButton"), { ssr: false });

const invoices = [
  { id: "INV-001", date: "2024-04-01", amount: "$19.99", status: "Paid" },
  { id: "INV-002", date: "2024-03-01", amount: "$19.99", status: "Paid" },
  { id: "INV-003", date: "2024-02-01", amount: "$19.99", status: "Paid" },
];

export default function OrganizationSubscriptionPage() {
  const { organization } = useOrganization();
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
    generateInvoice,
    markInvoiceAsPaid 
  } = useInvoices();

  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Show loading state
  if (subscriptionLoading || !organization) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Subscription & Usage</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Loading subscription data...</div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (subscriptionError) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Subscription & Usage</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-600">Error loading subscription: {subscriptionError}</div>
          </div>
        </main>
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

      // Generate invoice for the new plan
      await generateInvoice(newPlan.name, newPlan.price_monthly);
      
      // Update subscription plan
      await updateSubscriptionPlan(newPlanName);
      
      toast({
        title: "Plan Updated",
        description: `Successfully upgraded to ${newPlan.display_name} plan.`,
      });
      
      setShowUpgrade(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Subscription & Usage</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Subscription Card */}
          <HoverShadowEffect className="border rounded-lg p-6 flex flex-col" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.12} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Current Plan <Badge variant="default">{plans.find(p => p.value === currentPlan)?.name}</Badge></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{plans.find(p => p.value === currentPlan)?.price}</div>
              <div className="text-gray-600 mb-4">Billed {billingCycle.toLowerCase()}. Next payment: 2024-05-01</div>
              <div className="mb-4">
                <span className="text-sm text-gray-500">Payment Method:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium">{paymentMethod}</span>
                  <Button size="sm" variant="outline">Change</Button>
                </div>
              </div>
              <Button onClick={() => setShowUpgrade(true)} className="w-full mt-2">Upgrade / Downgrade</Button>
            </CardContent>
          </HoverShadowEffect>

          {/* Usage Dashboard */}
          <HoverShadowEffect className="border rounded-lg p-6 flex flex-col" shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.12} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
            <CardHeader>
              <CardTitle>Usage Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-6">
                  <div>
                    <div className="text-xs text-gray-500">Events</div>
                    <div className="font-bold text-lg">{usage.events} / {usageLimits.events}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Users</div>
                    <div className="font-bold text-lg">{usage.users} / {usageLimits.users}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Storage</div>
                    <div className="font-bold text-lg">{usage.storage}MB / {usageLimits.storage}MB</div>
                  </div>
                </div>
                {usageAlerts.length > 0 && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                    {usageAlerts.map((alert, idx) => <div key={idx}>{alert}</div>)}
                  </div>
                )}
                {/* Placeholder for usage history chart */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1">Usage History (Chart Placeholder)</div>
                  <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">[Chart]</div>
                </div>
              </div>
            </CardContent>
          </HoverShadowEffect>
        </div>

        {/* Upgrade/Downgrade Modal (placeholder) */}
        {showUpgrade && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Change Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {plans.map((plan) => (
                  <HoverShadowEffect key={plan.value} className={`border rounded-lg p-4 cursor-pointer ${plan.value === currentPlan ? "border-primary ring-2 ring-primary" : "border-gray-200"}`} shadowColor="rgba(0,0,0,0.08)" shadowIntensity={0.12} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-semibold">{plan.name}</div>
                      <div className="text-primary font-bold">{plan.price}</div>
                      {/* Pass real amount/currency/customer here */}
                      <CashfreeButton amount={1999} currency="INR" customer={{ customer_id: "user_123", customer_email: "test@example.com", customer_phone: "9999999999" }} />
                      <Button size="sm" className="mt-2" variant={plan.value === currentPlan ? "outline" : "default"} disabled={plan.value === currentPlan} onClick={() => { setCurrentPlan(plan.value); setShowUpgrade(false); }}> {plan.value === currentPlan ? "Current" : "Select"} </Button>
                    </div>
                  </HoverShadowEffect>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowUpgrade(false)} className="w-full">Cancel</Button>
            </div>
          </div>
        )}

        {/* Invoice History */}
        <div className="mt-12">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-gray-700">Invoice #</th>
                      <th className="p-3 text-left text-gray-700">Date</th>
                      <th className="p-3 text-left text-gray-700">Amount</th>
                      <th className="p-3 text-left text-gray-700">Status</th>
                      <th className="p-3 text-left text-gray-700">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b">
                        <td className="p-3">{inv.id}</td>
                        <td className="p-3">{inv.date}</td>
                        <td className="p-3">{inv.amount}</td>
                        <td className="p-3"><Badge variant={inv.status === "Paid" ? "default" : "destructive"}>{inv.status}</Badge></td>
                        <td className="p-3"><Button size="sm" variant="outline">Download</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 