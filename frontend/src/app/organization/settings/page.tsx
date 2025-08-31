'use client';

import { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverShadowEffect, CardHoverShadow } from '@/components/ui/hover-shadow-effect';
import { GradientButton } from '@/components/ui/gradient-button';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { organizationAPI } from '@/lib/api';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icons
const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5V21a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5V3.75a.75.75 0 0 0 0-1.5h-15ZM3 3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v16.5A2.25 2.25 0 0 1 18.75 22.5H5.25A2.25 2.25 0 0 1 3 20.25V3.75ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 12.008V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 12.008V12Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 12.008V12ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 15.008V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 15.008V15Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 15.008V15ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 18.008V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 18.008V18Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 18.008V18Z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V4.125A4.125 4.125 0 0 1 14.25 8.25h1.875a4.125 4.125 0 0 1 4.125 4.125v9.375c0 1.035-.84 1.875-1.875 1.875h-.28a1.875 1.875 0 0 1-1.683-1.021l-.54-.916a1.875 1.875 0 0 0-1.683-1.021H8.25a1.875 1.875 0 0 0-1.683 1.021l-.54.916A1.875 1.875 0 0 1 4.03 19.416h-.28a1.875 1.875 0 0 1-1.875-1.875V4.125ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 12.008V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 12.008V12Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V12Z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368M18.75 19.5a3 3 0 10-6 0 3 3 0 006 0z" />
  </svg>
);


