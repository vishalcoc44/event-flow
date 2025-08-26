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

const CogIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 1 2.282.818l1.019.382c.115.043.283.032.45-.082.312-.214.641-.405.985-.57.182-.088.277-.228.297-.35l.178-1.071c.151-.904.933-1.567 1.85-1.567s1.699.663 1.85 1.567l.178 1.072c.02.12.114.26.297.349.344.165.673.356.985.57.167.114.335.125.45.082l1.02-.382a1.875 1.875 0 0 1 2.28.819l.923 1.597a1.875 1.875 0 0 1-.432 2.385l-.84.692c-.095.078-.17.229-.154.43a7.614 7.614 0 0 0 0 1.139c.016.2-.059.352-.153.43l.84.692c.648.533.803 1.53.432 2.385l-.922 1.597a1.875 1.875 0 0 1-2.282.818l-1.02-.382c-.115-.043-.283-.032-.45.082a7.49 7.49 0 0 1-.985.57c-.183.088-.277.228-.297.348l-.179 1.072a1.875 1.875 0 0 1-1.85 1.567Z" clipRule="evenodd" />
    <path d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
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
  const { user } = useAuth();
  const { members } = useOrganization();

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
                <div key={i} className="h-32 bg-white rounded-2xl shadow-lg border border-gray-100"></div>
              ))}
            </div>
            
            {/* Quick actions skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-2xl shadow-lg border border-gray-100"></div>
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
            <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-8 shadow-2xl">
              <CardItem
                translateZ="50"
                className="w-16 h-16 mx-auto mb-6"
              >
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                </div>
              </CardItem>
              
              <CardItem
                translateZ="60"
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization Found</h2>
                <p className="text-gray-600 mb-8">You need to be part of an organization to access this dashboard.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HoverShadowEffect 
            className="inline-block" 
            shadowColor="rgba(0,0,0,0.1)" 
            shadowIntensity={0.1} 
            hoverScale={1.02} 
            hoverLift={-2} 
            transitionDuration={150}
          >
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}>
                ← Back to Main Dashboard
              </Link>
            </Button>
          </HoverShadowEffect>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organization Info Card - Smaller and positioned on the left */}
            <div className="lg:col-span-1">
              <CardContainer className="inter-var">
                <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <CardItem
                      translateZ="60"
                      className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <BuildingOfficeIcon className="w-7 h-7 text-primary" />
                    </CardItem>
                    
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-gray-900 mb-2"
                    >
                      {organization.name}
                    </CardItem>
                    <CardItem
                      translateZ="40"
                      className="text-sm text-gray-600 mb-4 line-clamp-2"
                    >
                      {organization.description || 'Welcome to your organization dashboard'}
                    </CardItem>
                    
                    <div className="flex flex-col gap-3">
                      <CardItem translateZ="30">
                        <Badge 
                          variant={subscription.plan === 'PRO' ? 'default' : 'secondary'}
                          className="px-3 py-1 text-xs font-medium"
                        >
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          {subscription.plan || 'Free'} Plan
                        </Badge>
                      </CardItem>
                      
                      {isOwner && (
                        <CardItem translateZ="40">
                          <GradientButton 
                            href="/organization/settings" 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2 w-full justify-center"
                          >
                            <CogIcon className="w-4 h-4" />
                            Settings
                          </GradientButton>
                        </CardItem>
                      )}
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
            
            {/* Quick Stats Overview */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Events</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Members</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">$</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-primary" />
            Organization Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Dashboard3DCard
              title="Total Events"
              value={stats.totalEvents.toString()}
              description={`${stats.totalEvents > 0 ? 'Active events' : 'No events yet'}`}
              icon={<CalendarIcon className="w-5 h-5 text-blue-600" />}
              className="bg-white border-gray-200 hover:border-blue-300 transition-all duration-300"
            />
            
            <Dashboard3DCard
              title="Total Bookings"
              value={stats.totalBookings.toString()}
              description={`${stats.totalBookings > 0 ? 'Total bookings' : 'No bookings yet'}`}
              icon={<UsersIcon className="w-5 h-5 text-green-600" />}
              className="bg-white border-gray-200 hover:border-green-300 transition-all duration-300"
            />
            
            <Dashboard3DCard
              title="Team Members"
              value={stats.totalMembers.toString()}
              description={`${stats.totalMembers > 1 ? 'Active members' : stats.totalMembers === 1 ? 'Just you' : 'No members'}`}
              icon={<UsersIcon className="w-5 h-5 text-purple-600" />}
              className="bg-white border-gray-200 hover:border-purple-300 transition-all duration-300"
            />
            
            <Dashboard3DCard
              title="Revenue"
              value={`$${stats.totalRevenue}`}
              description={`${stats.totalRevenue > 0 ? 'Total earned' : 'No revenue yet'}`}
              icon={<ChartBarIcon className="w-5 h-5 text-yellow-600" />}
              className="bg-white border-gray-200 hover:border-yellow-300 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {canCreateEvents && (
              <CardContainer className="inter-var">
                <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <Link href="/organization/create-event" className="block">
                    <CardItem
                      translateZ="50"
                      className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                    >
                      <PlusIcon className="w-6 h-6 text-primary" />
                    </CardItem>
                    
                    <CardItem
                      translateZ="60"
                      className="text-center"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Event</h3>
                      <p className="text-sm text-gray-600">Add a new event to your organization</p>
                    </CardItem>
                  </Link>
                </CardBody>
              </CardContainer>
            )}

            {canInviteUsers && (
              <CardContainer className="inter-var">
                <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <Link href="/organization/members" className="block">
                    <CardItem
                      translateZ="50"
                      className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mx-auto mb-4"
                    >
                      <EnvelopeIcon className="w-6 h-6 text-green-600" />
                    </CardItem>
                    
                    <CardItem
                      translateZ="60"
                      className="text-center"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Users</h3>
                      <p className="text-sm text-gray-600">Invite new members to your organization</p>
                    </CardItem>
                  </Link>
                </CardBody>
              </CardContainer>
            )}

            <CardContainer className="inter-var">
              <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <Link href="/organization/events" className="block">
                  <CardItem
                    translateZ="50"
                    className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4"
                  >
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </CardItem>
                  
                  <CardItem
                    translateZ="60"
                    className="text-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Events</h3>
                    <p className="text-sm text-gray-600">View and manage all organization events</p>
                  </CardItem>
                </Link>
              </CardBody>
            </CardContainer>

            <CardContainer className="inter-var">
              <CardBody className="bg-white relative group/card border border-gray-200 w-full h-auto rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <Link href="/admin/bookings" className="block">
                  <CardItem
                    translateZ="50"
                    className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4"
                  >
                    <UsersIcon className="w-6 h-6 text-purple-600" />
                  </CardItem>
                  
                  <CardItem
                    translateZ="60"
                    className="text-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Bookings</h3>
                    <p className="text-sm text-gray-600">Check all event bookings and attendees</p>
                  </CardItem>
                </Link>
              </CardBody>
            </CardContainer>
          </div>
        </motion.div>

        {/* Subscription & Usage */}
        {subscription && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BuildingOfficeIcon className="w-6 h-6 text-primary" />
              Subscription & Usage
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardHoverShadow theme="blue" className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Current Plan</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Plan</span>
                    <Badge 
                      variant={subscription.plan === 'PRO' ? 'default' : 'secondary'}
                      className="px-3 py-1"
                    >
                      {subscription.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <Badge 
                      variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}
                      className="px-3 py-1"
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Days Until Expiry</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {subscription.daysUntilExpiry !== null ? subscription.daysUntilExpiry : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardHoverShadow>

              <CardHoverShadow theme="green" className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Usage Limits</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Events</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {organization?.current_events_count || 0} / {organization?.max_events || '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((organization?.current_events_count || 0) / (organization?.max_events || 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Members</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {organization?.current_users_count || 0} / {organization?.max_users || '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((organization?.current_users_count || 0) / (organization?.max_users || 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardHoverShadow>
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Recent Activity
          </h2>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="events" className="rounded-lg">Recent Events</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg">Recent Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <CardHoverShadow theme="blue" className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent events</h3>
                  <p className="text-gray-600 mb-6">Your recent events will appear here once you create some.</p>
                  {canCreateEvents && (
                    <GradientButton href="/admin/event" variant="primary">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </GradientButton>
                  )}
                </div>
              </CardHoverShadow>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <CardHoverShadow theme="green" className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent bookings</h3>
                  <p className="text-gray-600 mb-6">Event bookings will appear here once customers start registering.</p>
                  <GradientButton href="/admin/bookings" variant="outline">
                    View All Bookings
                  </GradientButton>
                </div>
              </CardHoverShadow>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 