import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

const C = {
  void: '#050508', cosmos: '#0A0A12', nebula: '#12121E', crater: '#1C1C2E',
  silver: '#A8B2C4', silverBright: '#C8D4E8', ghost: '#2A2A3E',
  cream: '#F0F4FF', dim: '#5A6380',
}

const inputStyle = {
  backgroundColor: C.nebula, color: C.cream,
  border: `1px solid ${C.ghost}`, borderRadius: 0,
  padding: '12px 14px', width: '100%', outline: 'none',
  fontSize: 14, fontFamily: '"Plus Jakarta Sans", "Plus Jakarta Sans", Inter, sans-serif',
  transition: 'border-color 0.15s', boxSizing: 'border-box',
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        const userId = data.user?.id
        const session = data.session
        if (!userId) throw new Error('Signup failed — no user returned.')
        if (session) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: userId, username, display_name: displayName })
          if (profileError) throw profileError
          navigate('/dashboard')
        } else {
          sessionStorage.setItem('rebl_pending_profile', JSON.stringify({ username, display_name: displayName }))
          toast.success('Check your email and click the confirmation link to finish signing up.')
          navigate('/login')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const userId = data.user?.id
        if (!userId) { navigate('/dashboard'); return }
        const pending = sessionStorage.getItem('rebl_pending_profile')
        if (pending) {
          try {
            const profileData = JSON.parse(pending)
            await supabase.from('profiles').upsert({ id: userId, ...profileData }, { onConflict: 'id' })
            sessionStorage.removeItem('rebl_pending_profile')
          } catch {}
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
        if (profile?.role === 'brand') navigate('/brand-dashboard')
        else navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.void, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '"Plus Jakarta Sans", "Plus Jakarta Sans", Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img src="/rebl-logo.png" alt="Rebl" style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: 4 }} />
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.25em', marginTop: 4 }}>COLLECTOR OS</div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: C.nebula, border: `1px solid ${C.ghost}`, padding: '40px 36px' }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 28 }}>
            {isSignup ? 'Create Account' : 'Sign In'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isSignup && (
              <>
                <div>
                  <label style={{ display: 'block', fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 8 }}>USERNAME</label>
                  <input
                    type="text" required autoComplete="username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="your_handle"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.silver}
                    onBlur={e => e.target.style.borderColor = C.ghost}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 8 }}>DISPLAY NAME</label>
                  <input
                    type="text" required
                    value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.silver}
                    onBlur={e => e.target.style.borderColor = C.ghost}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 8 }}>EMAIL</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.silver}
                onBlur={e => e.target.style.borderColor = C.ghost}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 8 }}>PASSWORD</label>
              <input
                type="password" required autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.silver}
                onBlur={e => e.target.style.borderColor = C.ghost}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8, backgroundColor: loading ? C.ghost : C.silver,
                color: C.void, border: 'none', padding: '14px',
                fontFamily: '"Space Mono", monospace', fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = C.silverBright }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = C.silver }}
            >
              {loading ? <><Spinner />{isSignup ? 'Creating…' : 'Signing in…'}</> : isSignup ? 'Create Account →' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim }}>
            {isSignup ? <>Already have an account?{' '}<Link to="/login" style={{ color: C.silver, textDecoration: 'none' }}>Sign in</Link></> : <>No account?{' '}<Link to="/signup" style={{ color: C.silver, textDecoration: 'none' }}>Create one</Link></>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em' }}>← BACK TO REBL</Link>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
