'use client';

import { useState, useEffect } from 'react';
import { useOrganizationData, useOrganizationPermissions } from '@/hooks/useOrganizationData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HoverShadowEffect } from '@/components/ui/hover-shadow-effect';
import { GradientButton } from '@/components/ui/gradient-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Icons
const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5V21a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5V3.75a.75.75 0 0 0 0-1.5h-15ZM3 3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v16.5A2.25 2.25 0 0 1 18.75 22.5H5.25A2.25 2.25 0 0 1 3 20.25V3.75ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 12.008V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 12.008V12Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 12.008V12ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 15.008V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 15.008V15Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 15.008V15ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75A.75.75 0 0 1 6 18.008V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 8.25 18.008V18Zm4.5 0a.75.75 0 0 1 .75-.75h3.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-3.008a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H15A.75.75 0 0 1 14.25 18.008V18Z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

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
      // Organization loading is complete but no organization found
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

      if (error) {
        throw error;
      }
      
      setSpaces(data || []);
    } catch (error) {
      console.error('Error loading spaces:', error);
      toast({
        title: "Error",
        description: "Failed to load event spaces.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!formData.name || !formData.description || !organization) return;
    
    setIsCreating(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Generate slug from name
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
        .select()
        .single();

      if (error) throw error;
      
      setSpaces(prev => [...prev, data]);
      
      toast({
        title: "Space created",
        description: `${formData.name} has been created successfully.`,
      });
      
      setFormData({
        name: '',
        description: '',
        slug: '',
        is_public: true,
        allow_public_events: true,
        require_approval_for_events: false
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating space:', error);
      toast({
        title: "Error",
        description: "Failed to create event space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
        .eq('id', selectedSpace.id)
        .select()
        .single();

      if (error) throw error;
      
      setSpaces(prev => prev.map(space => 
        space.id === selectedSpace.id ? data : space
      ));
      
      toast({
        title: "Space updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setSelectedSpace(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        is_public: true,
        allow_public_events: true,
        require_approval_for_events: false
      });
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating space:', error);
      toast({
        title: "Error",
        description: "Failed to update event space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    
    setIsDeleting(true);
    try {
      // Use our new API function instead of direct Supabase call
      const { deleteEventSpace } = await import('../../../../api-event-space-delete-simplified');
      const result = await deleteEventSpace(selectedSpace.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete event space');
      }
      
      setSpaces(prev => prev.filter(space => space.id !== selectedSpace.id));
      
      toast({
        title: "Space deleted",
        description: `${selectedSpace.name} has been deleted successfully.`,
      });
      
      setSelectedSpace(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting space:', error);
      toast({
        title: "Error",
        description: "Failed to delete event space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSpace = (space: EventSpace) => {
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
  };

  const handleDeleteSpaceClick = (space: EventSpace) => {
    setSelectedSpace(space);
    setShowDeleteDialog(true);
  };

  if (orgLoading || initialLoading || isLoadingPermissions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organization && !orgLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Organization Found</h2>
            <p className="text-gray-600 mb-6">
              You need to be part of an organization to access event spaces.
            </p>
            <GradientButton href="/create-organization" variant="primary">
              Create Organization
            </GradientButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageEventSpaces) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to manage event spaces.</p>
            <GradientButton href="/organization/dashboard" variant="outline">
              Back to Dashboard
            </GradientButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BuildingOfficeIcon />
              Event Spaces
            </h1>
            <p className="text-gray-600 mt-2">Manage your organization's event spaces and venues</p>
          </div>
          <div className="flex items-center gap-3">
            <HoverShadowEffect className="cursor-pointer" shadowColor="rgba(0,0,0,0.1)" shadowIntensity={0.1} hoverScale={1.02} hoverLift={-1} transitionDuration={150}>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Space
              </Button>
            </HoverShadowEffect>
            <GradientButton href="/organization/dashboard" variant="outline">
              Back to Dashboard
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card key={space.id} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{space.name}</CardTitle>
                <Badge variant={space.is_public ? 'default' : 'secondary'}>
                  {space.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>
              <CardDescription>/{space.slug}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{space.description}</p>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Public Events:</span>
                  <span className="font-medium">{space.allow_public_events ? 'Allowed' : 'Not Allowed'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approval Required:</span>
                  <span className="font-medium">{space.require_approval_for_events ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-gray-500">
                  Created {new Date(space.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSpace(space)}
                  >
                    Edit
                  </Button>
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSpaceClick(space)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {spaces.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Event Spaces</h3>
                <p className="text-gray-600 mb-6">Create your first event space to get started.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create First Space
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Space Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event Space</DialogTitle>
            <DialogDescription>
              Add a new event space to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Space Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter space name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event space..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="custom-slug (auto-generated if empty)"
              />
              <p className="text-xs text-gray-500">Used for URLs. Will be auto-generated from name if left empty.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_public">Make space public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="allow_public_events"
                  type="checkbox"
                  checked={formData.allow_public_events}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_public_events: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="allow_public_events">Allow public events</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="require_approval"
                  type="checkbox"
                  checked={formData.require_approval_for_events}
                  onChange={(e) => setFormData(prev => ({ ...prev, require_approval_for_events: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="require_approval">Require approval for events</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSpace} disabled={isCreating || !formData.name || !formData.description}>
              {isCreating ? 'Creating...' : 'Create Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Space Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Space</DialogTitle>
            <DialogDescription>
              Update the event space details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Space Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter space name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description *</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event space..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSlug">URL Slug</Label>
              <Input
                id="editSlug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="custom-slug"
              />
              <p className="text-xs text-gray-500">Used for URLs.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="editIsPublic"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="editIsPublic">Make space public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="editAllowPublicEvents"
                  type="checkbox"
                  checked={formData.allow_public_events}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_public_events: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="editAllowPublicEvents">Allow public events</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="editRequireApproval"
                  type="checkbox"
                  checked={formData.require_approval_for_events}
                  onChange={(e) => setFormData(prev => ({ ...prev, require_approval_for_events: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="editRequireApproval">Require approval for events</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSpace} disabled={isUpdating || !formData.name || !formData.description}>
              {isUpdating ? 'Updating...' : 'Update Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Space Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event Space</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSpace?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSpace}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 