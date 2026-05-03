import { Link } from 'react-router-dom'

const C = {
  cosmos: '#0A0A12', ghost: '#2A2A3E', silver: '#A8B2C4', cream: '#F0F4FF', dim: '#5A6380',
}

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
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"Plus Jakarta Sans", "Plus Jakarta Sans", Inter, sans-serif' }}>
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}` }}>
        <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em' }}
          onMouseEnter={e => e.target.style.color = C.silver}
          onMouseLeave={e => e.target.style.color = C.dim}
        >← REBL</Link>
      </div>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: C.cream, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Terms of Service</h1>
        <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim, margin: '0 0 48px' }}>Last updated: May 2025</p>
        <div style={{ height: 1, backgroundColor: C.ghost, marginBottom: 48 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.15em', marginBottom: 14 }}>{s.heading.toUpperCase()}</div>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 15, color: '#8090A8', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