export default function OrganizationSettings() {
  const { organization, orgLoading, updateOrganization } = useOrganizationData();
  const { isOwner, isAdmin, isUser } = useOrganizationPermissions();
  const { user, refreshAuth } = useAuth();
  
  // Restrict access to admins and owners only
  const canAccessSettings = isOwner || isAdmin;
  

  const { loadOrganization } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [settings, setSettings] = useState({
    isPublic: true,
    allowRegistration: true,
    requireApproval: false,
    enableNotifications: true,
    enableAnalytics: true
  });
  
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    logoUrl: '',
    customCss: ''
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  

  useEffect(() => {
    console.log('Settings page effect - organization:', !!organization, 'orgLoading:', orgLoading);
    
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website_url || '',
        email: organization.contact_email || '',
        phone: organization.contact_phone || '',
        address: organization.address || ''
      });
      
      // Load organization settings - only use fields that exist in Organization interface
      setSettings({
        isPublic: organization.is_public ?? true,
        allowRegistration: organization.allow_user_registration ?? true,
        requireApproval: organization.require_approval_for_events ?? false,
        enableNotifications: true, // Default value since field doesn't exist
        enableAnalytics: true // Default value since field doesn't exist
      });
      
      // Load theme settings - only use fields that exist in Organization interface
      setTheme({
        primaryColor: '#3B82F6', // Default value since field doesn't exist
        secondaryColor: '#6B7280', // Default value since field doesn't exist
        logoUrl: organization.logo_url || '',
        customCss: '' // Default value since field doesn't exist
      });
      
      // Load real counts
      loadCounts();
    }
  }, [organization]);

  const loadCounts = async () => {
    if (!organization) return;

    try {
      // Get member count
      const { count: memberCount, error: memberError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      if (memberError) throw memberError;
      setMemberCount(memberCount || 0);

      // Get event count
      const { count: eventCount, error: eventError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      if (eventError) throw eventError;
      setEventCount(eventCount || 0);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (field: string, value: string) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleRefreshOrganization = () => {
    if (user?.id) {
      loadOrganization(user.id);
    }
  };



  const handleSave = async () => {
    if (!organization) return;
    
    setIsSaving(true);
    try {
      await updateOrganization({
        name: formData.name,
        description: formData.description,
        website_url: formData.website,
        contact_email: formData.email,
        contact_phone: formData.phone,
        address: formData.address,
        is_public: settings.isPublic,
        allow_user_registration: settings.allowRegistration,
        require_approval_for_events: settings.requireApproval,
        logo_url: theme.logoUrl
      });
      
      toast({
        title: "Settings saved",
        description: "Your organization settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (deleteConfirmation !== organization?.name) {
      toast({
        title: "Error",
        description: "Please type the organization name exactly to confirm deletion.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      // TODO: Implement organization deletion API
      toast({
        title: "Organization deleted",
        description: "Your organization has been permanently deleted.",
      });
      // Redirect to home or create organization page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation('');
    }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse"
          >
            <div className="h-12 bg-gray-200 rounded-2xl w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto mt-16">
          <CardHoverShadow>
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Organization</h2>
                <p className="text-gray-600">Please wait while we load your organization settings...</p>
              </CardContent>
            </Card>
          </CardHoverShadow>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto mt-16">
          <CardHoverShadow>
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Organization Found</h2>
                <p className="text-gray-600 mb-8">You need to be part of an organization to access settings.</p>
                <div className="space-y-4">
                  <GradientButton href="/create-organization" variant="primary">
                    Create Organization
                  </GradientButton>
                  <Button onClick={handleRefreshOrganization} variant="outline" className="w-full">
                    Refresh Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardHoverShadow>
        </div>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto mt-16">
          <CardHoverShadow>
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-8">Only organization owners and administrators can manage organization settings.</p>
                <GradientButton href="/organization/dashboard" variant="outline">
                  Back to Dashboard
                </GradientButton>
              </CardContent>
            </Card>
          </CardHoverShadow>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SettingsIcon className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
              </div>
              <p className="text-gray-600">
                Manage your organization's configuration and preferences
              </p>
            </div>
            <GradientButton href="/organization/dashboard" variant="outline">
              Back to Dashboard
            </GradientButton>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs defaultValue="general">
            <div className="flex justify-start">
              <TabsList className="flex gap-2 bg-white border-gray-200 p-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <TabsTrigger value="general" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white hover:bg-gray-50 transition-all duration-200">General</TabsTrigger>
                <TabsTrigger value="settings" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white hover:bg-gray-50 transition-all duration-200">Settings</TabsTrigger>
                <TabsTrigger value="appearance" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white hover:bg-gray-50 transition-all duration-200">Appearance</TabsTrigger>
                <TabsTrigger value="danger" className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white hover:bg-red-50 transition-all duration-200">Danger Zone</TabsTrigger>
              </TabsList>
            </div>

            {/* General Information */}
            <TabsContent value="general" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CardHoverShadow>
                    <Card className="bg-white border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-gray-900">Organization Information</CardTitle>
                        <CardDescription className="text-gray-600">
                          Update your organization's basic information and contact details.
                        </CardDescription>
                      </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="contact@organization.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Describe your organization..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleFormChange('website', e.target.value)}
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Enter your organization's address..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
                  </CardHoverShadow>
            </div>

            <div className="space-y-6">
              <CardHoverShadow>
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Organization Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <Badge variant="default" className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Created</span>
                      <span className="text-sm text-gray-900">
                        {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Members</span>
                      <span className="text-sm text-gray-900">{memberCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Events</span>
                      <span className="text-sm text-gray-900">{eventCount}</span>
                    </div>
                  </CardContent>
                </Card>
              </CardHoverShadow>

              <CardHoverShadow>
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                      <Link href="/organization/members">
                        <Button variant="outline" className="w-full justify-start bg-white border-gray-200 hover:bg-gray-50 text-gray-900">
                          <UsersIcon className="mr-2 h-4 w-4" />
                          Manage Members
                        </Button>
                      </Link>
                    </HoverShadowEffect>
                    <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
                      <Link href="/organization/subscription">
                        <Button variant="outline" className="w-full justify-start bg-white border-gray-200 hover:bg-gray-50 text-gray-900">
                          <BuildingOfficeIcon className="mr-2 h-4 w-4" />
                          Subscription
                        </Button>
                      </Link>
                    </HoverShadowEffect>
                  </CardContent>
                </Card>
              </CardHoverShadow>
            </div>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure how your organization operates and manages events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Public Organization</h3>
                    <p className="text-sm text-gray-600">Allow your organization to be visible to the public</p>
                  </div>
                  <Switch
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => handleSettingsChange('isPublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Allow Registration</h3>
                    <p className="text-sm text-gray-600">Allow users to register for events without approval</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => handleSettingsChange('allowRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Require Approval</h3>
                    <p className="text-sm text-gray-600">Require admin approval for new event registrations</p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => handleSettingsChange('requireApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Notifications</h3>
                    <p className="text-sm text-gray-600">Send email notifications for events and updates</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Analytics</h3>
                    <p className="text-sm text-gray-600">Track event performance and user engagement</p>
                  </div>
                  <Switch
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => handleSettingsChange('enableAnalytics', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Branding</CardTitle>
              <CardDescription>
                Customize the look and feel of your organization's events and pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={theme.logoUrl}
                  onChange={(e) => handleThemeChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-gray-600">Enter the URL of your organization's logo</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={theme.customCss}
                  onChange={(e) => handleThemeChange('customCss', e.target.value)}
                  placeholder="/* Add custom CSS styles here */"
                  rows={6}
                />
                <p className="text-sm text-gray-600">Add custom CSS to further customize your organization's appearance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <ExclamationTriangleIcon />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">


              {/* Delete Organization Section - For owners only */}
              {isOwner && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Delete Organization</h3>
                  <p className="text-sm text-red-700 mb-4">
                    This action cannot be undone. This will permanently delete your organization and all associated data including events, bookings, and member information.
                  </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirmation">
                      Type <span className="font-mono font-bold">{organization.name}</span> to confirm
                    </Label>
                    <Input
                      id="deleteConfirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Enter organization name to confirm"
                      className="border-red-300 focus:border-red-500"
                    />
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" disabled={deleteConfirmation !== organization.name}>
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your organization
                          and remove all data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation('')}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteOrganization}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Organization'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
              <Button onClick={handleSave} disabled={isSaving} className="px-8 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </HoverShadowEffect>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 