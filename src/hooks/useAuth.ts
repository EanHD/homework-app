import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthService, AuthSession } from '../services/supabase'

export interface UseAuthReturn {
  user: User | null
  session: AuthSession | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useAuth: effect running')
    
    // Simple initial session check without listener for now
    const checkSession = async () => {
      try {
        console.log('useAuth: checking session...')
        const { session, user, error } = await AuthService.getSession()
        
        console.log('useAuth: session result:', { hasSession: !!session, hasUser: !!user, error })
        
        setSession(session)
        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error('useAuth: error checking session:', error)
        setLoading(false)
      }
    }

    checkSession()

    // TODO: Re-enable auth listener once infinite loop is fixed
    // For now, just do initial check
    
  }, []) // Empty dependency array

  const signInWithMagicLink = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await AuthService.signInWithMagicLink(email)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true)
    try {
      const { error } = await AuthService.signInWithOAuth(provider)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await AuthService.signOut()
      if (!error) {
        setSession(null)
        setUser(null)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signInWithMagicLink,
    signInWithOAuth,
    signOut
  }
}