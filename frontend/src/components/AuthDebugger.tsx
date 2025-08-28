'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

/**
 * Debug component for troubleshooting authentication issues
 * Only shows in development mode
 */
export default function AuthDebugger() {
  const { user, clearInvalidSession, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const runDiagnostics = async () => {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        currentUser: user,
        isLoading,
        localStorage: {} as any,
        sessionStorage: {} as any,
        supabaseSession: null as any,
        authState: null as any
      }

      // Check localStorage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            diagnostics.localStorage[key] = localStorage.getItem(key)?.substring(0, 50) + '...'
          }
        })

        // Check sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          diagnostics.sessionStorage[key] = sessionStorage.getItem(key)
        })
      }

      // Check Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      diagnostics.supabaseSession = {
        hasSession: !!sessionData.session,
        sessionError: sessionError?.message,
        userId: sessionData.session?.user?.id,
        expiresAt: sessionData.session?.expires_at
      }

      // Check auth state
      const { data: userData, error: userError } = await supabase.auth.getUser()
      diagnostics.authState = {
        hasUser: !!userData.user,
        userError: userError?.message,
        userId: userData.user?.id,
        email: userData.user?.email
      }

      setDebugInfo(diagnostics)
    } catch (error) {
      console.error('Diagnostics error:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm"
      >
        🔧 Auth Debug
      </button>

      {isVisible && (
        <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Auth Diagnostics</h3>
            <button
              onClick={runDiagnostics}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              🔄 Run Diagnostics
            </button>
          </div>

          {debugInfo && (
            <div className="space-y-3 text-sm">
              <div>
                <strong>Current User:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Supabase Session:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.supabaseSession, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Auth State:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.authState, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Storage Keys:</strong>
                <div className="space-y-1">
                  <div>LocalStorage: {Object.keys(debugInfo.localStorage).length} auth keys</div>
                  <div>SessionStorage: {Object.keys(debugInfo.sessionStorage).length} auth keys</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearInvalidSession}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                >
                  Clear Invalid Session
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!debugInfo && (
            <p className="text-gray-600 text-sm">Click "Run Diagnostics" to check auth state</p>
          )}
        </div>
      )}
    </div>
  )
}
