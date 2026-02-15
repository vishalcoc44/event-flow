"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Layers,
  Rocket
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlassTile } from "@/components/ui/glass-tile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number | null;
  features: string[];
}

const steps = [
  { id: 1, label: "Identity", icon: Building2 },
  { id: 2, label: "Plan", icon: CreditCard },
  { id: 3, label: "Review", icon: ShieldCheck }
];

export default function CreateOrganizationPage() {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    plan: "FREE"
  });
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-clicks
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) {
          console.error('Error fetching plans:', error);
        } else if (data) {
          setPlans(data);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setPlansLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (planName: string) => {
    setForm({ ...form, plan: planName });
  };

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      // Validate name
      if (!form.name || form.name.trim().length < 3) {
        setError("Organization name must be at least 3 characters.");
        return;
      }
      if (form.name.length > 100) {
        setError("Organization name must be less than 100 characters.");
        return;
      }
      if (!form.description || form.description.trim().length < 10) {
        setError("Description must be at least 10 characters.");
        return;
      }

      // Auto-generate slug if empty
      const finalSlug = form.slug || slugify(form.name);

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(finalSlug)) {
        setError("URL slug can only contain lowercase letters, numbers, and hyphens.");
        return;
      }

      // Check slug uniqueness
      setLoading(true);
      try {
        const { data, error: slugError } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle();

        if (slugError) throw slugError;
        if (data) {
          setError(`The URL "${finalSlug}" is already taken. Please choose a different one.`);
          setLoading(false);
          return;
        }
        setForm(prev => ({ ...prev, slug: finalSlug }));
      } catch (err: any) {
        setError(err.message || "Failed to validate URL. Please try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || loading) return;
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to create an organization');
      }

      if (!form.name || !form.slug) {
        throw new Error('Name and slug are required');
      }

      const { data, error } = await supabase.rpc('create_organization', {
        p_name: form.name,
        p_slug: form.slug || slugify(form.name),
        p_created_by: user.id,
        p_description: form.description || '',
        p_subscription_plan: form.plan || 'FREE'
      });

      // Update with logo if provided
      if (data?.success && data?.organization_id && form.logo_url) {
        await supabase
          .from('organizations')
          .update({ logo_url: form.logo_url })
          .eq('id', data.organization_id);
      }

      if (error) throw new Error(error.message || 'Unknown error occurred');
      if (data && data.error) throw new Error(data.details || data.error || 'Function execution failed');
      if (!data || !data.success) throw new Error('Organization creation failed');

      setSuccess(true);
      setTimeout(() => {
        router.push("/organization/onboarding");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-12 pb-20 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-12 gap-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                    step >= s.id
                      ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      : "bg-white/5 border-white/10 text-neutral-500"
                  )}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    step >= s.id ? "text-blue-500" : "text-neutral-500 opacity-50"
                  )}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-12 md:w-20 h-[2px] mx-2 -mt-6 rounded-full transition-all duration-700",
                    step > s.id ? "bg-blue-500/50" : "bg-white/10"
                  )} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <GlassTile className="p-8 md:p-12 relative overflow-hidden" interactive={false}>
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Rocket className="w-48 h-48" />
                  </div>

                  <form onSubmit={handleSubmit} className="relative z-10">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-sm font-bold text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    {step === 1 && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Create Organization.</h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Setting up your organization</p>
                        </div>

                        <div className="space-y-6">
                          <ImageUpload
                            value={form.logo_url}
                            onChange={(url) => setForm({ ...form, logo_url: url })}
                          />

                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Organization Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="e.g. Acme Matrix"
                              className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold px-6 focus:ring-blue-500/50"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Mission Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={form.description}
                              onChange={handleChange}
                              placeholder="Brief description of your collective missions..."
                              className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 font-medium p-6 focus:ring-blue-500/50"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Custom URL (Slug)</Label>
                              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 opacity-50">Optional - Auto Generated</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">
                                {typeof window !== 'undefined' ? window.location.host : 'eventflow.io'}/
                              </span>
                              <Input
                                id="slug"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder={form.name ? slugify(form.name) : "acme-collective"}
                                className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold pl-48 pr-6 focus:ring-blue-500/50 text-neutral-400 focus:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Select Plan.</h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Choose the best plan for your team</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {plansLoading ? (
                            <div className="col-span-2 text-center py-20 flex flex-col items-center gap-4">
                              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Loading Plans...</span>
                            </div>
                          ) : (
                            plans.map((plan) => (
                              <GlassTile
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan.name)}
                                className={cn(
                                  "p-6 cursor-pointer border-2 transition-all group",
                                  form.plan === plan.name ? "border-blue-500 bg-blue-500/[0.03]" : "border-white/5 hover:border-white/20"
                                )}
                              >
                                <div className="flex flex-col h-full">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black tracking-tight uppercase">{plan.display_name}</h3>
                                    {form.plan === plan.name && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                                  </div>
                                  <div className="mb-6">
                                    <span className="text-2xl font-black">
                                      {plan.price_monthly === null ? "Custom" : plan.price_monthly === 0 ? "Free" : `$${plan.price_monthly}`}
                                    </span>
                                    {plan.price_monthly !== null && plan.price_monthly > 0 && <span className="text-[10px] font-bold text-neutral-500 ml-1 uppercase">/ Cycle</span>}
                                  </div>
                                  <ul className="space-y-2 mb-6 flex-grow">
                                    {plan.features.slice(0, 4).map((f, i) => (
                                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                                        <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                                        {f}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className={cn(
                                    "h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all",
                                    form.plan === plan.name ? "bg-blue-500 text-white" : "bg-white/5 text-neutral-400 group-hover:bg-white/10"
                                  )}>
                                    {form.plan === plan.name ? "Plan Selected" : "Select Plan"}
                                  </div>
                                </div>
                              </GlassTile>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Review Summary.</h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Review your organization details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Organization Name", value: form.name },
                            { label: "Organization URL", value: `${typeof window !== 'undefined' ? window.location.host : 'eventflow.io'}/${form.slug}` },
                            { label: "Selected Plan", value: plans.find(p => p.name === form.plan)?.display_name || form.plan },
                            { label: "Owner Email", value: user?.email || "User" }
                          ].map((item, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">{item.label}</p>
                              <p className="text-sm font-bold truncate">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                          <ShieldCheck className="h-5 w-5 text-yellow-500 mt-1 shrink-0" />
                          <p className="text-xs font-medium text-neutral-400 leading-relaxed">
                            By creating this organization, you agree to our terms of service and data privacy standards.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                      <Button
                        type="button"
                        onClick={handleBack}
                        disabled={step === 1 || loading}
                        variant="ghost"
                        className="h-14 px-8 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] disabled:opacity-0"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>

                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                        >
                          Proceed <ArrowRight className="h-4 w-4 ml-3" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={loading}
                          className="h-14 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] transition-all"
                        >
                          {loading ? "CREATING..." : "Create Organization"} <Sparkles className="h-4 w-4 ml-3" />
                        </Button>
                      )}
                    </div>
                  </form>
                </GlassTile>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 rounded-[40px] bg-green-500/10 flex items-center justify-center text-green-500 mb-8 mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6">Organization Created!</h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-12">
                  Setting up your workspace...
                </p>
                <div className="w-48 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2 }}
                    className="h-full bg-green-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
              Already have an organization?{' '}
              <a href="/organization/dashboard" className="text-blue-500 hover:text-blue-400 transition-colors border-b border-blue-500/30">
                Go to Hub
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
