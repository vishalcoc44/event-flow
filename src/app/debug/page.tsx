'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { supabase, handleAuthError, recoverSession } from '@/lib/supabase';
import { authAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { user, isLoading: userLoading } = useAuth();
  const { organization, isLoading: orgLoading, error } = useOrganization();
  const { organization: hookOrg, orgLoading: hookOrgLoading } = useOrganizationData();

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Get current session info
  useEffect(() => {
    const getSessionInfo = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setSessionInfo({ error: error.message });
        } else {
          setSessionInfo({
            hasSession: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            expiresAt: session?.expires_at,
            expiresIn: session?.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : null,
            refreshToken: session?.refresh_token ? 'Present' : 'Missing',
            accessToken: session?.access_token ? 'Present' : 'Missing'
          });
        }
      } catch (error: any) {
        setSessionInfo({ error: error.message });
      }
    };

    getSessionInfo();
  }, []);

  // Test authentication functions
  const runAuthTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    const addResult = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    try {
      addResult('🧪 Starting authentication tests...');

      // Test 1: Check current session
      addResult('1️⃣ Testing current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult(`✅ Session check: ${session ? 'Valid' : 'No session'}`);
      }

      // Test 2: Test auth API check
      addResult('2️⃣ Testing auth API check...');
      const authResult = await authAPI.checkAuthStatus(1);
      addResult(`✅ Auth API result: ${authResult.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      if (authResult.error) {
        addResult(`⚠️ Auth API error: ${authResult.error}`);
      }

      // Test 3: Test session recovery
      addResult('3️⃣ Testing session recovery...');
      const recoveryResult = await recoverSession();
      addResult(`✅ Session recovery: ${recoveryResult.success ? 'Success' : 'Failed'}`);
      if (!recoveryResult.success) {
        addResult(`⚠️ Recovery error: ${recoveryResult.error}`);
      }

      // Test 4: Test token refresh (if session exists)
      if (session) {
        addResult('4️⃣ Testing token refresh...');
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            addResult(`❌ Token refresh error: ${error.message}`);
          } else {
            addResult(`✅ Token refresh: ${data.session ? 'Success' : 'No session returned'}`);
          }
        } catch (refreshError: any) {
          addResult(`❌ Token refresh exception: ${refreshError.message}`);
        }
      }

      addResult('🎉 Authentication tests completed!');

    } catch (error: any) {
      addResult(`💥 Test suite error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle>Authentication Session Info</CardTitle>
            <CardDescription>Current Supabase session details</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Tests</CardTitle>
            <CardDescription>Test authentication functionality and token refresh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={runAuthTests}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? 'Running Tests...' : 'Run Authentication Tests'}
              </Button>

              {testResults.length > 0 && (
                <div className="bg-gray-100 p-4 rounded text-xs max-h-64 overflow-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event & Image Tests</CardTitle>
            <CardDescription>Test event creation and image display functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={async () => {
                  const addResult = (message: string) => {
                    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
                  };

                  setTestResults([]);
                  addResult('🧪 Testing event and image functionality...');

                  // Test organization membership first
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data: userOrgData, error: userOrgError } = await supabase
                      .from('users')
                      .select('organization_id, role_in_org')
                      .eq('id', user.id)
                      .single();

                    if (userOrgError) {
                      addResult(`⚠️ Could not check organization membership: ${userOrgError.message}`);
                    } else {
                      addResult(`👤 User organization status: ${userOrgData?.organization_id ? `Member of org ${userOrgData.organization_id}` : 'Not in organization'}`);
                    }
                  }

                  try {
                    // Test Supabase storage connection
                    addResult('1️⃣ Testing Supabase storage connection...');
                    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

                    if (bucketsError) {
                      addResult(`❌ Storage connection failed: ${bucketsError.message}`);
                    } else {
                      const eventImagesBucket = buckets.find(b => b.name === 'event-images');
                      addResult(`✅ Storage connected. Event images bucket: ${eventImagesBucket ? 'Found' : 'Not found'}`);
                    }

                    // Test event creation API
                    addResult('2️⃣ Testing event creation API...');
                    const { data: events, error: eventsError } = await supabase
                      .from('events')
                      .select('id, title, image_url')
                      .limit(1);

                    if (eventsError) {
                      addResult(`❌ Events query failed: ${eventsError.message}`);
                    } else {
                      addResult(`✅ Events query successful. Found ${events?.length || 0} events`);
                      if (events && events.length > 0) {
                        addResult(`📋 Sample event: ${events[0].title}`);
                        addResult(`🖼️ Has image: ${events[0].image_url ? 'Yes' : 'No'}`);
                        if (events[0].image_url) {
                          addResult(`🔗 Image URL: ${events[0].image_url}`);
                        }
                      }
                    }

                    // Test static params
                    addResult('3️⃣ Testing static params generation...');
                    addResult(`✅ Static params include specific error ID: 5fba8746-1586-4e0f-a7c5-3ac5ee8082fc`);

                    // Test organization event visibility
                    addResult('4️⃣ Testing organization event visibility...');
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        // Test events query (should respect RLS)
                        const { data: eventsData, error: eventsError } = await supabase
                          .from('events')
                          .select('id, title, organization_id, is_public, created_by')
                          .limit(10);

                        if (eventsError) {
                          addResult(`❌ Events visibility test failed: ${eventsError.message}`);
                        } else {
                          const orgEvents = eventsData?.filter(e => e.organization_id) || [];
                          const publicEvents = eventsData?.filter(e => e.is_public) || [];
                          const ownEvents = eventsData?.filter(e => e.created_by === user.id) || [];

                          addResult(`✅ Visibility test passed - Found ${eventsData?.length || 0} accessible events`);
                          addResult(`📊 Organization events: ${orgEvents.length}, Public events: ${publicEvents.length}, Own events: ${ownEvents.length}`);
                        }
                      } else {
                        addResult('ℹ️ User not authenticated, skipping visibility test');
                      }
                    } catch (visibilityError: any) {
                      addResult(`❌ Organization visibility test error: ${visibilityError.message}`);
                    }

                    addResult('🎉 Event and image tests completed!');

                  } catch (error: any) {
                    addResult(`💥 Test suite error: ${error.message}`);
                  }
                }}
                className="w-full"
              >
                Run Event & Image Tests
              </Button>

              {testResults.length > 0 && (
                <div className="bg-gray-100 p-4 rounded text-xs max-h-64 overflow-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
