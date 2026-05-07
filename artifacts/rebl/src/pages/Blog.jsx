import { Link } from 'react-router-dom'
import GreekBorder from '@/components/GreekBorder'

const T = { bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const POSTS = [
  {
    slug: 'mass-market-death',
    title: 'The Death of the Mass Market Aesthetic',
    date: 'May 2025',
    readTime: '8 min',
    tag: 'Culture',
    excerpt: 'For thirty years, brands competed on reach. The winner was whoever could put their logo in front of the most eyeballs. That era is over — and the collectors who knew it first are already building a different world.',
  },
  {
    slug: 'limited-edition-psychology',
    title: 'Why Limited Editions Actually Work: The Psychology of Scarcity',
    date: 'April 2025',
    readTime: '6 min',
    tag: 'Psychology',
    excerpt: "It's not about the item. It's about what owning the item says about you. The psychology behind why limited drops create more loyalty than any loyalty program ever could.",
  },
  {
    slug: 'collector-communities',
    title: 'Find Your Orbit: Why Collector Communities Beat Social Media',
    date: 'March 2025',
    readTime: '5 min',
    tag: 'Community',
    excerpt: 'Twitter gives you followers. Instagram gives you likes. Rebl gives you the 23 other people in India who own the exact same Jordan as you. These are not the same thing.',
  },
  {
    slug: 'provenance-age',
    title: 'The Age of Provenance: Why the Story of an Object Matters More Than Ever',
    date: 'February 2025',
    readTime: '7 min',
    tag: 'Provenance',
    excerpt: 'The ancient Greeks believed that objects carried the spirit of their owners. Modern collectors are rediscovering this truth — and demanding the tools to prove it.',
  },
  {
    slug: 'india-collector-class',
    title: 'The Rise of India\'s Collector Class',
    date: 'January 2025',
    readTime: '9 min',
    tag: 'India',
    excerpt: 'A new generation of Indian collectors is emerging — educated, discerning, and unwilling to be served the global market\'s leftovers. This is their moment.',
  },
]

export default function Blog() {
  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      {/* Nav */}
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
        <Link to="/" style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(56px,7vw,96px) 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 72, paddingBottom: 56, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24 }}>Rēbl Journal</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: T.white, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.1 }}>On collecting, identity,<br />and the end of mass market.</h1>
          <p style={{ fontFamily: BODY, fontSize: 16, color: T.grayMid, lineHeight: 1.8, margin: 0, maxWidth: 520 }}>Essays on culture, ownership, and what it means to collect with intention in the modern age.</p>
        </div>

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {POSTS.map((post, i) => (
            <div key={post.slug}>
              {i > 0 && <div style={{ height: 1, backgroundColor: T.border }} />}
              <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', padding: '48px 0' }}
                onMouseEnter={e => {
                  const title = e.currentTarget.querySelector('.post-title')
                  if (title) title.style.color = T.white
                }}
                onMouseLeave={e => {
                  const title = e.currentTarget.querySelector('.post-title')
                  if (title) title.style.color = T.gray
                }}
              >
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', border: `1px solid ${T.borderVis}`, padding: '4px 10px' }}>{post.tag}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>{post.date}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>{post.readTime} read</span>
                </div>
                <h2 className="post-title" style={{ fontFamily: DISPLAY, fontSize: 'clamp(16px,2.2vw,24px)', fontWeight: 600, color: T.gray, margin: '0 0 16px', letterSpacing: '-0.3px', lineHeight: 1.25, textTransform: 'uppercase', transition: 'color 0.2s' }}>{post.title}</h2>
                <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, margin: '0 0 20px', maxWidth: 600 }}>{post.excerpt}</p>
                <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Read Essay →</span>
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80 }}>
          <GreekBorder color={T.borderVis} opacity={0.5} />
          <div style={{ textAlign: 'center', marginTop: 48 }}>

          </div>
        </div>
      </div>
    </div>
  )
}
