import { Link } from 'react-router-dom'

const T = { bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const SECTIONS = [
  { heading: 'Acceptance of Terms', body: 'By accessing or using Rebl, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.' },
  { heading: 'User Accounts', body: 'You are responsible for maintaining the security of your account. Provide accurate information during registration. You may not share your account credentials or impersonate another person. You must be 13 or older to use Rebl.' },
  { heading: 'Vault Content and Ownership Claims', body: 'You are solely responsible for the accuracy of item information you add to your vault. Do not add items you do not own. Do not misrepresent the authenticity, edition, or provenance of items. Rebl reserves the right to remove content that violates these terms or appears fraudulent.' },
  { heading: 'AI-Generated Content', body: 'Rebl uses AI to generate provenance stories for items. This content is for informational and cultural enrichment purposes. It does not constitute authentication, legal verification, or financial advice. AI-generated stories may contain inaccuracies and should not be relied upon for high-value transactions.' },
  { heading: 'Brand Partnerships', body: 'Brands using the Rebl platform agree to accurate representation of their products, drops, and customer tier systems. Rebl is not responsible for brand actions or product quality but reserves the right to remove brands that violate platform standards.' },
  { heading: 'Prohibited Uses', body: 'You may not use Rebl to post false ownership claims, harass other users, circumvent verification systems, scrape or bulk download user data, or engage in any activity that disrupts platform operations.' },
  { heading: 'Termination', body: 'Rebl may suspend or terminate your account for violations of these terms. You may delete your account at any time from your profile settings.' },
  { heading: 'Limitation of Liability', body: 'Rebl is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.' },
  { heading: 'Contact', body: 'For questions about these terms, contact us at legal@rebl.in.' },
]

export default function Terms() {
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
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: T.white, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Terms of Service</h1>
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
