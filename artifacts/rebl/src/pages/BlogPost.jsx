import { Link, useParams, Navigate } from 'react-router-dom'

const C = {
  void: '#050508', cosmos: '#0A0A12', nebula: '#12121E', crater: '#1C1C2E',
  silver: '#A8B2C4', ghost: '#2A2A3E', cream: '#F0F4FF', dim: '#5A6380',
}

const ARTICLES = {
  'mass-market-death': {
    title: 'The Death of the Mass Market Aesthetic',
    date: 'May 2025',
    readTime: '8 min read',
    sections: [
      {
        heading: null,
        body: 'For thirty years, brands competed on reach. The winner was whoever could put their logo in front of the most eyeballs. Pepsi. Nike. H&M. The game was simple: make something average, make it everywhere, repeat. That era is over — and the collectors who knew it first are already building a different world.',
      },
      {
        heading: 'THE SIGNAL EVERYONE MISSED',
        body: 'In 2018, something quietly changed. Streetwear brands began selling out in seconds, not hours. Sneaker resale markets emerged with billion-dollar valuations. People started forming queues outside Supreme at 6am. The mainstream media called it a fad. They were wrong. It was a signal: that people were increasingly willing to pay more for things that were harder to get — not because of the objects themselves, but because of what ownership meant.',
      },
      {
        heading: 'IDENTITY AS CURRENCY',
        body: 'When everything is available to everyone, nothing says anything about you. When you wear the same hoodie as ten million other people, the hoodie stops being an expression and becomes a uniform. A generation raised on social media — where identity is constantly performed and constantly evaluated — is acutely aware of this. The response has been predictable: find the things that aren\'t everywhere. The limited edition. The collab. The piece with a story.',
      },
      {
        heading: 'WHAT THIS MEANS FOR BRANDS',
        body: 'The brands that understand this have stopped competing on scale and started competing on meaning. Nike doesn\'t just sell shoes anymore — it sells membership to a culture. Supreme doesn\'t just sell hoodies — it sells exclusivity itself. The smart brands are learning that their most valuable customers aren\'t the ones who buy the most frequently. They\'re the ones who care the most deeply. And caring deeply is something you can build. But only if you have the infrastructure for it.',
      },
      {
        heading: 'THE PLATFORM PROBLEM',
        body: 'Here\'s the gap nobody has filled. Brands have Instagram, Shopify, and email lists. Collectors have Instagram stories and Discord servers. But there\'s no dedicated space that bridges both — where a brand can launch a drop, verify who bought it, and then build a lasting relationship with those buyers. Where collectors can prove they own what they say they own, tell the story behind each piece, and connect with others who get it. That\'s what Rebl is building.',
      },
    ],
  },
  'limited-edition-psychology': {
    title: 'Why Limited Editions Actually Work: The Psychology of Scarcity',
    date: 'April 2025',
    readTime: '6 min read',
    sections: [
      {
        heading: null,
        body: "It's not about the item. It's about what owning the item says about you. Scarcity isn't a marketing trick — it's a fundamental driver of human psychology. And the brands that understand this are building something far more durable than a customer base.",
      },
      {
        heading: 'THE VEBLEN PARADOX',
        body: 'In classical economics, demand falls as price rises. Veblen goods break this rule — they become more desirable as they become more exclusive. The Jordan 1 Chicago doesn\'t just hold its value because of materials or craftsmanship. It holds its value because scarcity has made it a signal. Owning it says something. That something is worth money.',
      },
      {
        heading: 'SIGNALING THEORY',
        body: 'Every purchase is a signal. When you buy something available to everyone, the signal is noise. When you buy something only 500 people in the world own, the signal is loud and clear. Economists call this costly signaling — the very fact that it\'s difficult to obtain makes it credible as an identity statement. Collectors understand this intuitively, even if they\'d never describe it that way.',
      },
      {
        heading: 'TRIBAL BELONGING',
        body: 'The psychology of scarcity isn\'t only about exclusion — it\'s about inclusion. The 200 people who own the same piece as you aren\'t strangers. They\'re your tribe. They made the same choice. They understand the same reference. This is why collector communities are so unusually loyal. They\'re not bound by geographic proximity or professional necessity. They\'re bound by shared taste, which is the strongest bind there is.',
      },
      {
        heading: 'FOMO vs JOMO',
        body: 'The mainstream narrative around limited drops is FOMO — the fear of missing out. But the more interesting collector psychology is JOMO — the joy of missing out on everything else. The serious collector isn\'t anxious about what they don\'t have. They\'re deliberate about what they choose to own. Each addition to their vault is a decision, not a reaction. Rebl is built for the JOMO collector: the person who would rather own five things perfectly than fifty things carelessly.',
      },
    ],
  },
  'collector-communities': {
    title: 'Find Your Orbit: Why Collector Communities Beat Social Media',
    date: 'March 2025',
    readTime: '5 min read',
    sections: [
      {
        heading: null,
        body: 'Twitter gives you followers. Instagram gives you likes. Rebl gives you the 23 other people in India who own the exact same Jordan as you. These are not the same thing.',
      },
      {
        heading: "DUNBAR'S NUMBER AND THE COLLECTOR",
        body: "Robin Dunbar's research suggests humans can maintain meaningful relationships with roughly 150 people. Social media has tried to break this limit — and failed. What we get instead is breadth without depth: thousands of connections that don't actually connect us to anything. The collector community breaks differently. When your connection is based on verified shared ownership, not shared opinions or follower counts, something different happens. The group is naturally smaller. The signal-to-noise ratio is radically better.",
      },
      {
        heading: 'SHARED OWNERSHIP VS SHARED INTEREST',
        body: "There's a difference between following sneaker culture and owning a specific pair of sneakers. Interest-based communities are large, noisy, and full of posturing. Ownership-based communities are small, specific, and grounded in a shared act. You both made the same choice. You both spent the money. You both waited for the drop. That foundation creates a different quality of conversation.",
      },
      {
        heading: 'WHY DISCORD FAILS COLLECTORS',
        body: "Discord servers for collector communities have the same problem as every other social platform: there's no verification. Anyone can claim anything. The conversation is dominated by people who want the item, not people who own it. The signal drowns in the noise. Rebl's Owner Rooms are different because entry requires proof. If you're in the room, you own the piece. That changes everything about how people show up.",
      },
      {
        heading: 'THE ORBIT METAPHOR',
        body: "We call it your orbit because that's what it feels like. The people who've made the same choices as you exist at a certain distance — close enough to connect with, far enough that the connection is rare and meaningful. Finding them on social media is like looking for a specific star with the naked eye. Rebl is the telescope.",
      },
    ],
  },
}

export default function BlogPost() {
  const { slug } = useParams()
  const article = ARTICLES[slug]
  if (!article) return <Navigate to="/blog" replace />

  return (
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"DM Sans", Inter, sans-serif' }}>
      {/* Nav */}
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}` }}>
        <Link to="/blog" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = C.silver}
          onMouseLeave={e => e.target.style.color = C.dim}
        >← JOURNAL</Link>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>{article.date}</span>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.crater }}>·</span>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>{article.readTime}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 700, color: C.cream, margin: '0 0 48px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{article.title}</h1>

        <div style={{ height: 1, backgroundColor: C.ghost, marginBottom: 48 }} />

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {article.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.2em', marginBottom: 16 }}>{s.heading}</div>
              )}
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: '#8090A8', lineHeight: 1.85, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 64, paddingTop: 48, borderTop: `1px solid ${C.ghost}`, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: '#050508',
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', backgroundColor: C.silver, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C8D4E8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.silver}
          >Start Your Vault →</Link>
          <Link to="/blog" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.ghost}`, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.silver; e.currentTarget.style.borderColor = C.silver }}
            onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.ghost }}
          >More Articles</Link>
        </div>
      </div>
    </div>
  )
}
