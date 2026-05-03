import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import InnerNav from '@/components/InnerNav'

const T = {
  bg: '#000000', surface: '#080808', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const ARCHETYPE_LORE: Record<string, string> = {
  'The Purist': 'You collect for meaning, not market value. Every piece earns its place.',
  'The Historian': 'You understand what things meant before they were rare. Context is your currency.',
  'The Aesthetic': 'Your vault is a statement. Form matters as much as provenance.',
  'The Hunter': 'The chase is the point. You find things others miss.',
  'The Insider': 'You have access. You know people. You move early.',
  'The Architect': 'You build collections with intent. Every piece connects to the whole.',
}

const SL = (children: string) => (
  <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.28em', textTransform: 'uppercase' as const, marginBottom: 20 }}>
    {children}
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [brandMemberships, setBrandMemberships] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backstageView, setBackstageView] = useState<any>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    const userId = session.user.id
    const [profRes, memberRes, itemRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('brand_customers').select(`*, brands(id,name,slug,logo_url,description), customer_tiers(id,name,color,has_backstage_access,level)`).eq('profile_id', userId).order('created_at', { ascending: false }),
      supabase.from('items').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(12),
    ])
    setProfile(profRes.data)
    setBrandMemberships(memberRes.data || [])
    setItems(itemRes.data || [])
    setLoading(false)
  }

  const vibeDNA = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      for (const tag of (item.vibe_tags || [])) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag)
  }, [items])

  const verifiedCount = useMemo(() => items.filter(i => i.verified).length, [items])
  const brandCount = useMemo(() => new Set(items.map(i => i.brand).filter(Boolean)).size, [items])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 24, height: 24, border: `1px solid ${T.borderVis}`, borderTopColor: T.gray, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const backstageBrands = brandMemberships.filter(m => m.customer_tiers?.has_backstage_access)

  const navActions = (
    <Link to="/add-item" style={{ fontFamily: BODY, fontSize: 11, fontWeight: 500, color: T.gray, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 16px', border: `1px solid ${T.borderVis}`, transition: 'all 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.white; (e.currentTarget as HTMLElement).style.borderColor = T.gray }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.gray; (e.currentTarget as HTMLElement).style.borderColor = T.borderVis }}
    >+ Add Item</Link>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.white, fontFamily: BODY }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <InnerNav profile={profile} actions={navActions} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ══ HERO ══ */}
        <div style={{ marginBottom: 56, paddingBottom: 48, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.white, fontFamily: DISPLAY }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0] || '?')}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
                {profile?.archetype || 'Collector'} · Rebl
              </div>
              <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px,3vw,32px)', fontWeight: 700, margin: '0 0 6px', color: T.white, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                {profile?.display_name || 'Collector'}
              </h1>
              {profile?.username && <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13, marginBottom: 4 }}>@{profile.username}</div>}
              {profile?.signature_phrase && (
                <div style={{ fontFamily: BODY, fontSize: 13, color: T.gray, fontStyle: 'italic', marginTop: 8 }}>"{profile.signature_phrase}"</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 32, flexShrink: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Items', val: items.length },
                { label: 'Verified', val: verifiedCount },
                { label: 'Brands', val: brandCount },
                ...(backstageBrands.length > 0 ? [{ label: 'Backstage', val: backstageBrands.length }] : []),
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: T.white, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, marginTop: 6, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ QUICK ACTIONS ══ */}
        <div style={{ marginBottom: 56 }}>
          {SL('Quick Actions')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
            {[
              { sym: '◈', label: 'Add Item', sub: 'Log a new piece to your vault', to: '/add-item' },
              { sym: '◎', label: 'Open Vault', sub: 'Full collection with all views', to: profile?.username ? `/vault/${profile.username}` : '/dashboard' },
              { sym: '⊕', label: 'Find Tribe', sub: 'Collectors who get it', to: '/tribe' },
              { sym: '✦', label: 'Browse Drops', sub: 'Latest brand releases', to: '/drops' },
            ].map(a => (
              <Link key={a.label} to={a.to} style={{ textDecoration: 'none', backgroundColor: T.bg, padding: '24px 20px', display: 'block', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
              >
                <div style={{ fontFamily: DISPLAY, fontSize: 24, color: T.grayMid, marginBottom: 12, lineHeight: 1 }}>{a.sym}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 11, fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{a.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, lineHeight: 1.5 }}>{a.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══ COLLECTOR DNA ══ */}
        {(vibeDNA.length > 0 || profile?.archetype) && (
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
              {SL('Collector DNA')}
              {profile?.archetype && (
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -20 }}>{profile.archetype}</div>
              )}
            </div>
            <div style={{ border: `1px solid ${T.borderVis}` }}>
              <div style={{ padding: '24px 28px', borderBottom: vibeDNA.length > 0 ? `1px solid ${T.border}` : 'none' }}>
                {profile?.archetype && ARCHETYPE_LORE[profile.archetype] ? (
                  <p style={{ fontFamily: BODY, fontSize: 14, color: T.gray, lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
                    "{ARCHETYPE_LORE[profile.archetype]}"
                  </p>
                ) : (
                  <p style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid, lineHeight: 1.75, margin: 0 }}>
                    Your collection builds your identity on Rebl. Add items to see your collector DNA take shape.
                  </p>
                )}
              </div>
              {vibeDNA.length > 0 && (
                <div style={{ padding: '20px 28px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Your Vibe Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {vibeDNA.map(tag => (
                      <span key={tag} style={{
                        fontFamily: MONO, fontSize: 9, color: T.gray,
                        border: `1px solid ${T.borderVis}`, padding: '6px 14px',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ FIND YOUR TRIBE ══ */}
        <div style={{ marginBottom: 56 }}>
          {SL('Find Your Tribe')}
          <div style={{ border: `1px solid ${T.borderVis}` }}>
            <div style={{ padding: '32px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                  {profile?.archetype ? profile.archetype : 'Your Collector Tribe'}
                </div>
                <p style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid, margin: 0, lineHeight: 1.75, maxWidth: 420 }}>
                  Rebl connects collectors who obsess over the same things. Find people who understand exactly why your vault looks the way it does.
                </p>
              </div>
              <Link to="/tribe" style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 600, color: T.bg,
                textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '13px 28px', backgroundColor: T.white, flexShrink: 0, display: 'inline-block',
              }}>Find My Tribe →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, backgroundColor: T.borderVis }}>
              {[
                { sym: '◈', label: 'Purists', desc: 'Collect for meaning, not markets' },
                { sym: '◎', label: 'Historians', desc: 'Context is their currency' },
                { sym: '⊕', label: 'Hunters', desc: 'The chase is the whole point' },
              ].map(t => (
                <Link key={t.label} to="/tribe" style={{ textDecoration: 'none', backgroundColor: T.bg, padding: '22px 20px', display: 'block', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
                >
                  <div style={{ fontFamily: DISPLAY, fontSize: 20, color: T.grayMid, marginBottom: 10 }}>{t.sym}</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 10, fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{t.label}</div>
                  <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, lineHeight: 1.5 }}>{t.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══ BACKSTAGE ACCESS ══ */}
        {backstageBrands.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            {SL('Backstage Access')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
              {backstageBrands.map(m => (
                <div key={m.id} style={{ backgroundColor: T.bg, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 44, height: 44, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                    {m.brands?.logo_url ? <img src={m.brands.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.brands?.name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>Exclusive Access Unlocked</div>
                    <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: T.white }}>{m.brands?.name}</div>
                    {m.customer_tiers && <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, marginTop: 2 }}>{m.customer_tiers.name} member</div>}
                  </div>
                  <button onClick={() => setBackstageView(m)} style={{
                    backgroundColor: T.white, color: T.bg, border: 'none',
                    padding: '10px 20px', fontFamily: BODY, fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  }}>View Access</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ BRAND MEMBERSHIPS ══ */}
        {brandMemberships.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            {SL('Your Brands')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
              {brandMemberships.map(m => {
                const brand = m.brands; const tier = m.customer_tiers
                return (
                  <Link key={m.id} to={`/brand/${brand?.slug}`} style={{ textDecoration: 'none', backgroundColor: T.bg, padding: '20px', display: 'block', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, fontFamily: DISPLAY }}>
                        {brand?.logo_url ? <img src={brand.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : brand?.name?.[0]}
                      </div>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: T.white }}>{brand?.name}</div>
                    </div>
                    {tier && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${T.borderVis}`, padding: '3px 10px' }}>
                        <div style={{ width: 5, height: 5, backgroundColor: T.gray }} />
                        <span style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tier.name}</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ COLLECTION ══ */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            {SL('Your Collection')}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: -20 }}>
              <Link to="/add-item" style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>+ Add Item</Link>
              {profile?.username && (
                <Link to={`/vault/${profile.username}`} style={{
                  fontFamily: MONO, fontSize: 10, fontWeight: 600, color: T.bg,
                  textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '7px 16px', backgroundColor: T.white, display: 'inline-block', transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >Open Vault ◈</Link>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis, marginBottom: 1 }}>
                {[
                  { id: 'p1', name: 'Air Jordan 1 Retro High OG Chicago', brand: 'Nike', category: 'Sneakers' },
                  { id: 'p2', name: 'Supreme Box Logo Hooded Sweatshirt FW23', brand: 'Supreme', category: 'Streetwear' },
                  { id: 'p3', name: 'Casio G-SHOCK x Maharishi MRG-B2100', brand: 'Casio', category: 'Watches' },
                ].map(item => (
                  <div key={item.id} style={{ backgroundColor: T.bg, opacity: 0.3 }}>
                    <div style={{ height: 160, backgroundColor: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: 32, color: T.borderVis }}>◈</div>
                    </div>
                    <div style={{ padding: '14px 16px 18px' }}>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 13, color: T.white, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>{item.brand} · {item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '40px 32px', border: `1px solid ${T.borderVis}`, borderTop: 'none', textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 14, color: T.white, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Your vault awaits.</div>
                <p style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid, margin: '0 0 28px', lineHeight: 1.7 }}>Add the pieces that define you. Every item gets an AI-generated provenance story.</p>
                <Link to="/add-item" style={{
                  fontFamily: BODY, fontSize: 12, fontWeight: 600, color: T.bg,
                  textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '12px 32px', backgroundColor: T.white, display: 'inline-block',
                }}>Add First Item →</Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.bg }}>
                {items.map(item => (
                  <Link key={item.id} to={profile?.username ? `/vault/${profile.username}` : '/dashboard'}
                    style={{ backgroundColor: T.bg, overflow: 'hidden', textDecoration: 'none', display: 'block', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
                  >
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: 160, backgroundColor: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontFamily: DISPLAY, fontSize: 32, color: T.borderVis }}>◈</div>
                        </div>
                    }
                    <div style={{ padding: '14px 16px 18px' }}>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 13, color: T.white, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      {item.brand && <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>{item.brand}</div>}
                      {item.vibe_tags?.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(item.vibe_tags as string[]).slice(0, 2).map(tag => (
                            <span key={tag} style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, border: `1px solid ${T.border}`, padding: '2px 7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ══ DISCOVER ══ */}
        <div style={{ paddingTop: 40, borderTop: `1px solid ${T.border}` }}>
          {SL('Discover')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { sym: '✦', label: 'Latest Drops', sub: 'New releases from verified brand partners', to: '/drops' },
              { sym: '⊕', label: 'Collector Tribe', sub: 'Find your people. Compare vaults.', to: '/tribe' },
              { sym: '◎', label: 'Profile Settings', sub: 'Edit your collector identity', to: profile?.username ? `/profile/${profile.username}` : '/dashboard' },
            ].map((d, i) => (
              <Link key={d.label} to={d.to} style={{
                textDecoration: 'none', backgroundColor: T.bg,
                padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'background 0.15s',
                borderLeft: i > 0 ? `1px solid ${T.border}` : 'none',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
              >
                <div style={{ fontFamily: DISPLAY, fontSize: 28, color: T.grayMid, marginBottom: 8, lineHeight: 1 }}>{d.sym}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, lineHeight: 1.65 }}>{d.sub}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {backstageView && (
        <BackstageModal membership={backstageView} onClose={() => setBackstageView(null)} />
      )}
    </div>
  )
}

function BackstageModal({ membership, onClose }: { membership: any; onClose: () => void }) {
  const brand = membership.brands
  const [events, setEvents] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!brand?.id) return
    Promise.all([
      supabase.from('backstage_events').select('*').eq('brand_id', brand.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('backstage_posts').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([evRes, postRes]) => {
      setEvents(evRes.data || [])
      setPosts(postRes.data || [])
      setLoading(false)
    })
  }, [brand?.id])

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ backgroundColor: T.card, border: `1px solid ${T.borderVis}`, borderBottom: 'none', width: '100%', maxWidth: 700, maxHeight: '88vh', overflowY: 'auto', padding: '32px 32px 48px', animation: 'slideUp 0.25s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, backgroundColor: T.bg, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
            {brand?.logo_url ? <img src={brand.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : brand?.name?.[0]}
          </div>
          <div>
            <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>Exclusive Access</div>
            <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 18, fontWeight: 600, color: T.white }}>{brand?.name}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.grayMid, fontSize: 22, cursor: 'pointer', lineHeight: 1, fontFamily: '"Space Mono", monospace' }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: T.grayMid, fontFamily: '"Satoshi", sans-serif', fontSize: 14 }}>Loading exclusive content…</div>
        ) : (
          <>
            {events.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>Experiences</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{ backgroundColor: T.bg, padding: '20px 24px' }}>
                      <div style={{ fontFamily: '"Satoshi", sans-serif', fontWeight: 600, fontSize: 15, color: T.white, marginBottom: 8 }}>{ev.name}</div>
                      {ev.description && <div style={{ fontFamily: '"Satoshi", sans-serif', color: T.grayMid, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{ev.description}</div>}
                      <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>
                        {ev.rolling_access ? 'ROLLING ACCESS' : ev.event_date && new Date(ev.event_date).toLocaleDateString('en-IN')}
                        {ev.max_attendees > 0 && ` · ${ev.rsvp_count ?? 0}/${ev.max_attendees} ATTENDING`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {posts.length > 0 && (
              <div>
                <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>From the Brand</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
                  {posts.map(p => (
                    <div key={p.id} style={{ backgroundColor: T.bg, padding: '20px 24px' }}>
                      <div style={{ fontFamily: '"Satoshi", sans-serif', fontWeight: 600, fontSize: 14, color: T.white, marginBottom: 8 }}>{p.title}</div>
                      <div style={{ fontFamily: '"Satoshi", sans-serif', color: T.grayMid, fontSize: 13, lineHeight: 1.7 }}>{p.content}</div>
                      <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: T.borderVis, marginTop: 12, letterSpacing: '0.1em' }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {events.length === 0 && posts.length === 0 && (
              <div style={{ padding: '48px 24px', textAlign: 'center', border: `1px solid ${T.borderVis}` }}>
                <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 24, color: T.borderVis, marginBottom: 16 }}>◎</div>
                <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 14, color: T.white, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Nothing posted yet</div>
                <div style={{ fontFamily: '"Satoshi", sans-serif', color: T.grayMid, fontSize: 13 }}>This brand is preparing something exclusive. Check back soon.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
