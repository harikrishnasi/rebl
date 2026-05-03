import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface BrandRouteProps {
  children: React.ReactNode
}

export default function BrandRoute({ children }: BrandRouteProps) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setStatus('unauthorized')
        return
      }

      const userId = data.session.user.id

      // Check profile role OR existence of a brands row (handles cases where role update failed)
      const [{ data: profile }, { data: brand }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', userId).single(),
        supabase.from('brands').select('id').eq('owner_id', userId).single(),
      ])

      if (profile?.role === 'brand' || brand?.id) {
        // Also ensure profile role is set correctly for future checks
        if (brand?.id && profile?.role !== 'brand') {
          await supabase.from('profiles').update({ role: 'brand' }).eq('id', userId)
        }
        setStatus('authorized')
      } else {
        setStatus('unauthorized')
      }
    })
  }, [])

  if (status === 'loading') return null

  if (status === 'unauthorized') return <Navigate to="/brand/signup" replace />

  return <>{children}</>
}
