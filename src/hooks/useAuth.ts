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
    let mounted = true;
    let subscription: any = null;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, user, error } = await AuthService.getSession()
        if (mounted && !error) {
          setSession(session)
          setUser(user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth state changes
    const setupAuthListener = async () => {
      try {
        const { data } = await AuthService.onAuthStateChange((session, user) => {
          if (mounted) {
            setSession(session)
            setUser(user)
            setLoading(false)
          }
        })
        subscription = data.subscription
      } catch (error) {
        console.error('Error setting up auth listener:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()
    setupAuthListener()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, []) // Empty dependency array is correct here

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