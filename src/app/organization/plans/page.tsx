'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Check,
  ArrowLeft,
  Sparkles,
  Globe,
  Lock,
  Infinity,
  Flame,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { GlassTile } from "@/components/ui/glass-tile";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    value: "FREE",
    icon: Zap,
    description: "Ideal for testing and individual operatives.",
    price: "$0",
    period: "/mo",
    features: ["Up to 10 events", "Up to 5 users", "100MB storage", "Standard Analytics"],
    limits: { events: 10, users: 5, storage: 100 },
    color: "blue"
  },
  {
    name: "Basic",
    value: "BASIC",
    icon: Flame,
    description: "For growing syndicates and rising teams.",
    price: "$19.99",
    period: "/mo",
    features: ["Up to 50 events", "Up to 20 users", "500MB storage", "Custom branding", "Priority Support"],
    limits: { events: 50, users: 20, storage: 500 },
    color: "purple",
    popular: true
  },
  {
    name: "Pro",
    value: "PRO",
    icon: Crown,
    description: "Professional grade Matrix power and scaling.",
    price: "$49.99",
    period: "/mo",
    features: ["Up to 200 events", "Up to 100 users", "2GB storage", "Advanced analytics", "API Access"],
    limits: { events: 200, users: 100, storage: 2000 },
    color: "green"
  },
  {
    name: "Enterprise",
    value: "ENTERPRISE",
    icon: Infinity,
    description: "Ultimate capacity for global conglomerates.",
    price: "Custom",
    period: "",
    features: ["1000+ events", "500+ users", "10GB+ storage", "Dedicated Support", "SLA Guarantee"],
    limits: { events: 1000, users: 500, storage: 10000 },
    color: "white"
  },
];

const allFeatures = Array.from(
  new Set(plans.flatMap((plan) => plan.features))
);

export default function OrganizationPlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const currentPlan = "FREE"; // Mock

  const handleSelect = (plan: string) => {
    alert(`Plan synchronization requested for ${plan}.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Accents */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header section */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-blue-500">Resource Protocols</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8 uppercase">
                The Tiers.
              </h1>
              <p className="text-neutral-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                Scale your operational capacity with precision. Choose the protocol that aligns with your syndicate's growth objectives.
              </p>
            </motion.div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.value}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassTile
                  className={cn(
                    "p-10 h-full flex flex-col group relative",
                    plan.popular && "border-blue-500/50 bg-blue-500/5 shadow-2xl shadow-blue-500/10"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      Primary Recommendation
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                      plan.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                        plan.color === 'purple' ? "bg-purple-500/10 text-purple-500" :
                          plan.color === 'green' ? "bg-green-500/10 text-green-500" :
                            "bg-neutral-100 dark:bg-white/10 text-foreground"
                    )}>
                      <plan.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">{plan.name}</h3>
                    <p className="text-neutral-500 text-xs font-medium leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-10">
                    <div className="text-5xl font-black tracking-tighter">
                      {plan.price}
                      <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide opacity-70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelect(plan.value)}
                    className={cn(
                      "h-16 w-full rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      currentPlan === plan.value ? "bg-neutral-100 dark:bg-white/10 text-neutral-400 border-0" :
                        plan.popular ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-black dark:bg-white text-white dark:text-black"
                    )}
                    disabled={currentPlan === plan.value}
                  >
                    {currentPlan === plan.value ? "Current Active" : "Commit Protocol"}
                  </Button>
                </GlassTile>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Protocol Comparison.</h2>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Granular Matrix Capability Analysis</p>
            </div>

            <GlassTile className="overflow-hidden p-0" interactive={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Operational Capability</th>
                      {plans.map((plan) => (
                        <th key={plan.value} className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allFeatures.map((feature) => (
                      <tr key={feature} className="group hover:bg-white/5 transition-colors">
                        <td className="p-8 text-xs font-bold uppercase tracking-widest opacity-70">{feature}</td>
                        {plans.map((plan) => (
                          <td key={plan.value} className="p-8 text-center">
                            {plan.features.includes(feature) ? (
                              <div className="flex justify-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-100 dark:text-white/5">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassTile>
          </div>

          {/* Return Hub */}
          <div className="mt-24 text-center">
            <Button asChild variant="ghost" className="h-16 px-12 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] border border-white/10">
              <Link href="/organization/dashboard"><ArrowLeft className="h-4 w-4" /> Return to Syndicate Hub</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}