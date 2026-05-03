import { Link } from 'react-router-dom'

const T = { bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.white, fontFamily: BODY, display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, letterSpacing: '0.25em', marginBottom: 32 }}>ERROR 404</div>

          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(64px,12vw,120px)', fontWeight: 700, color: T.white, lineHeight: 1, letterSpacing: '-2px', marginBottom: 8 }}>404</div>

          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(16px,2.5vw,24px)', fontWeight: 600, color: T.gray, margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lost in the void.
          </h1>

          <p style={{ fontFamily: BODY, fontSize: 16, color: T.grayMid, lineHeight: 1.8, margin: '0 0 48px' }}>
            The page you're looking for has drifted beyond our orbit. Even Icarus knew when to turn back.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 600, color: T.bg,
              textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '14px 36px', backgroundColor: T.white, display: 'inline-block', transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#D0D0D0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.white}
            >Return to Rebl →</Link>
            <Link to="/dashboard" style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray,
              textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '14px 32px', border: `1px solid ${T.borderVis}`, display: 'inline-block', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.white; (e.currentTarget as HTMLElement).style.color = T.white }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderVis; (e.currentTarget as HTMLElement).style.color = T.gray }}
            >Go to Dashboard</Link>
          </div>

        </div>
      </div>
    </div>
  )
}
