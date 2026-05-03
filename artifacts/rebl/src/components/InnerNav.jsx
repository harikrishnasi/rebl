import { Link } from 'react-router-dom'

const T = { bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

export default function InnerNav({ profile, actions, backTo, backLabel }) {
  return (
    <nav style={{
      backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`,
      padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
        {backTo && (
          <Link to={backTo} style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ← {backLabel || 'Back'}
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {actions}
        {profile?.username && (
          <Link to={`/profile/${profile.username}`} style={{
            width: 30, height: 30,
            backgroundColor: '#0D0D0D', border: `1px solid ${T.borderVis}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: BODY, fontSize: 12, fontWeight: 700, color: T.white,
            textDecoration: 'none', overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (profile?.display_name?.[0] || '?')}
          </Link>
        )}
      </div>
    </nav>
  )
}
