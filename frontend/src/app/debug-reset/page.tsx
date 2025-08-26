"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DebugResetContent() {
  const searchParams = useSearchParams()
  
  const allParams: Record<string, string> = {}
  searchParams?.forEach((value, key) => {
    allParams[key] = value
  })

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Password Reset Debug Page</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="font-semibold mb-2">Current URL:</h2>
          <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}</p>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <h2 className="font-semibold mb-2">URL Parameters:</h2>
          {Object.keys(allParams).length > 0 ? (
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(allParams, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">No URL parameters found</p>
          )}
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Expected Parameters for Password Reset:</h2>
          <ul className="text-sm space-y-1">
            <li>• <strong>access_token:</strong> JWT token for authentication</li>
            <li>• <strong>refresh_token:</strong> Token for refreshing the session</li>
            <li>• <strong>type:</strong> Should be "recovery"</li>
          </ul>
        </div>

        <div className="mt-6">
          <a href="/reset-password" className="text-blue-600 underline mr-4">Go to Reset Password Page</a>
          <a href="/login" className="text-blue-600 underline">Go to Login Page</a>
        </div>
      </div>
    </div>
  )
}

export default function DebugResetPage() {
  return (
    <Suspense fallback={<div>Loading debug info...</div>}>
      <DebugResetContent />
    </Suspense>
  )
}
