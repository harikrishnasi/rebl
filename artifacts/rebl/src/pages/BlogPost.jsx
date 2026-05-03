import { Link, useParams, Navigate } from 'react-router-dom'
import GreekBorder from '@/components/GreekBorder'

const T = { bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555' }
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const ARTICLES = {
  'mass-market-death': {
    title: 'The Death of the Mass Market Aesthetic',
    date: 'May 2025', readTime: '8 min', tag: 'Culture',
    sections: [
      { heading: null, body: 'For thirty years, brands competed on reach. The winner was whoever could put their logo in front of the most eyeballs. Pepsi. Nike. H&M. The game was simple: make something average, make it everywhere, repeat. That era is over — and the collectors who knew it first are already building a different world.' },
      { heading: 'The Signal Everyone Missed', body: 'In 2018, something quietly changed. Streetwear brands began selling out in seconds, not hours. Sneaker resale markets emerged with billion-dollar valuations. People started forming queues at 6am. The mainstream media called it a fad. They were wrong. It was a signal: that people were increasingly willing to pay more for things that were harder to get — not because of the objects themselves, but because of what ownership meant.' },
      { heading: 'Identity as Currency', body: 'When everything is available to everyone, nothing says anything about you. A generation raised on social media — where identity is constantly performed and constantly evaluated — is acutely aware of this. The response has been predictable: find the things that aren\'t everywhere. The limited edition. The collab. The piece with a story.' },
      { heading: 'What This Means for Brands', body: 'The brands that understand this have stopped competing on scale and started competing on meaning. Nike doesn\'t just sell shoes anymore — it sells membership to a culture. Supreme doesn\'t just sell hoodies — it sells exclusivity itself. The smart brands are learning that their most valuable customers aren\'t the ones who buy the most frequently. They\'re the ones who care the most deeply.' },
      { heading: 'The Platform Problem', body: 'Brands have Instagram, Shopify, and email lists. Collectors have Discord servers. But there\'s no dedicated space that bridges both — where a brand can launch a drop, verify who bought it, and build a lasting relationship with those buyers. Where collectors can prove they own what they say they own, tell the story behind each piece, and connect with others who get it. That\'s what Rebl is building.' },
    ],
  },
  'limited-edition-psychology': {
    title: 'Why Limited Editions Actually Work: The Psychology of Scarcity',
    date: 'April 2025', readTime: '6 min', tag: 'Psychology',
    sections: [
      { heading: null, body: "It's not about the item. It's about what owning the item says about you. Scarcity isn't a marketing trick — it's a fundamental driver of human psychology. And the brands that understand this are building something far more durable than a customer base." },
      { heading: 'The Veblen Paradox', body: "In classical economics, demand falls as price rises. Veblen goods break this rule — they become more desirable as they become more exclusive. The Jordan 1 Chicago doesn't just hold its value because of materials or craftsmanship. It holds its value because scarcity has made it a signal. Owning it says something. That something is worth money." },
      { heading: 'Signaling Theory', body: "Economists call it signaling theory. When you buy something scarce and expensive, you're not just buying an object — you're buying a way to communicate information about yourself to others. The limited edition sneaker says: I was early. I have taste. I had access. These are valuable signals in a world drowning in sameness." },
      { heading: 'The Community Effect', body: "The most underrated aspect of limited drops is what they do to the buyer community. When 500 people in Mumbai own the same piece, they instantly have something in common. Not just ownership — shared experience. The queue. The refresh. The win. Community is built on shared struggle and shared victory. Limited drops manufacture both at scale." },
    ],
  },
  'collector-communities': {
    title: 'Find Your Orbit: Why Collector Communities Beat Social Media',
    date: 'March 2025', readTime: '5 min', tag: 'Community',
    sections: [
      { heading: null, body: "Twitter gives you followers. Instagram gives you likes. Rebl gives you the 23 other people in India who own the exact same Jordan as you. These are not the same thing." },
      { heading: 'The Difference Between Audience and Tribe', body: "An audience watches you. A tribe stands beside you. The distinction matters because what collectors actually need — what they're searching for in Discord servers and subreddits and sneaker meetups — isn't an audience. It's the handful of people who care exactly as much as they do about exactly the things they care about." },
      { heading: 'Why Social Media Fails Collectors', body: "Social media was built for broadcast. Post, get likes, move on. But collecting isn't a broadcast activity — it's a practice. It requires comparison, authentication, community knowledge, and the ability to find the other person who owns what you own. None of these things are native to platforms built for attention." },
      { heading: 'The Orbit Model', body: "We call it orbit because that's what it feels like when it works. You and 40 other people, circling the same object. Same passion. Same knowledge. Same investment. Rebl finds these orbits and maps them — automatically, from verified ownership data. The community isn't manufactured. It already exists. We just make it visible." },
    ],
  },
  'provenance-age': {
    title: 'The Age of Provenance: Why the Story Matters More Than Ever',
    date: 'February 2025', readTime: '7 min', tag: 'Provenance',
    sections: [
      { heading: null, body: 'The ancient Greeks believed that objects carried the pneuma — the spirit — of their makers and owners. A sword forged by a great smith was worth more than a mechanically identical replica. Not because of material difference. Because of story.' },
      { heading: 'What Provenance Actually Is', body: 'Provenance is the documented history of an object. Who made it. Who owned it. Where it has been. In the art world, provenance can multiply the value of a piece tenfold. A painting owned by a notable collector sells for more than an identical painting that appeared from nowhere. The same principle is coming for streetwear, watches, and everything else collectors care about.' },
      { heading: 'The Authentication Crisis', body: 'The counterfeit market is not a small problem. In 2024, an estimated 40% of sneakers sold on secondary markets were fake. The tools available to verify authenticity are fragmented, expensive, and inaccessible to most collectors. This is the gap Rebl fills — not just with AI-generated stories, but with verified ownership records that travel with the object.' },
      { heading: 'From Ancient Roots', body: 'Rebl\'s approach to provenance is inspired by something old. The Greeks did not trust unverified claims. They demanded oaths, witnesses, and evidence. We believe modern collectors deserve the same standard — the right to know that what they own is what they say it is, and the tools to prove it to anyone who asks.' },
    ],
  },
  'india-collector-class': {
    title: "The Rise of India's Collector Class",
    date: 'January 2025', readTime: '9 min', tag: 'India',
    sections: [
      { heading: null, body: "A new generation of Indian collectors is emerging — educated, discerning, and unwilling to be served the global market's leftovers. This is their moment, and Rebl is built for them." },
      { heading: 'The Numbers', body: "India's sneaker resale market grew 340% between 2021 and 2024. The Indian luxury market is projected to reach $8.5 billion by 2026. VegNonVeg, Superkicks, and a handful of boutiques have created a genuine ecosystem of taste. The demand is real. The infrastructure is catching up." },
      { heading: 'The Taste Gap', body: "For years, Indian collectors were consumers of global culture, not creators of it. The drops they wanted were designed for London and New York. The communities they wanted to join were built for those cities too. That is changing. Indian brands are launching limited editions. Indian collectors are building collections that rival any in the world. The taste gap is closing." },
      { heading: 'What This Generation Wants', body: "They want verification. They want community. They want the story behind the object, not just the object. They want the 40 other people in their city who own the same piece. They want infrastructure worthy of the culture they're building. Rebl is built for exactly this — the Indian collector who is done settling for tools that weren't designed for them." },
    ],
  },
}

export default function BlogPost() {
  const { slug } = useParams()
  const article = ARTICLES[slug]
  if (!article) return <Navigate to="/blog" replace />

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      {/* Nav */}
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
        </Link>
        <Link to="/blog" style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← Journal</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(56px,7vw,96px) 32px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', border: `1px solid ${T.borderVis}`, padding: '4px 10px' }}>{article.tag}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>{article.date}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>{article.readTime} read</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,4vw,44px)', fontWeight: 700, color: T.white, margin: '0 0 40px', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{article.title}</h1>

        <GreekBorder color={T.borderVis} opacity={0.5} />

        {/* Body */}
        <div style={{ marginTop: 56 }}>
          {article.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 44 }}>
              {s.heading && (
                <h2 style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: T.gray, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.heading}</h2>
              )}
              <p style={{ fontFamily: BODY, fontSize: 17, color: T.grayMid, lineHeight: 1.9, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 80, paddingTop: 48, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Link to="/blog" style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>← All Essays</Link>
          <Link to="/signup" style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 600, color: T.bg,
            textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '12px 28px', backgroundColor: T.white, display: 'inline-block',
          }}>Start Collecting →</Link>
        </div>
      </div>
    </div>
  )
}
