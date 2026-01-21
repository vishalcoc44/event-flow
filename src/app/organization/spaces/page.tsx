'use client';

import { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { GlassTile } from '@/components/ui/glass-tile';
import {
  Layout,
  Plus,
  Trash2,
  ArrowLeft,
  Globe,
  Lock,
  Settings2,
  MapPin,
  Layers,
  Sparkles,
  ChevronRight,
  Search,
  ShieldAlert,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventSpace {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  slug: string;
  created_by: string;
  is_public: boolean;
  allow_public_events: boolean;
  require_approval_for_events: boolean;
  created_at: string;
  updated_at: string;
}

export default function OrganizationSpaces() {
  const { organization, orgLoading } = useOrganizationData();
  const { canManageEventSpaces, isOwner, isLoadingPermissions } = useOrganizationPermissions();
  const { toast } = useToast();
  const { user } = useAuth();

  const [spaces, setSpaces] = useState<EventSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    is_public: true,
    allow_public_events: true,
    require_approval_for_events: false
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<EventSpace | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (organization) {
      loadSpaces();
    } else if (!orgLoading) {
      setInitialLoading(false);
    }
  }, [organization, orgLoading]);

  const loadSpaces = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_spaces')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      toast({ title: "Signal Loss", description: "Failed to pull spatial data from the grid.", variant: "destructive" });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!formData.name || !formData.description || !organization) return;
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await supabase
        .from('event_spaces')
        .insert({
          organization_id: organization.id,
          name: formData.name,
          description: formData.description,
          slug: slug,
          created_by: user.id,
          is_public: formData.is_public,
          allow_public_events: formData.allow_public_events,
          require_approval_for_events: formData.require_approval_for_events
        })
        .select().single();
      if (error) throw error;
      setSpaces(prev => [data, ...prev]);
      toast({ title: "Domain Initialized", description: `${formData.name} is now projected in the grid.` });
      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      toast({ title: "Initialization Failure", description: "Error during domain projection.", variant: "destructive" });
    } finally { setIsCreating(false); }
  };

  const handleUpdateSpace = async () => {
    if (!selectedSpace || !formData.name || !formData.description) return;
    setIsUpdating(true);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await supabase
        .from('event_spaces')
        .update({
          name: formData.name,
          description: formData.description,
          slug: slug,
          is_public: formData.is_public,
          allow_public_events: formData.allow_public_events,
          require_approval_for_events: formData.require_approval_for_events,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSpace.id).select().single();
      if (error) throw error;
      setSpaces(prev => prev.map(s => s.id === selectedSpace.id ? data : s));
      toast({ title: "Matrix Updated", description: "Domain configuration synchronized." });
      resetForm();
      setShowEditDialog(false);
    } catch (error) {
      toast({ title: "Update Failed", description: "Network interference during sync.", variant: "destructive" });
    } finally { setIsUpdating(false); }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-event-space', {
        body: { spaceId: selectedSpace.id }
      });
      if (error || !data?.success) throw new Error(error?.message || data?.error || 'Failed to delete');
      setSpaces(prev => prev.filter(s => s.id !== selectedSpace.id));
      toast({ title: "Domain Erased", description: "Target domain has been purged from the matrix." });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({ title: "Purge Error", description: "Domain integrity protected. Manual intervention required.", variant: "destructive" });
    } finally { setIsDeleting(false); }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', slug: '', is_public: true, allow_public_events: true, require_approval_for_events: false });
    setSelectedSpace(null);
  };

  if (orgLoading || initialLoading || isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-32 px-4 animate-pulse">
        <div className="container mx-auto max-w-6xl">
          <div className="h-16 bg-white/5 rounded-3xl w-1/4 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organization || !canManageEventSpaces) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassTile className="p-16 max-w-md text-center" interactive={false}>
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4">Access Restricted.</h2>
          <p className="text-neutral-500 mb-10 font-medium leading-relaxed">
            You do not possess the clearance to manage spatial domains.
          </p>
          <Button asChild className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black tracking-tight w-full">
            <Link href="/organization/dashboard">Return to Hub</Link>
          </Button>
        </GlassTile>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Header user={user ? { role: user.role === 'USER' ? 'customer' : user.role } : null} />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Layout className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">Spatial Domains</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
                The Domains.
              </h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
                Experience Architecture / {organization.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => { resetForm(); setShowCreateDialog(true); }}
                className="h-14 px-8 rounded-2xl gap-3 font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all border-0"
              >
                <Plus className="h-4 w-4" /> Initialize Domain
              </Button>
              <Button asChild variant="ghost" className="h-14 px-6 rounded-2xl gap-3 font-bold uppercase tracking-widest text-[10px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
                <Link href="/organization/dashboard"><ArrowLeft className="h-4 w-4" /> Hub</Link>
              </Button>
            </div>
          </motion.div>

          {/* Spaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {spaces.map((space, index) => (
                <motion.div
                  key={space.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <GlassTile className="h-full flex flex-col p-8 group" interactive={true}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Layers className="h-6 w-6" />
                      </div>
                      <Badge className={cn(
                        "px-3 h-6 rounded-lg font-black uppercase tracking-widest text-[8px] border-0",
                        space.is_public ? "bg-blue-500/10 text-blue-500" : "bg-neutral-500/10 text-neutral-400"
                      )}>
                        {space.is_public ? 'Public Domain' : 'Restricted'}
                      </Badge>
                    </div>

                    <div className="flex-grow space-y-3">
                      <h3 className="text-2xl font-black tracking-tighter uppercase group-hover:text-blue-500 transition-colors">
                        {space.name}
                      </h3>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                        /{space.slug}
                      </p>
                      <p className="text-neutral-500 font-medium text-sm leading-relaxed line-clamp-3">
                        {space.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">Exposure</span>
                          <div className="flex items-center gap-1">
                            {space.is_public ? <Globe className="h-3 w-3 text-blue-500" /> : <Lock className="h-3 w-3 text-neutral-500" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{space.is_public ? 'Global' : 'Private'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl hover:bg-white/10 transition-all"
                          onClick={() => {
                            setSelectedSpace(space);
                            setFormData({
                              name: space.name,
                              description: space.description,
                              slug: space.slug,
                              is_public: space.is_public,
                              allow_public_events: space.allow_public_events,
                              require_approval_for_events: space.require_approval_for_events
                            });
                            setShowEditDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                            onClick={() => {
                              setSelectedSpace(space);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassTile>
                </motion.div>
              ))}
            </AnimatePresence>

            {spaces.length === 0 && (
              <div className="col-span-full">
                <GlassTile className="p-32 text-center" interactive={false}>
                  <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-300 dark:text-white/10 mx-auto mb-8">
                    <MapPin className="h-10 w-10" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase">Void Detected.</h3>
                  <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-10">
                    No spatial domains have been initialized for this collective.
                  </p>
                  <Button
                    onClick={() => { resetForm(); setShowCreateDialog(true); }}
                    className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20"
                  >
                    Initialize First Domain
                  </Button>
                </GlassTile>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tighter">Domain Initialization.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500 uppercase tracking-widest text-[10px]">Projecting new experience architecture into the matrix.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Domain Designation</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Virtual Zenith"
                  className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">URL Slug-Link</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-sync"
                  className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Spatial Manifest (Description)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Define the domain's operational purpose..."
                className="min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-medium p-6"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Public Domain</span>
                <input type="checkbox" checked={formData.is_public} onChange={(e) => setFormData(p => ({ ...p, is_public: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Public Events</span>
                <input type="checkbox" checked={formData.allow_public_events} onChange={(e) => setFormData(p => ({ ...p, allow_public_events: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Pre-Approval</span>
                <input type="checkbox" checked={formData.require_approval_for_events} onChange={(e) => setFormData(p => ({ ...p, require_approval_for_events: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Abort</Button>
            <Button
              onClick={handleCreateSpace}
              disabled={isCreating || !formData.name}
              className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20"
            >
              {isCreating ? "Initializing..." : "Commit Domain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-3xl border-white/20 backdrop-blur-2xl bg-background/80 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tighter">Domain Calibration.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500 uppercase tracking-widest text-[10px]">Updating spatial coordinates and protocol.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Domain Designation</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">URL Slug-Link</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-bold px-6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-50">Spatial Manifest (Description)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="min-h-[120px] rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 font-medium p-6"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Public Domain</span>
                <input type="checkbox" checked={formData.is_public} onChange={(e) => setFormData(p => ({ ...p, is_public: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Public Events</span>
                <input type="checkbox" checked={formData.allow_public_events} onChange={(e) => setFormData(p => ({ ...p, allow_public_events: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">Pre-Approval</span>
                <input type="checkbox" checked={formData.require_approval_for_events} onChange={(e) => setFormData(p => ({ ...p, require_approval_for_events: e.target.checked }))} className="w-5 h-5 rounded accent-blue-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-8">
            <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button
              onClick={handleUpdateSpace}
              disabled={isUpdating || !formData.name}
              className="h-14 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest"
            >
              {isUpdating ? "Calibrating..." : "Synchronize"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-3xl border-red-500/20 backdrop-blur-2xl bg-background/80">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tighter text-red-500">Purge Sequence.</DialogTitle>
            <DialogDescription className="font-bold text-neutral-500 uppercase tracking-widest text-[10px]">Permanently remove "{selectedSpace?.name}" from experience grid?</DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 mb-6">
            <p className="text-red-500 text-xs font-bold leading-relaxed">
              WARNING: This operation will severe all event associations and cannot be recovered. Ensure all operational data has been extracted.
            </p>
          </div>
          <DialogFooter className="gap-4">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Abort</Button>
            <Button
              onClick={handleDeleteSpace}
              disabled={isDeleting}
              variant="destructive"
              className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20"
            >
              {isDeleting ? "Erasing..." : "Confirm Purge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}