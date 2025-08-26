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
      const res = await fetch("/api/cashfree-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount / 100, currency, customer }), // Convert back to dollars
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      
      // @ts-ignore
      if (!window.Cashfree) {
        setError("Cashfree SDK not loaded");
        setLoading(false);
        return;
      }
      
      // @ts-ignore
      const cashfree = window.Cashfree({ 
        mode: process.env.NODE_ENV === "production" ? "production" : "sandbox" 
      });
      
      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
        onSuccess: (data: any) => {
          console.log('Payment successful:', data);
          onSuccess?.();
        },
        onFailure: (data: any) => {
          console.error('Payment failed:', data);
          setError('Payment failed');
        }
      });
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