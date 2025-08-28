# Proper Organization Invitation System Implementation

## Overview
This document outlines the implementation of a secure organization invitation system that requires user consent before adding them to organizations.

## Database Changes Required

**Apply this SQL file first:**
```sql
frontend/create-proper-invitation-system.sql
```

This creates:
- `organization_invitations` table
- Proper invitation functions with user consent
- RLS policies for security
- Notification templates

## Frontend Changes Needed

### 1. Update Member Invitation Flow

**Current Flow (INSECURE):**
```typescript
// BAD: Directly adds users without consent
const { error } = await supabase.rpc('add_user_to_organization', {
  p_user_id: existingUser.id,
  p_organization_id: organization.id,
  p_added_by: currentUser.id,
  p_role_in_org: role
});
```

**New Flow (SECURE):**
```typescript
// GOOD: Sends invitation that requires user acceptance
const { error } = await supabase.rpc('send_organization_invitation', {
  p_organization_id: organization.id,
  p_email: inviteEmail,
  p_role: role,
  p_message: 'Welcome to our organization!'
});
```

### 2. Create Invitation Management Components

#### A. Update `frontend/src/app/organization/members/page.tsx`

Replace the `handleInviteUser` function:

```typescript
const handleInviteUser = async () => {
  if (!inviteEmail || !inviteRole || !organization) return;
  
  setIsInviting(true);
  try {
    // Send invitation instead of directly adding
    const { error } = await supabase.rpc('send_organization_invitation', {
      p_organization_id: organization.id,
      p_email: inviteEmail,
      p_role: inviteRole.toUpperCase(),
      p_message: `You've been invited to join ${organization.name}`
    });

    if (error) throw error;

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}. They will need to accept it to join the organization.`,
    });
    
    setInviteEmail('');
    setInviteRole('user');
    setShowInviteDialog(false);
    loadInvitations(); // Refresh invitations list
  } catch (error) {
    console.error('Error sending invitation:', error);
    toast({
      title: "Error",
      description: "Failed to send invitation. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsInviting(false);
  }
};
```

#### B. Create User Invitation Dashboard

Create `frontend/src/app/invitations/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  organization_id: string;
  organization_name: string;
  role: string;
  invited_by_name: string;
  message: string;
  invitation_token: string;
  expires_at: string;
  created_at: string;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_organization_invitations');
      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (token: string, orgName: string) => {
    try {
      const { error } = await supabase.rpc('accept_organization_invitation', {
        p_invitation_token: token
      });

      if (error) throw error;

      toast({
        title: "Invitation accepted",
        description: `You have joined ${orgName}!`,
      });

      // Reload invitations and redirect to organization dashboard
      await loadInvitations();
      window.location.href = '/organization/dashboard';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const handleRejectInvitation = async (token: string, orgName: string) => {
    try {
      const { error } = await supabase.rpc('reject_organization_invitation', {
        p_invitation_token: token
      });

      if (error) throw error;

      toast({
        title: "Invitation rejected",
        description: `You have declined the invitation to join ${orgName}`,
      });

      await loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Organization Invitations</h1>
      
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">No pending invitations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle>{invitation.organization_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Role:</strong> {invitation.role}</p>
                  <p><strong>Invited by:</strong> {invitation.invited_by_name}</p>
                  <p><strong>Expires:</strong> {new Date(invitation.expires_at).toLocaleDateString()}</p>
                  {invitation.message && (
                    <p><strong>Message:</strong> {invitation.message}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => handleAcceptInvitation(invitation.invitation_token, invitation.organization_name)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => handleRejectInvitation(invitation.invitation_token, invitation.organization_name)}
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Update Navigation

Add invitations link to your main navigation to show pending invitation count.

### 4. Email Integration (Optional)

For production, integrate with an email service to send actual invitation emails with links to the invitation acceptance page.

## Benefits of This Approach

1. **✅ User Consent Required** - Users must explicitly accept invitations
2. **✅ Security** - No unauthorized organization membership
3. **✅ Transparency** - Users see who invited them and why
4. **✅ Expiration** - Invitations expire after 7 days
5. **✅ Audit Trail** - Full history of invitations and responses
6. **✅ Proper UX** - Clear invitation flow with accept/reject options

## Migration Steps

1. **Apply database changes** - Run `create-proper-invitation-system.sql`
2. **Update frontend code** - Implement new invitation flow
3. **Test the system** - Verify invitations work properly
4. **Remove old direct-add code** - Clean up insecure implementation

This system ensures that users have full control over their organization membership and provides a much better user experience.
