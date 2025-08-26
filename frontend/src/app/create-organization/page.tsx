"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/gradient-button";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    name: "Free",
    value: "FREE",
    description: "Basic features for small teams and testing.",
    price: "$0/mo",
    features: ["Up to 10 events", "Up to 5 users", "100MB storage"]
  },
  {
    name: "Basic",
    value: "BASIC",
    description: "For growing organizations.",
    price: "$19.99/mo",
    features: ["Up to 50 events", "Up to 20 users", "500MB storage", "Custom branding"]
  },
  {
    name: "Pro",
    value: "PRO",
    description: "Advanced features for professionals.",
    price: "$49.99/mo",
    features: ["Up to 200 events", "Up to 100 users", "2GB storage", "Advanced analytics"]
  },
  {
    name: "Enterprise",
    value: "ENTERPRISE",
    description: "For large organizations with custom needs.",
    price: "Contact us",
    features: ["1000+ events", "500+ users", "10GB+ storage", "Dedicated support"]
  }
];

export default function CreateOrganizationPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    plan: "FREE"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (plan: string) => {
    setForm({ ...form, plan });
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!form.name || !form.slug) {
        setError("Organization name and slug are required.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to create an organization');
      }

      // Validate required fields
      if (!form.name || !form.slug) {
        throw new Error('Name and slug are required');
      }

      // Create organization using the database function
      const { data, error } = await supabase.rpc('create_organization', {
        p_name: form.name,
        p_slug: form.slug,
        p_created_by: user.id,
        p_description: form.description || '',
        p_subscription_plan: form.plan || 'FREE'
      });

      if (error) {
        console.error('Error creating organization:', error);
        throw new Error(error.message);
      }

      // Update user to be part of this organization
      const { error: updateError } = await supabase
        .from('users')
        .update({
          organization_id: data,
          role_in_org: 'OWNER',
          is_org_admin: true,
          joined_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user organization:', updateError);
        throw new Error('Organization created but user update failed');
      }

      // Success - redirect to organization dashboard
      setSuccess(true);
      
      // Redirect to organization dashboard after successful creation
      setTimeout(() => {
        router.push("/organization/dashboard");
      }, 1200);
    } catch (err) {
      console.error('Organization creation error:', err);
      setError(err instanceof Error ? err.message : "Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create a New Organization</h1>
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Organization Details"}
                {step === 2 && "Select a Plan"}
                {step === 3 && "Confirmation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-center">{error}</div>
              )}
              {success ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎉</div>
                  <div className="text-xl font-semibold mb-2">Organization Created!</div>
                  <div className="text-gray-600 mb-4">Redirecting to your dashboard...</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Organization Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Organization Slug *</Label>
                        <Input
                          id="slug"
                          name="slug"
                          value={form.slug}
                          onChange={handleChange}
                          placeholder="e.g. acme-events"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be used in your organization's URL.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Describe your organization (optional)"
                        />
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {plans.map((plan) => (
                        <div
                          key={plan.value}
                          role="button"
                          tabIndex={0}
                          className="p-0 bg-transparent border-none text-left"
                          onClick={() => handlePlanSelect(plan.value)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePlanSelect(plan.value) }}
                          style={{ cursor: "pointer" }}
                        >
                          <HoverShadowEffect
                            className={`cursor-pointer border rounded-lg p-4 transition-all ${form.plan === plan.value ? "border-primary ring-2 ring-primary" : "border-gray-200"}`}
                            shadowColor="rgba(0,0,0,0.08)"
                            shadowIntensity={0.12}
                            hoverScale={1.02}
                            hoverLift={-1}
                            transitionDuration={150}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold">{plan.name}</div>
                                <div className="text-primary font-bold">{plan.price}</div>
                              </div>
                              <div className="text-gray-600 text-sm mb-2">{plan.description}</div>
                              <ul className="text-xs text-gray-500 list-disc pl-5 mb-2">
                                {plan.features.map((f) => (
                                  <li key={f}>{f}</li>
                                ))}
                              </ul>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant={form.plan === plan.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePlanSelect(plan.value)}
                                >
                                  {form.plan === plan.value ? "Selected" : "Choose"}
                                </Button>
                              </div>
                            </div>
                          </HoverShadowEffect>
                        </div>
                      ))}
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-6 text-center">
                      <div className="text-lg font-semibold">Review your details</div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-medium">Name:</span> {form.name}
                        </div>
                        <div>
                          <span className="font-medium">Slug:</span> {form.slug}
                        </div>
                        <div>
                          <span className="font-medium">Plan:</span> {plans.find((p) => p.value === form.plan)?.name}
                        </div>
                        {form.description && (
                          <div>
                            <span className="font-medium">Description:</span> {form.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8">
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                        Back
                      </Button>
                    )}
                    <div className="flex-1" />
                    {step < 3 && (
                      <Button type="button" onClick={handleNext} disabled={loading}>
                        Next
                      </Button>
                    )}
                    {step === 3 && (
                      <Button type="submit" className="px-8" disabled={loading}>
                        {loading ? "Creating..." : "Create Organization"}
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-xs text-gray-400 mx-auto">
                Already have an organization?{' '}
                <a href="/organization/dashboard" className="text-primary underline">
                  Go to Dashboard
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
} 