"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HoverShadowEffect } from "@/components/ui/hover-shadow-effect";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  "Welcome",
  "Branding",
  "Invite Members",
  "Create Event Space",
  "Checklist"
];

export default function OrganizationOnboardingPage() {
  const [step, setStep] = useState(0);
  const [logoUrl, setLogoUrl] = useState("");
  const [invites, setInvites] = useState<string[]>([""]);
  const [space, setSpace] = useState({ name: "", description: "" });
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Checklist state
  const checklist = [
    { label: "Added logo/branding", done: !!logoUrl },
    { label: "Invited at least 1 member", done: invites.filter((e) => e).length > 0 },
    { label: "Created first event space", done: !!space.name },
  ];

  const handleInviteChange = (idx: number, value: string) => {
    setInvites((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const addInviteField = () => setInvites((prev) => [...prev, ""]);

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setCompleted(true);
  };
  const handleBack = () => setStep((s) => (s > 0 ? s - 1 : 0));

  const handleFinish = () => {
    // TODO: Mark onboarding as complete in backend
    router.push("/organization/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Organization Dropdown */}
      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl mx-auto">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Organization Onboarding</CardTitle>
              <div className="flex gap-2 mt-2">
                {steps.map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full ${i <= step ? "bg-primary" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {completed ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎉</div>
                  <div className="text-xl font-semibold mb-2">Onboarding Complete!</div>
                  <div className="text-gray-600 mb-4">Your organization is ready to go.</div>
                  <Button onClick={handleFinish}>Go to Dashboard</Button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  {step === 0 && (
                    <div className="space-y-6 text-center">
                      <div className="text-4xl mb-2">👋</div>
                      <div className="text-xl font-semibold mb-2">Welcome to Your Organization!</div>
                      <div className="text-gray-600 mb-4">Let's get your workspace set up in a few quick steps.</div>
                    </div>
                  )}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-lg font-semibold">Add Your Logo & Branding</div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      {logoUrl && (
                        <img src={logoUrl} alt="Logo Preview" className="h-16 mx-auto mt-2" />
                      )}
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-lg font-semibold">Invite Team Members</div>
                      <div className="space-y-2">
                        {invites.map((email, idx) => (
                          <Input
                            key={idx}
                            type="email"
                            value={email}
                            onChange={(e) => handleInviteChange(idx, e.target.value)}
                            placeholder="team-member@email.com"
                            className="mb-2"
                          />
                        ))}
                        <Button type="button" variant="outline" onClick={addInviteField} className="w-full mt-2">
                          + Add Another
                        </Button>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-lg font-semibold">Create Your First Event Space</div>
                      <Label htmlFor="spaceName">Space Name</Label>
                      <Input
                        id="spaceName"
                        value={space.name}
                        onChange={(e) => setSpace((s) => ({ ...s, name: e.target.value }))}
                        placeholder="e.g. Main Hall"
                      />
                      <Label htmlFor="spaceDesc">Description</Label>
                      <Input
                        id="spaceDesc"
                        value={space.description}
                        onChange={(e) => setSpace((s) => ({ ...s, description: e.target.value }))}
                        placeholder="Describe the space (optional)"
                      />
                    </div>
                  )}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-lg font-semibold mb-2">Setup Checklist</div>
                      <ul className="space-y-2">
                        {checklist.map((item, idx) => (
                          <li key={item.label} className="flex items-center gap-2">
                            <span className={`inline-block w-4 h-4 rounded-full ${item.done ? "bg-green-500" : "bg-gray-300"}`}></span>
                            <span className={item.done ? "text-green-700" : "text-gray-600"}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-500 mt-4">Complete all steps to finish onboarding.</div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8">
                    {step > 0 && (
                      <Button type="button" variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    <div className="flex-1" />
                    {step < steps.length - 1 && (
                      <Button type="submit">
                        Next
                      </Button>
                    )}
                    {step === steps.length - 1 && (
                      <Button type="button" onClick={() => setCompleted(true)} disabled={!checklist.every((c) => c.done)}>
                        Finish
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-xs text-gray-400 mx-auto">
                You can revisit onboarding anytime from your dashboard.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
} 