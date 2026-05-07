import { Link } from 'react-router-dom'
import GreekBorder from '@/components/GreekBorder'

const T = { bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const VALUES = [
  { label: 'Intentional Over Impulsive', body: 'We build for people who collect with purpose. Every feature exists to help a collector understand what they own and why it matters. The Athenians called it phronesis — practical wisdom. We call it the only way to build.' },
  { label: 'Verified Over Performed', body: 'Proof beats claims. We believe the future of collector culture is built on verified ownership — not follower counts, not unsubstantiated flex. Hercules did not merely speak of his labours. He performed them.' },
  { label: 'Community Over Audience', body: 'There is a difference between people who watch and people who belong. Rebl is built for the latter — the tribe that finds each other through the objects that define them. The 47 people in India who own the exact same piece as you. They exist. We help you find them.' },
]

export default function About() {
  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      {/* Nav */}
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
        <Link to="/" style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(56px,7vw,96px) 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24 }}>About</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: T.white, margin: '0 0 32px', letterSpacing: '-0.5px', lineHeight: 1.1, textTransform: 'uppercase' }}>
            Building the infrastructure for the post-mass-market era.
          </h1>
          <GreekBorder color={T.borderVis} opacity={0.6} />
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 80 }}>
          {[
            'Rebl was founded by a collector who was frustrated — frustrated by the gap between how much they cared about their collection and how little the existing tools supported that care.',
            'Instagram stories died in 24 hours. Discord servers were full of noise. There was no way to verify anything, no permanent record, no path to finding the other people who cared as much. The infrastructure for serious collectors did not exist.',
            'India\'s collector culture is at an inflection point. The drops are happening. The communities are forming. The culture is building. Rebl exists to build the platform before the culture outgrows the tools available to it.',
            'Our name is borrowed from the spirit of Prometheus — who stole fire from the gods to give to mortals. We build for the rebels, the dreamers, and the builders who refuse to settle for the mass-market version of anything.',
          ].map((p, i) => (
            <p key={i} style={{ fontFamily: BODY, fontSize: 17, color: T.grayMid, lineHeight: 1.85, margin: 0 }}>{p}</p>
          ))}
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 48 }}>Our Values</div>
          {VALUES.map((v, i) => (
            <div key={i}>
              {i > 0 && <div style={{ height: 1, backgroundColor: T.border, margin: '40px 0' }} />}
              <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 24, alignItems: 'start' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.borderVis, paddingTop: 3 }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 13, color: T.white, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{v.label}</div>
                  <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, margin: 0 }}>{v.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div style={{ padding: '36px 40px', border: `1px solid ${T.borderVis}` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 16 }}>Team</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, color: T.white, letterSpacing: '0.02em' }}>Team Rēbl — India, MMXXV</div>
          <p style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid, margin: '12px 0 0', lineHeight: 1.7 }}>
            A small, obsessive team building the collector OS India deserves.
          </p>
        </div>
      </div>
    </div>
  )
}
