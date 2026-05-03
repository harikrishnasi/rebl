import { Link } from 'react-router-dom'

const C = {
  void: '#050508', cosmos: '#0A0A12', nebula: '#12121E', crater: '#1C1C2E',
  silver: '#A8B2C4', silverBright: '#C8D4E8', ghost: '#2A2A3E',
  cream: '#F0F4FF', dim: '#5A6380', orbit: '#7B8FA8',
}

const POSTS = [
  {
    slug: 'mass-market-death',
    title: 'The Death of the Mass Market Aesthetic',
    date: 'May 2025',
    readTime: '8 min read',
    excerpt: 'For thirty years, brands competed on reach. The winner was whoever could put their logo in front of the most eyeballs. That era is over — and the collectors who knew it first are already building a different world.',
  },
  {
    slug: 'limited-edition-psychology',
    title: 'Why Limited Editions Actually Work: The Psychology of Scarcity',
    date: 'April 2025',
    readTime: '6 min read',
    excerpt: "It's not about the item. It's about what owning the item says about you. The psychology behind why limited drops create more loyalty than any loyalty program ever could.",
  },
  {
    slug: 'collector-communities',
    title: 'Find Your Orbit: Why Collector Communities Beat Social Media',
    date: 'March 2025',
    readTime: '5 min read',
    excerpt: 'Twitter gives you followers. Instagram gives you likes. Rebl gives you the 23 other people in India who own the exact same Jordan as you. These are not the same thing.',
  },
]

export default function Blog() {
  return (
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"DM Sans", Inter, sans-serif' }}>
      {/* Nav */}
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}` }}>
        <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = C.silver}
          onMouseLeave={e => e.target.style.color = C.dim}
        >← REBL</Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 64, borderBottom: `1px solid ${C.ghost}`, paddingBottom: 48 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>REBL JOURNAL</div>
          <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, color: C.cream, margin: '0 0 16px', letterSpacing: '-1px' }}>On collecting, identity, and the end of mass market.</h1>
        </div>

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {POSTS.map((post, i) => (
            <div key={post.slug}>
              {i > 0 && <div style={{ height: 1, backgroundColor: C.ghost }} />}
              <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', padding: '40px 0' }}
                onMouseEnter={e => e.currentTarget.querySelector('.post-title').style.color = C.silverBright}
                onMouseLeave={e => e.currentTarget.querySelector('.post-title').style.color = C.cream}
              >
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>{post.date}</span>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.crater, letterSpacing: '0.1em' }}>·</span>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>{post.readTime}</span>
                </div>
                <h2 className="post-title" style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(16px,2.2vw,22px)', fontWeight: 700, color: C.cream, margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.3, transition: 'color 0.2s' }}>{post.title}</h2>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: C.dim, lineHeight: 1.7, margin: '0 0 16px' }}>{post.excerpt}</p>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.15em' }}>Read →</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
