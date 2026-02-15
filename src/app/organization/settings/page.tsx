'use client';

import { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { organizationAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GlassTile } from '@/components/ui/glass-tile';
import {
  Settings,
  Building2,
  Palette,
  ShieldAlert,
  Trash2,
  Save,
  Globe,
  UserPlus,
  Bell,
  BarChart,
  ChevronRight,
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function OrganizationSettings() {
  const { organization, orgLoading, updateOrganization } = useOrganizationData();
  const { isOwner, isAdmin } = useOrganizationPermissions();
  const { user } = useAuth();
  const { loadOrganization } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();

  const canAccessSettings = isOwner || isAdmin;

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
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website_url || '',
        email: organization.contact_email || '',
        phone: organization.contact_phone || '',
        address: organization.address || ''
      });
      setSettings({
        isPublic: organization.is_public ?? true,
        allowRegistration: organization.allow_user_registration ?? true,
        requireApproval: organization.require_approval_for_events ?? false,
        enableNotifications: true,
        enableAnalytics: true
      });
      setTheme({
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        logoUrl: organization.logo_url || '',
        customCss: ''
      });
    }
  }, [organization]);


  const handleDeleteOrganization = async () => {
    if (!organization || deleteConfirmation !== organization.name) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_organization', {
        p_organization_id: organization.id
      });

      if (error) throw error;

      toast({ title: "Organization Deleted", description: "The organization has been successfully removed." });
      router.push('/dashboard');
    } catch (error) {
      toast({ title: "Deletion Failed", description: "There was an error deleting the organization.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
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
      toast({ title: "Settings Saved", description: "Organization settings updated successfully." });
    } catch (error) {
      toast({ title: "Save Failed", description: "There was an error saving your changes. Please try again.", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-32 px-4">
        <div className="container mx-auto max-w-6xl animate-pulse">
          <div className="h-16 bg-white/5 rounded-3xl w-64 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              <div className="h-96 bg-white/5 rounded-3xl" />
              <div className="h-96 bg-white/5 rounded-3xl" />
            </div>
            <div className="md:col-span-4 h-96 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassTile className="p-16 max-w-md text-center" interactive={false}>
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">Access Denied.</h2>
          <p className="text-neutral-500 mb-10 font-medium leading-relaxed">
            You do not have permission to modify this organization's settings.
          </p>
          <Button asChild className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight w-full">
            <Link href="/organization/dashboard">Return to Dashboard</Link>
          </Button>
        </GlassTile>
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

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Settings className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Settings</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 leading-[0.9]">
                Organization Settings.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Manage settings for {organization?.name}
              </p>
            </div>

            <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 transition-all">
              <Link href="/organization/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            </Button>
          </motion.div>

          <Tabs defaultValue="general" className="space-y-12">
            <TabsList className="flex gap-2 bg-neutral-100 dark:bg-white/5 p-2 rounded-3xl w-fit backdrop-blur-md">
              <TabsTrigger value="general" className="h-12 px-6 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-xl transition-all">General</TabsTrigger>
              <TabsTrigger value="governance" className="h-12 px-6 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-xl transition-all">Policy</TabsTrigger>
              <TabsTrigger value="appearance" className="h-12 px-6 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-xl transition-all">Appearance</TabsTrigger>
              <TabsTrigger value="security" className="h-12 px-6 rounded-2xl font-black tracking-tighter uppercase text-[10px] data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <GlassTile className="p-10" interactive={false}>
                    <h3 className="text-2xl font-black tracking-tighter mb-8 bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-white/50 bg-clip-text text-transparent">General Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Organization Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Contact Email</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Public Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="min-h-[140px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold p-6 leading-relaxed"
                        />
                      </div>
                    </div>
                  </GlassTile>

                  <GlassTile className="p-10" interactive={false}>
                    <h3 className="text-2xl font-black tracking-tighter mb-8 bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-white/50 bg-clip-text text-transparent">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Website</Label>
                        <Input
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Phone Number</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Address</Label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="min-h-[100px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold p-6 leading-relaxed"
                        />
                      </div>
                    </div>
                  </GlassTile>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <GlassTile className="p-8" interactive={false}>
                    <h3 className="text-xl font-black tracking-tighter mb-6 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" /> Organization Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black uppercase tracking-tighter text-[10px]">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Created On</span>
                        <span className="text-sm font-black">{organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Events</span>
                        <span className="text-sm font-black">{organization?.current_events_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Organization Size</span>
                        <span className="text-sm font-black">{organization?.current_users_count || 0} Members</span>
                      </div>
                    </div>
                  </GlassTile>

                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                    <h4 className="text-xl font-black tracking-tighter mb-4">Organization Owner.</h4>
                    <p className="text-white/60 text-xs font-bold leading-relaxed mb-8 truncate">
                      Created: {organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                    <Button asChild variant="ghost" className="w-full h-12 rounded-xl bg-white/20 text-white font-black uppercase tracking-widest text-[10px]">
                      <Link href="/organization/subscription">View Plan</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="governance">
              <GlassTile className="p-10" interactive={false}>
                <h3 className="text-2xl font-black tracking-tighter mb-12">Organization Policy</h3>
                <div className="space-y-12">
                  {[
                    { id: 'isPublic', label: 'Public Profile', desc: 'Show your organization on the public marketplace.', icon: Globe },
                    { id: 'allowRegistration', label: 'Allow Member Registration', desc: 'Allow new members to join without an invitation.', icon: UserPlus },
                    { id: 'requireApproval', label: 'Event Approval', desc: 'Require admin approval for events created in this organization.', icon: ShieldCheck },
                    { id: 'enableNotifications', label: 'Email Notifications', desc: 'Send email alerts for important organization updates.', icon: Bell },
                    { id: 'enableAnalytics', label: 'Performance Analytics', desc: 'Enable detailed analytics for your events.', icon: BarChart }
                  ].map((protocol) => (
                    <div key={protocol.id} className="flex items-center justify-between group">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-3xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all border border-transparent group-hover:border-blue-500/20">
                          <protocol.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black tracking-tight">{protocol.label}</h4>
                          <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-sm">{protocol.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(settings as any)[protocol.id]}
                        onCheckedChange={(val) => setSettings({ ...settings, [protocol.id]: val })}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </GlassTile>
            </TabsContent>

            <TabsContent value="appearance">
              <GlassTile className="p-10" interactive={false}>
                <h3 className="text-2xl font-black tracking-tighter mb-12">Appearance Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <ImageUpload
                        value={theme.logoUrl}
                        onChange={(url) => setTheme({ ...theme, logoUrl: url })}
                        label="Organization Logo"
                        className="mb-8"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Primary Color</Label>
                        <div className="flex gap-3">
                          <div className="h-14 w-14 rounded-2xl shrink-0 border border-white/10 overflow-hidden">
                            <input
                              type="color"
                              value={theme.primaryColor}
                              onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                              className="w-[120%] h-[120%] cursor-pointer border-none p-0 scale-125 translate-x-[-10%] translate-y-[-10%]"
                            />
                          </div>
                          <Input
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                            className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-black px-4 uppercase text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Secondary Color</Label>
                        <div className="flex gap-3">
                          <div className="h-14 w-14 rounded-2xl shrink-0 border border-white/10 overflow-hidden">
                            <input
                              type="color"
                              value={theme.secondaryColor}
                              onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                              className="w-[120%] h-[120%] cursor-pointer border-none p-0 scale-125 translate-x-[-10%] translate-y-[-10%]"
                            />
                          </div>
                          <Input
                            value={theme.secondaryColor}
                            onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                            className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-black px-4 uppercase text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Design Preview</Label>
                    <div className="aspect-video rounded-3xl bg-neutral-900/10 border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden group">
                      <div
                        className="absolute inset-0 opacity-20 blur-3xl scale-110"
                        style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                      />
                      {theme.logoUrl ? (
                        <img src={theme.logoUrl} className="h-1/2 w-1/2 object-contain relative z-10" />
                      ) : (
                        <div className="text-center relative z-10">
                          <Palette className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Preview Ready</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassTile>
            </TabsContent>

            <TabsContent value="security">
              <GlassTile className="p-10 border-red-500/20" interactive={false}>
                <h3 className="text-2xl font-black tracking-tighter mb-4 text-red-500 flex items-center gap-3">
                  <ShieldAlert className="h-7 w-7" /> Danger Zone
                </h3>
                <p className="text-neutral-500 font-medium mb-12 max-w-lg">
                  Warning: These actions are permanent. Please use caution.
                </p>

                {isOwner && (
                  <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 space-y-8">
                    <div>
                      <h4 className="text-xl font-black tracking-tight text-red-600 mb-2">Delete Organization</h4>
                      <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-lg">
                        Deleting this organization will permanently remove all associated data, including events and member records.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-red-600/60">Authentication Required</Label>
                      <p className="text-sm font-bold">Type <span className="text-red-500 underline">{organization?.name}</span> to authorize</p>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="h-14 rounded-2xl bg-red-500/5 border-red-500/20 font-black px-6 focus:ring-red-500"
                        placeholder="Type Organization Name"
                      />

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={deleteConfirmation !== organization?.name}
                            className="w-full h-14 rounded-2xl font-black tracking-tight shadow-xl shadow-red-500/20"
                          >
                            <Trash2 className="h-5 w-5 mr-2" /> Delete Organization
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl border-red-500/20 backdrop-blur-xl bg-background/80">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-red-600">Confirm Deletion.</DialogTitle>
                            <DialogDescription className="font-bold text-neutral-500">
                              This action cannot be undone. All data related to {organization?.name} will be permanently deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-4">
                            <Button variant="ghost" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setDeleteConfirmation('')}>Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteOrganization}
                              className="h-12 px-8 rounded-2xl font-black tracking-tight"
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </GlassTile>
            </TabsContent>
          </Tabs>

          {/* Tactical Footer / Save Button */}
          <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Organization Dashboard v1.0
            </p>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-16 px-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight hover:scale-[1.02] transition-all shadow-2xl flex items-center gap-3"
            >
              {isSaving ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}