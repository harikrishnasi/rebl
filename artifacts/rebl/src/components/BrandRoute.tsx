import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface BrandRouteProps {
  children: React.ReactNode
}

export default function BrandRoute({ children }: BrandRouteProps) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    async function checkAuth(userId: string) {
      const [{ data: profile }, { data: brand }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', userId).single(),
        supabase.from('brands').select('id').eq('owner_id', userId).single(),
      ])

      if (profile?.role === 'brand' || brand?.id) {
        if (brand?.id && profile?.role !== 'brand') {
          await supabase.from('profiles').update({ role: 'brand' }).eq('id', userId)
        }
        setStatus('authorized')
      } else {
        setStatus('unauthorized')
      }
    }

    // Use auth state change so we catch the session immediately after login navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setStatus('unauthorized')
      } else {
        checkAuth(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') return null

  if (status === 'unauthorized') return <Navigate to="/brand/signup" replace />

  return <>{children}</>
}
