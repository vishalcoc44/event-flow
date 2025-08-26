'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { user, isLoading: userLoading } = useAuth();
  const { organization, isLoading: orgLoading, error } = useOrganization();
  const { organization: hookOrg, orgLoading: hookOrgLoading } = useOrganizationData();

  if (process.env.NODE_ENV !== 'development') {
    return <div className="p-8">This page is only available in development mode.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User State</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify({ 
                user,
                userLoading,
                hasUser: !!user
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Context State</CardTitle>
            <CardDescription>Direct organization context state</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify({ 
                organization,
                orgLoading,
                error,
                hasOrganization: !!organization
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Hook State</CardTitle>
            <CardDescription>useOrganizationData hook state</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify({ 
                hookOrg,
                hookOrgLoading,
                hasHookOrganization: !!hookOrg,
                isContextSameAsHook: organization?.id === hookOrg?.id
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
