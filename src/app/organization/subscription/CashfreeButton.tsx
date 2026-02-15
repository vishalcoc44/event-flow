"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";

interface CashfreeButtonProps {
  amount: number;
  currency: string;
  customer: any;
  onSuccess?: () => void;
}

export default function CashfreeButton({ amount, currency, customer, onSuccess }: CashfreeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement actual Cashfree integration via Supabase Edge Functions
      console.log("Initiating payment for:", { amount, customer });

      // Mock delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call success callback to unblock the UI flow
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HoverShadowEffect className="w-full">
      <Button onClick={handlePay} disabled={loading} className="w-full">
        {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
      {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
    </HoverShadowEffect>
  );
} 