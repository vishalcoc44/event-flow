"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useInvoices } from "@/hooks/useInvoices";
import { useOrganization } from "@/contexts/OrganizationContext";
import dynamic from "next/dynamic";
const CashfreeButton = dynamic(() => import("./CashfreeButton"), { ssr: false });

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

  const formatPrice = (monthly: number, yearly: number) => {
    if (monthly === 0) return "Free";
    return `$${monthly}/mo`;
  };

  const getNextBillingDate = () => {
    if (!organization.subscription_start_date) return "N/A";
    const startDate = new Date(organization.subscription_start_date);
    const nextDate = new Date(startDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Subscription & Usage</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Current Subscription Card */}
          <HoverShadowEffect 
            className="border rounded-lg p-6 flex flex-col" 
            shadowColor="rgba(0,0,0,0.08)" 
            shadowIntensity={0.12} 
            hoverScale={1.02} 
            hoverLift={-1} 
            transitionDuration={150}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Plan 
                <Badge variant="default">{currentPlan?.display_name || organization.subscription_plan}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">
                {currentPlan ? formatPrice(currentPlan.price_monthly, currentPlan.price_yearly) : "Loading..."}
              </div>
              <div className="text-gray-600 mb-4">
                Billed monthly. Next payment: {getNextBillingDate()}
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-500">Status:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={organization.subscription_status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {organization.subscription_status}
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setShowUpgrade(true)} 
                className="w-full mt-2"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Change Plan"}
              </Button>
            </CardContent>
          </HoverShadowEffect>

          {/* Usage Dashboard */}
          <HoverShadowEffect 
            className="border rounded-lg p-6 flex flex-col" 
            shadowColor="rgba(0,0,0,0.08)" 
            shadowIntensity={0.12} 
            hoverScale={1.02} 
            hoverLift={-1} 
            transitionDuration={150}
          >
            <CardHeader>
              <CardTitle>Usage Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              {usage ? (
                <div className="flex flex-col gap-6">
                  {/* Usage Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Events</span>
                        <span>{usage.current_events_count} / {usage.max_events}</span>
                      </div>
                      <Progress value={usagePercentages.events} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Users</span>
                        <span>{usage.current_users_count} / {usage.max_users}</span>
                      </div>
                      <Progress value={usagePercentages.users} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Storage</span>
                        <span>{usage.current_storage_mb}MB / {usage.max_storage_mb}MB</span>
                      </div>
                      <Progress value={usagePercentages.storage} className="h-2" />
                    </div>
                  </div>

                  {/* Usage Alerts */}
                  {usageAlerts.length > 0 && (
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                      {usageAlerts.map((alert, idx) => <div key={idx}>{alert}</div>)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Loading usage data...</div>
              )}
            </CardContent>
          </HoverShadowEffect>
        </div>

        {/* Plan Change Modal */}
        {showUpgrade && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {plans.map((plan) => (
                  <HoverShadowEffect 
                    key={plan.id} 
                    className={`border rounded-lg p-6 cursor-pointer ${
                      plan.name === currentPlan?.name 
                        ? "border-primary ring-2 ring-primary bg-blue-50" 
                        : "border-gray-200 hover:border-primary"
                    }`} 
                    shadowColor="rgba(0,0,0,0.08)" 
                    shadowIntensity={0.12} 
                    hoverScale={1.02} 
                    hoverLift={-2} 
                    transitionDuration={150}
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-lg font-semibold">{plan.display_name}</div>
                        <div className="text-sm text-gray-600 mb-2">{plan.description}</div>
                        <div className="text-xl font-bold text-primary mb-4">
                          {formatPrice(plan.price_monthly, plan.price_yearly)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div>• {plan.max_events} events</div>
                        <div>• {plan.max_users} users</div>
                        <div>• {plan.max_storage_mb}MB storage</div>
                        {plan.features && typeof plan.features === 'object' && 
                          Object.entries(plan.features).map(([key, value]) => (
                            <div key={key}>• {String(value)}</div>
                          ))
                        }
                      </div>

                      {plan.price_monthly > 0 && (
                        <CashfreeButton 
                          amount={Math.round(plan.price_monthly * 100)} // Convert to cents/paise
                          currency="USD" 
                          customer={{ 
                            customer_id: organization.id, 
                            customer_email: organization.contact_email || "admin@organization.com", 
                            customer_phone: organization.contact_phone || "0000000000" 
                          }}
                          onSuccess={() => handlePlanChange(plan.name)}
                        />
                      )}
                      
                      <Button 
                        size="sm" 
                        className="mt-2" 
                        variant={plan.name === currentPlan?.name ? "outline" : "default"} 
                        disabled={plan.name === currentPlan?.name || isUpdating}
                        onClick={() => handlePlanChange(plan.name)}
                      >
                        {plan.name === currentPlan?.name ? "Current Plan" : "Select Plan"}
                      </Button>
                    </div>
                  </HoverShadowEffect>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowUpgrade(false)} className="w-full">
                Cancel
              </Button>
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
              {invoicesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading invoices...</div>
              ) : invoiceData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No invoices found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left text-gray-700">Invoice #</th>
                        <th className="p-3 text-left text-gray-700">Date</th>
                        <th className="p-3 text-left text-gray-700">Amount</th>
                        <th className="p-3 text-left text-gray-700">Plan</th>
                        <th className="p-3 text-left text-gray-700">Status</th>
                        <th className="p-3 text-left text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{invoice.invoice_number}</td>
                          <td className="p-3">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                          <td className="p-3">${invoice.amount.toFixed(2)}</td>
                          <td className="p-3">{invoice.plan_name}</td>
                          <td className="p-3">
                            <Badge variant={
                              invoice.status === "PAID" ? "default" : 
                              invoice.status === "PENDING" ? "secondary" : 
                              "destructive"
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
