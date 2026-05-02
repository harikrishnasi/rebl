interface AuthPageProps {
  mode: 'login' | 'signup'
}

export default function AuthPage({ mode }: AuthPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F1A', color: '#F1FAEE' }}>
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
    </div>
  )
}
