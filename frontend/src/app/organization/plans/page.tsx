"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    value: "FREE",
    description: "Basic features for small teams and testing.",
    price: "$0/mo",
    features: ["Up to 10 events", "Up to 5 users", "100MB storage"],
    limits: { events: 10, users: 5, storage: 100 },
  },
  {
    name: "Basic",
    value: "BASIC",
    description: "For growing organizations.",
    price: "$19.99/mo",
    features: ["Up to 50 events", "Up to 20 users", "500MB storage", "Custom branding"],
    limits: { events: 50, users: 20, storage: 500 },
  },
  {
    name: "Pro",
    value: "PRO",
    description: "Advanced features for professionals.",
    price: "$49.99/mo",
    features: ["Up to 200 events", "Up to 100 users", "2GB storage", "Advanced analytics"],
    limits: { events: 200, users: 100, storage: 2000 },
  },
  {
    name: "Enterprise",
    value: "ENTERPRISE",
    description: "For large organizations with custom needs.",
    price: "Contact us",
    features: ["1000+ events", "500+ users", "10GB+ storage", "Dedicated support"],
    limits: { events: 1000, users: 500, storage: 10000 },
  },
];

const allFeatures = Array.from(
  new Set(plans.flatMap((plan) => plan.features))
);

export default function OrganizationPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  // Placeholder: Replace with real org plan from context/API
  const currentPlan = "FREE";

  const handleSelect = (plan: string) => {
    setSelectedPlan(plan);
    // TODO: Integrate with plan upgrade/downgrade API
    setTimeout(() => {
      alert(`Plan changed to ${plan}! (Integrate with backend)`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Compare Subscription Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <HoverShadowEffect
              key={plan.value}
              className={`border rounded-lg p-6 transition-all flex flex-col ${currentPlan === plan.value ? "border-primary ring-2 ring-primary" : "border-gray-200"}`}
              shadowColor="rgba(0,0,0,0.08)"
              shadowIntensity={0.12}
              hoverScale={1.02}
              hoverLift={-1}
              transitionDuration={150}
            >
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">{plan.name}</span>
                  {currentPlan === plan.value && <Badge variant="default">Current</Badge>}
                </div>
                <div className="text-primary font-bold text-2xl mb-1">{plan.price}</div>
                <div className="text-gray-600 text-sm mb-2">{plan.description}</div>
                <ul className="text-xs text-gray-500 list-disc pl-5 mb-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-xs text-gray-400">Usage Limits:</div>
                  <div className="flex gap-3 text-xs">
                    <span>Events: {plan.limits.events} </span>
                    <span>Users: {plan.limits.users} </span>
                    <span>Storage: {plan.limits.storage}MB</span>
                  </div>
                </div>
                <div className="mt-4 flex-1 flex items-end">
                  {currentPlan === plan.value ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSelect(plan.value)}
                      variant={plan.value === "ENTERPRISE" ? "secondary" : "default"}
                    >
                      {plan.value === "ENTERPRISE" ? "Contact Sales" : currentPlan === plan.value ? "Current" : currentPlan === "FREE" || plan.value === "FREE" ? "Upgrade" : "Change Plan"}
                    </Button>
                  )}
                </div>
              </div>
            </HoverShadowEffect>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg bg-white">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.value} className="p-3 text-center text-sm font-semibold text-gray-700 border-b">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature) => (
                <tr key={feature}>
                  <td className="p-3 text-sm text-gray-600 border-b w-1/3">{feature}</td>
                  {plans.map((plan) => (
                    <td key={plan.value} className="p-3 text-center border-b">
                      {plan.features.includes(feature) ? (
                        <span className="text-green-600 font-bold">✔</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 