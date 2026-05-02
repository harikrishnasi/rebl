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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (profile?.role === 'brand') {
        setStatus('authorized')
      } else {
        setStatus('unauthorized')
      }
    })
  }, [])

  if (status === 'loading') return null

  if (status === 'unauthorized') return <Navigate to="/login" replace />

  return <>{children}</>
}
