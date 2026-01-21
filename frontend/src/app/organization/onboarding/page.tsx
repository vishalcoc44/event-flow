'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Layers,
  CheckSquare,
  Rocket,
  ShieldCheck,
  CircleDashed,
  Building2,
  Check,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationData } from "@/hooks/useOrganizationData";
import { GlassTile } from "@/components/ui/glass-tile";
import { cn } from "@/lib/utils";

const steps = [
  { id: "welcome", label: "Welcome", icon: Rocket },
  { id: "members", label: "Team", icon: Users },
  { id: "checklist", label: "Review", icon: CheckSquare }
];

export default function OrganizationOnboardingPage() {
  const [step, setStep] = useState(0);
  const [invites, setInvites] = useState<string[]>([""]);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { organization, orgLoading, updateOrganization } = useOrganizationData();
  const [isSaving, setIsSaving] = useState(false);

  // Sync with DB step on mount
  useEffect(() => {
    if (user?.onboarding_step !== undefined && !completed) {
      setStep(user.onboarding_step);
    }
  }, [user?.onboarding_step]);

  const handleInviteChange = (idx: number, value: string) => {
    setInvites((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const addInviteField = () => setInvites((prev) => [...prev, ""]);

  const saveStep = async (newStep: number) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { authAPI } = await import("@/lib/api");
      await authAPI.updateOnboardingStep(user.id, newStep);
    } catch (err) {
      console.error("Failed to save step:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      await saveStep(nextStep);
    } else {
      setCompleted(true);
      await saveStep(steps.length); // Mark as complete (beyond last index)
    }
  };

  const handleBack = async () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      await saveStep(prevStep);
    }
  };

  const handleFinish = () => {
    router.push("/organization/dashboard");
  };

  const checklist = [
    { label: "Organization Profile Active", done: !!organization?.id },
    { label: "Branding Configured", done: !!organization?.logo_url || !!organization?.name },
    { label: "Initial Workspace Ready", done: true }, // Default space is created via RPC
  ];

  const currentStep = steps[step];

  if (orgLoading && step === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Syncing Workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Progress Hub */}
          <div className="flex items-center justify-between mb-12 gap-8 px-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-3">
                <div className={cn(
                  "h-1.5 w-full rounded-full transition-all duration-700",
                  i <= step ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-neutral-200 dark:bg-white/5"
                )} />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] transition-colors",
                  i === step ? "text-blue-500" : "text-neutral-400 opacity-50"
                )}>{s.label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <GlassTile className="p-12 md:p-16 relative overflow-hidden" interactive={false}>
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <currentStep.icon className="w-48 h-48" />
                  </div>

                  <div className="relative z-10">
                    {step === 0 && (
                      <div className="space-y-10 text-center">
                        <div className="w-24 h-24 rounded-[40px] bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-8 shadow-inner">
                          <Rocket className="h-10 w-10" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4 uppercase">
                            Collective <br /> Established.
                          </h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Logged in as {user?.email}</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 max-w-sm mx-auto">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">Connected to</p>
                              <p className="text-lg font-black tracking-tighter text-blue-500 truncate max-w-[180px]">
                                {organization?.name || 'Your New Organization'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-neutral-500 font-medium leading-relaxed max-w-sm mx-auto">
                          Excellent. Your organization is now official. Let's finish up a few final details to personalize your workspace.
                        </p>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Invite Team.</h2>
                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Optional - Add members by email</p>
                          </div>
                          <div className="h-12 px-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500">Optional Phase</span>
                          </div>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {invites.map((email, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                              <Input
                                type="email"
                                value={email}
                                onChange={(e) => handleInviteChange(idx, e.target.value)}
                                placeholder="member@example.com"
                                className="h-16 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-8 mb-3 focus:ring-blue-500/50"
                              />
                            </motion.div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={addInviteField}
                            className="w-full h-16 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-blue-500/5 hover:border-blue-500/20 hover:text-blue-500 transition-all"
                          >
                            + Invite Another Entity
                          </Button>
                        </div>

                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">
                          You can always invite members later from the Members Dashboard
                        </p>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-10">
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Final Audit.</h2>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Verification of organization readiness</p>
                        </div>
                        <div className="space-y-4">
                          {checklist.map((item, idx) => (
                            <div key={idx} className={cn(
                              "p-6 rounded-3xl border flex items-center justify-between transition-all duration-500",
                              item.done
                                ? "bg-green-500/5 border-green-500/20 text-green-500"
                                : "bg-neutral-100 dark:bg-white/5 border-white/10 text-neutral-400 opacity-50"
                            )}>
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-2xl flex items-center justify-center",
                                  item.done ? "bg-green-500/10" : "bg-neutral-200 dark:bg-white/10"
                                )}>
                                  {item.done ? <Check className="w-5 h-5" /> : <CircleDashed className="w-5 h-5 animate-spin" />}
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                              </div>
                              {item.done && <CheckCircle2 className="h-5 w-5" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-12 mt-12 border-t border-black/5 dark:border-white/5">
                      <Button
                        onClick={handleBack}
                        disabled={step === 0}
                        variant="ghost"
                        className="h-14 px-8 rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] disabled:opacity-0"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>

                      {step < steps.length - 1 ? (
                        <Button
                          onClick={handleNext}
                          className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                        >
                          {step === 1 ? "Skip / Proceed" : "Continue"} <ArrowRight className="h-4 w-4 ml-3" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setCompleted(true)}
                          className="h-14 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] transition-all"
                        >
                          Initiate Workspace <Sparkles className="h-4 w-4 ml-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassTile>
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-center"
              >
                <GlassTile className="p-20 flex flex-col items-center" interactive={false}>
                  <div className="w-24 h-24 rounded-[40px] bg-green-500/10 flex items-center justify-center text-green-500 mb-8 shadow-[0_0_35px_rgba(34,197,94,0.4)]">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6">ALL SYSTEMS GO.</h1>
                  <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-12 max-w-sm">
                    Your organization is established. The hub is ready for your first mission.
                  </p>
                  <Button
                    onClick={handleFinish}
                    className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.05] transition-all"
                  >
                    Go to Hub <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </GlassTile>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
