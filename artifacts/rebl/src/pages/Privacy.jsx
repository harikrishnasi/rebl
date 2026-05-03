import { Link } from 'react-router-dom'

const C = {
  cosmos: '#0A0A12', ghost: '#2A2A3E', silver: '#A8B2C4', cream: '#F0F4FF', dim: '#5A6380',
}

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
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"DM Sans", Inter, sans-serif' }}>
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}` }}>
        <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em' }}
          onMouseEnter={e => e.target.style.color = C.silver}
          onMouseLeave={e => e.target.style.color = C.dim}
        >← REBL</Link>
      </div>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: C.cream, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Privacy Policy</h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: C.dim, margin: '0 0 48px' }}>Last updated: May 2025</p>
        <div style={{ height: 1, backgroundColor: C.ghost, marginBottom: 48 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.15em', marginBottom: 14 }}>{s.heading.toUpperCase()}</div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: '#8090A8', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
