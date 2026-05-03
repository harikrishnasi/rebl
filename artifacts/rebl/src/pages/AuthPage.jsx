import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

const T = {
  bg: '#000000', surface: '#080808', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const inputStyle = {
  backgroundColor: T.bg, color: T.white, border: `1px solid ${T.borderVis}`,
  padding: '13px 16px', width: '100%', outline: 'none',
  fontSize: 14, fontFamily: BODY, transition: 'border-color 0.15s',
  boxSizing: 'border-box', borderRadius: 0,
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
          const { error: profileError } = await supabase.from('profiles').insert({ id: userId, username, display_name: displayName })
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
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: BODY }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 40, color: T.white, letterSpacing: '-1px', lineHeight: 1 }}>Rēbl</div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: T.card, border: `1px solid ${T.borderVis}`, padding: '44px 40px' }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 11, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 32 }}>
            {isSignup ? 'Create Account' : 'Sign In'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {isSignup && (
              <>
                <div>
                  <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>Username</label>
                  <input type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="your_handle"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = T.white}
                    onBlur={e => e.target.style.borderColor = T.borderVis}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>Display Name</label>
                  <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your Name"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = T.white}
                    onBlur={e => e.target.style.borderColor = T.borderVis}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>Email</label>
              <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.white}
                onBlur={e => e.target.style.borderColor = T.borderVis}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>Password</label>
              <input type="password" required autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.white}
                onBlur={e => e.target.style.borderColor = T.borderVis}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: 8, backgroundColor: loading ? T.grayMid : T.white,
              color: T.bg, border: 'none', padding: '15px',
              fontFamily: BODY, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#D0D0D0' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = T.white }}
            >
              {loading ? <><Spinner />{isSignup ? 'Creating…' : 'Signing in…'}</> : isSignup ? 'Create Account →' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 28, textAlign: 'center', fontFamily: BODY, fontSize: 13, color: T.grayMid }}>
            {isSignup
              ? <>Already have an account?{' '}<Link to="/login" style={{ color: T.white, textDecoration: 'none' }}>Sign in</Link></>
              : <>No account?{' '}<Link to="/signup" style={{ color: T.white, textDecoration: 'none' }}>Create one</Link></>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/" style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Back to Rebl</Link>
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
