import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook for handling authentication errors throughout the app
 * Provides utilities for common auth error scenarios
 */
export const useAuthErrorHandler = () => {
  const { clearInvalidSession } = useAuth()

  const handleAuthError = useCallback(async (error: any) => {
    // Check if it's a refresh token error
    if (error?.message?.includes('Invalid Refresh Token') ||
        error?.message?.includes('Refresh Token Not Found') ||
        error?.message?.includes('refresh_token_not_found')) {

      await clearInvalidSession()

      return {
        type: 'REFRESH_TOKEN_ERROR',
        handled: true,
        message: 'Your session has expired. Please log in again.',
        action: 'redirect_to_login'
      }
    }

    // Check for other common auth errors
    if (error?.message?.includes('Email not confirmed')) {
      return {
        type: 'EMAIL_NOT_CONFIRMED',
        handled: true,
        message: 'Please check your email and click the confirmation link.',
        action: 'show_message'
      }
    }

    if (error?.message?.includes('Invalid login credentials')) {
      return {
        type: 'INVALID_CREDENTIALS',
        handled: true,
        message: 'Invalid email or password. Please try again.',
        action: 'show_message'
      }
    }

    // Generic error
    return {
      type: 'GENERIC_ERROR',
      handled: false,
      message: error?.message || 'An authentication error occurred.',
      action: 'show_message'
    }
  }, [clearInvalidSession])

  const isRefreshTokenError = useCallback((error: any) => {
    return error?.message?.includes('Invalid Refresh Token') ||
           error?.message?.includes('Refresh Token Not Found') ||
           error?.message?.includes('refresh_token_not_found')
  }, [])

  return {
    handleAuthError,
    isRefreshTokenError,
    clearInvalidSession
  }
}

export default useAuthErrorHandler
