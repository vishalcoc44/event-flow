'use client';

import { useEffect, useState } from 'react';
import { useOrganizationData, useOrganizationPermissions, useSubscriptionInfo } from '@/hooks/useOrganizationData';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverShadowEffect, CardHoverShadow } from '@/components/ui/hover-shadow-effect';
import { GradientButton } from '@/components/ui/gradient-button';
import { Dashboard3DCard } from '@/components/ui/dashboard-3d-card';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { organizationAPI, authAPI } from '@/lib/api';

// Icons
const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5V21a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5V3.75a.75.75 0 0 0 0-1.5h-15ZM3 3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v16.5A2.25 2.25 0 0 1 18.75 22.5H5.25A2.25 2.25 0 0 1 3 20.25V3.75ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 12.008V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 12.008V12Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 12.008V12ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 15.008V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 15.008V15Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 15.008V15ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 18.008V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 18.008V18Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 18.008V18Z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" clipRule="evenodd" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const ExitIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-4 h-4"}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
  </svg>
);

export default function OrganizationDashboard() {
  const { organization, orgLoading } = useOrganizationData();
  const { canCreateEvents, canInviteUsers, canManageMembers, isOwner } = useOrganizationPermissions();
  const subscription = useSubscriptionInfo();
  const { user, refreshAuth } = useAuth();
  const { members } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();

  // Leave organization state
  const [isLeavingOrg, setIsLeavingOrg] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState('');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Calculate stats from organization and members
  const stats = organization ? {
    totalEvents: organization.current_events_count || 0,
    totalBookings: organization.current_events_count || 0, // Placeholder, no total_bookings field
    totalMembers: members ? members.length : 0,
    totalRevenue: 0 // Placeholder, no total_revenue field
  } : {
    totalEvents: 0,
    totalBookings: 0,
    totalMembers: 0,
    totalRevenue: 0
  };

  // Handle leaving organization
  const handleLeaveOrganization = async () => {
    if (!organization || !user) return;
    
    if (leaveConfirmation !== organization.name) {
      toast({
        title: "Invalid confirmation",
        description: "Please type the organization name exactly as shown to confirm.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLeavingOrg(true);
    try {
      await organizationAPI.leaveOrganization();
      
      toast({
        title: "Left organization",
        description: `You have successfully left ${organization.name}.`,
      });
      
      // Clear form and close dialog
      setLeaveConfirmation('');
      setShowLeaveDialog(false);
      
      // Clear the user's organization cache to ensure fresh data is loaded
      if (user?.id) {
        authAPI.clearUserOrganizationCache(user.id);
      }
      
      // Navigate to customer dashboard immediately
      // The customer dashboard will naturally reload user data when it mounts
      router.push('/customer/dashboard');
    } catch (error: any) {
      console.error('Leave organization error:', error);
      toast({
        title: "Error leaving organization",
        description: error?.message || "Failed to leave organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeavingOrg(false);
    }
  };

  useEffect(() => {
    if (organization) {
      // TODO: Fetch organization stats and recent activity
      // This will be implemented when we add the API endpoints
      // setStats({
      //   totalEvents: 12,
      //   totalBookings: 45,
      //   totalMembers: 8,
      //   totalRevenue: 2500
      // });
    }
  }, [organization]);

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded-2xl shadow-lg border border-border"></div>
              ))}
            </div>
            
            {/* Quick actions skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-card rounded-2xl shadow-lg border border-border"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <CardContainer className="inter-var">
            <CardBody className="bg-card relative group/card border border-border w-full h-auto rounded-2xl p-8 shadow-2xl">
              <CardItem
                translateZ="50"
                className="w-16 h-16 mx-auto mb-6"
              >
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardItem>
              
              <CardItem
                translateZ="60"
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">No Organization Found</h2>
                <p className="text-muted-foreground mb-8">You need to be part of an organization to access this dashboard.</p>
              </CardItem>
              
              <CardItem
                translateZ="70"
                className="w-full"
              >
                <GradientButton 
                  href="/create-organization" 
                  variant="primary"
                  className="w-full justify-center"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Create Organization
                </GradientButton>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Default Organization Banner - Extreme Top */}
        <motion.div
          className="w-full mb-12 -mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-full bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 backdrop-blur-sm border border-blue-100/30 rounded-2xl px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">First Organization</h3>
                  <p className="text-sm text-gray-600">Default organization for existing users</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Organization Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Active
                  </Badge>
                </div>
                {isOwner && (
                  <HoverShadowEffect
                    className="inline-block relative"
                    shadowColor="rgba(0,0,0,0.08)"
                    shadowIntensity={0.08}
                    hoverScale={1.01}
                    hoverLift={-1}
                    transitionDuration={180}
                  >
                    <Button asChild variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-md relative z-10">
                      <Link href="/organization/settings" className="flex items-center px-3 py-2">
                        <CogIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Settings</span>
                      </Link>
                    </Button>
                  </HoverShadowEffect>
                )}
                <HoverShadowEffect
                  className="inline-block relative"
                  shadowColor="rgba(0,0,0,0.08)"
                  shadowIntensity={0.08}
                  hoverScale={1.01}
                  hoverLift={-1}
                  transitionDuration={180}
                >
                  <Button asChild variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:border-gray-300 rounded-md relative z-10">
                    <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'} className="flex items-center px-3 py-2">
                      <span className="whitespace-nowrap">← Back to Main Dashboard</span>
                    </Link>
                  </Button>
                </HoverShadowEffect>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats and Actions Overview - Moved Above */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                Dashboard Overview
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Your organization's key metrics and essential management tools
              </p>
            </motion.div>
          </div>

          {/* First Row: Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Events Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-200/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CalendarIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Events</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.totalEvents}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This month</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      +{Math.floor(Math.random() * 15) + 5}% ↑
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-purple-200/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <UsersIcon className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">Team Members</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{stats.totalMembers}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active now</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      {Math.floor(Math.random() * stats.totalMembers) + 1} online
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bookings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-green-200/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.totalBookings}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This month</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      +{Math.floor(Math.random() * 25) + 10}% ↑
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-yellow-200/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-yellow-600 font-bold text-lg">$</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This month</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      +{Math.floor(Math.random() * 20) + 5}% ↑
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Second Row: Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {canCreateEvents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <CardContainer className="inter-var">
                  <CardBody className="bg-white/80 backdrop-blur-sm relative group/card border border-gray-200/50 w-full h-auto min-h-[280px] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Link href="/organization/create-event" className="relative z-10 flex-1 flex flex-col">
                      <CardItem
                        translateZ="60"
                        className="w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      >
                        <PlusIcon className="w-8 h-8 text-primary" />
                      </CardItem>
                      <CardItem
                        translateZ="70"
                        className="text-center flex-1 flex flex-col justify-center"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Create Event</h3>
                        <p className="text-gray-600 leading-relaxed">Add a new event to your organization and start managing bookings</p>
                        <div className="mt-4 flex justify-center">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Most Popular
                          </Badge>
                        </div>
                      </CardItem>
                    </Link>
                  </CardBody>
                </CardContainer>
              </motion.div>
            )}

            {canInviteUsers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                <CardContainer className="inter-var">
                  <CardBody className="bg-white/80 backdrop-blur-sm relative group/card border border-gray-200/50 w-full h-auto min-h-[280px] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Link href="/organization/members" className="relative z-10 flex-1 flex flex-col">
                      <CardItem
                        translateZ="60"
                        className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      >
                        <EnvelopeIcon className="w-8 h-8 text-green-600" />
                      </CardItem>
                      <CardItem
                        translateZ="70"
                        className="text-center flex-1 flex flex-col justify-center"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Invite User</h3>
                        <p className="text-gray-600 leading-relaxed">Invite new members to your organization and expand your team</p>
                        <div className="mt-4 flex justify-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            Team Growth
                          </Badge>
                        </div>
                      </CardItem>
                    </Link>
                  </CardBody>
                </CardContainer>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <CardContainer className="inter-var">
                <CardBody className="bg-white/80 backdrop-blur-sm relative group/card border border-gray-200/50 w-full h-auto min-h-[280px] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href="/organization/events" className="relative z-10 flex-1 flex flex-col">
                    <CardItem
                      translateZ="60"
                      className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    >
                      <CalendarIcon className="w-8 h-8 text-blue-600" />
                    </CardItem>
                    <CardItem
                      translateZ="70"
                      className="text-center"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Manage Events</h3>
                      <p className="text-gray-600 leading-relaxed">View and manage all organization events and their details</p>
                      <div className="mt-4 flex justify-center">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          Overview
                        </Badge>
                      </div>
                    </CardItem>
                  </Link>
                </CardBody>
              </CardContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.3 }}
            >
              <CardContainer className="inter-var">
                <CardBody className="bg-white/80 backdrop-blur-sm relative group/card border border-gray-200/50 w-full h-auto min-h-[280px] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href="/admin/bookings" className="relative z-10 flex-1 flex flex-col">
                    <CardItem
                      translateZ="60"
                      className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    >
                      <UsersIcon className="w-8 h-8 text-purple-600" />
                    </CardItem>
                    <CardItem
                      translateZ="70"
                      className="text-center"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Event Bookings</h3>
                      <p className="text-gray-600 leading-relaxed">Check all event bookings and attendee information</p>
                      <div className="mt-4 flex justify-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          Attendance
                        </Badge>
                      </div>
                    </CardItem>
                  </Link>
                </CardBody>
              </CardContainer>
            </motion.div>
          </div>
        </motion.div>







        {/* Subscription & Usage - Compact */}
        {subscription && (
          <motion.div
            className="mb-16 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <CardHoverShadow theme="blue" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md">
                      <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                      <p className="text-sm text-gray-600">Subscription details</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">Plan Type</span>
                      <Badge
                        variant={subscription.plan === 'PRO' ? 'default' : 'secondary'}
                        className="px-3 py-1 text-xs"
                      >
                        {subscription.plan || 'Free'} Plan
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">Status</span>
                      <Badge
                        variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="px-3 py-1 text-xs"
                      >
                        {subscription.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">Days Left</span>
                      <span className="text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        {subscription.daysUntilExpiry !== null ? subscription.daysUntilExpiry : '∞'}
                      </span>
                    </div>
                  </div>
                </CardHoverShadow>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <CardHoverShadow theme="green" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-md">
                      <ChartBarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Usage Limits</h3>
                      <p className="text-sm text-gray-600">Resource usage</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">Events</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {organization?.current_events_count || 0} / {organization?.max_events || '∞'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                      <span className="text-xs font-medium text-gray-700">Members</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {organization?.current_users_count || 0} / {organization?.max_users || '∞'}
                      </span>
                    </div>
                  </div>
                </CardHoverShadow>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Recent Activity */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 2.0 }}
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.1 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                Recent Activity
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Stay updated with your organization's latest events and bookings
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2.2 }}
          >
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-2 shadow-lg">
                <TabsTrigger value="events" className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Recent Events
                </TabsTrigger>
                <TabsTrigger value="bookings" className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Recent Bookings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="mt-8">
                <CardHoverShadow theme="blue" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CalendarIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No recent events</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                      Your recent events will appear here once you create some. Start building your organization's event portfolio!
                    </p>
                    {canCreateEvents && (
                      <GradientButton href="/organization/create-event" variant="primary" size="lg">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create Your First Event
                      </GradientButton>
                    )}
                  </div>
                </CardHoverShadow>
              </TabsContent>

              <TabsContent value="bookings" className="mt-8">
                <CardHoverShadow theme="green" className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UsersIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No recent bookings</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                      Event bookings will appear here once customers start registering. Share your events to start growing your audience!
                    </p>
                    <GradientButton href="/admin/bookings" variant="outline" size="lg">
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      View All Bookings
                    </GradientButton>
                  </div>
                </CardHoverShadow>
              </TabsContent>
            </Tabs>

            {/* Leave Organization Section - For non-owners only */}
            {!isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12"
              >
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md">
                          <ExitIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-orange-900 text-lg">Leave Organization</h3>
                          <p className="text-orange-700 text-sm mt-1">
                            Leave {organization?.name} as a member. You'll lose access to all organization resources and events.
                          </p>
                        </div>
                      </div>
                      
                      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 shrink-0">
                            <ExitIcon className="w-4 h-4 mr-2" />
                            Leave
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Leave Organization</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to leave {organization?.name}? This action cannot be undone and you will lose access to all organization resources.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="leaveConfirmation">
                                Type <span className="font-mono font-bold">{organization?.name}</span> to confirm
                              </Label>
                              <Input
                                id="leaveConfirmation"
                                value={leaveConfirmation}
                                onChange={(e) => setLeaveConfirmation(e.target.value)}
                                placeholder="Enter organization name to confirm"
                                className="border-orange-300 focus:border-orange-500"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleLeaveOrganization}
                              disabled={leaveConfirmation !== organization?.name || isLeavingOrg}
                            >
                              {isLeavingOrg ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Leaving...
                                </>
                              ) : (
                                'Leave Organization'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 