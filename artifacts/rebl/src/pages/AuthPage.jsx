import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

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
          // Email confirmation is OFF — session is live, insert profile now
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: userId, username, display_name: displayName })
          if (profileError) throw profileError
          navigate('/dashboard')
        } else {
          // Email confirmation is ON — stash the profile data, user must confirm first
          sessionStorage.setItem(
            'rebl_pending_profile',
            JSON.stringify({ username, display_name: displayName })
          )
          toast.success('Check your email and click the confirmation link to finish signing up.')
          navigate('/login')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const userId = data.user?.id
        if (!userId) { navigate('/dashboard'); return }

        // If there's a pending profile from email-confirmed signup, create it now
        const pending = sessionStorage.getItem('rebl_pending_profile')
        if (pending) {
          try {
            const profileData = JSON.parse(pending)
            await supabase
              .from('profiles')
              .upsert({ id: userId, ...profileData }, { onConflict: 'id' })
            sessionStorage.removeItem('rebl_pending_profile')
          } catch (_) {
            // non-fatal — profile may already exist
          }
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (profile?.role === 'brand') {
          navigate('/brand-dashboard')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      <div
        className="w-full rounded-2xl p-8"
        style={{ maxWidth: 400, backgroundColor: '#16162A' }}
      >
        <h1
          className="text-3xl font-bold text-center mb-8 tracking-tight"
          style={{ color: '#F1FAEE' }}
        >
          Rebl
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignup && (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#8D99AE' }}
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_handle"
                  style={{
                    backgroundColor: '#0F0F1A',
                    color: '#F1FAEE',
                    border: '1px solid #2a2a3e',
                    borderRadius: 8,
                    padding: '10px 14px',
                    width: '100%',
                    outline: 'none',
                    fontSize: 15,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#E63946')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#8D99AE' }}
                  htmlFor="displayName"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  style={{
                    backgroundColor: '#0F0F1A',
                    color: '#F1FAEE',
                    border: '1px solid #2a2a3e',
                    borderRadius: 8,
                    padding: '10px 14px',
                    width: '100%',
                    outline: 'none',
                    fontSize: 15,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#E63946')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
                />
              </div>
            </>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: '#8D99AE' }}
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                backgroundColor: '#0F0F1A',
                color: '#F1FAEE',
                border: '1px solid #2a2a3e',
                borderRadius: 8,
                padding: '10px 14px',
                width: '100%',
                outline: 'none',
                fontSize: 15,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#E63946')}
              onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: '#8D99AE' }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                backgroundColor: '#0F0F1A',
                color: '#F1FAEE',
                border: '1px solid #2a2a3e',
                borderRadius: 8,
                padding: '10px 14px',
                width: '100%',
                outline: 'none',
                fontSize: 15,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#E63946')}
              onBlur={e => (e.target.style.borderColor = '#2a2a3e')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#b02a34' : '#E63946',
              color: '#F1FAEE',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              width: '100%',
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {isSignup ? 'Creating account…' : 'Signing in…'}
              </>
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#8D99AE' }}>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#E63946', textDecoration: 'none', fontWeight: 500 }}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{ color: '#E63946', textDecoration: 'none', fontWeight: 500 }}
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
