import { Link } from 'react-router-dom'

const T = { bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const SECTIONS = [
  { heading: 'Information We Collect', body: 'We collect information you provide directly to us when creating an account (email address, username, profile details), adding items to your vault, or communicating with us. We also collect usage data automatically, including pages visited, features used, and device information.' },
  { heading: 'How We Use Your Information', body: 'We use the information we collect to operate and improve the Rebl platform, send you important account-related communications, personalise your experience and generate AI-powered provenance stories for your items, and connect you with other verified owners of the same pieces.' },
  { heading: 'Data Storage and Security', body: 'Your data is stored securely using Supabase infrastructure with row-level security policies. Images are stored in encrypted object storage. We implement industry-standard security measures to protect your personal information.' },
  { heading: 'Sharing of Information', body: 'We do not sell your personal information. We may share aggregated, anonymised data with brand partners (e.g., "47 collectors in Mumbai own this drop") but never individual identifying information without your explicit consent. Your vault visibility settings control what other users can see.' },
  { heading: 'Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also export your vault data. Deleting your account will remove your profile and items from our platform.' },
  { heading: 'Cookies', body: 'We use minimal, necessary cookies for session management and authentication. We do not use third-party advertising cookies.' },
  { heading: 'Contact', body: 'For privacy-related questions or requests, contact us at privacy@rebl.in.' },
]

export default function Privacy() {
  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
        <Link to="/" style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Back</Link>
      </nav>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(56px,7vw,96px) 32px' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>Legal</div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: T.white, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, margin: '0 0 48px', letterSpacing: '0.1em' }}>Last updated: May 2025</p>
        <div style={{ height: 1, backgroundColor: T.border, marginBottom: 56 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>{s.heading}</div>
              <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.85, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
