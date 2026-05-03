import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
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

const PLACEHOLDER_ITEMS = [
  { id: 'p1', name: 'Air Jordan 1 Retro High OG Chicago', brand: 'Nike', category: 'Sneakers', rarity: 'Very Rare' },
  { id: 'p2', name: 'Supreme Box Logo Hooded Sweatshirt FW23', brand: 'Supreme', category: 'Streetwear', rarity: 'Rare' },
  { id: 'p3', name: 'Casio G-SHOCK x Maharishi MRG-B2100', brand: 'Casio', category: 'Watches', rarity: 'Ultra Rare' },
]

const sectionLabel = (txt: string) => ({
  fontFamily: DISPLAY, fontSize: 10, color: T.gray,
  letterSpacing: '0.28em', textTransform: 'uppercase' as const, marginBottom: 24,
})

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
      supabase.from('items').select('*').eq('owner_id', userId).order('created_at', { ascending: false }).limit(8),
    ])

    setProfile(profRes.data)
    setBrandMemberships(memberRes.data || [])
    setItems(itemRes.data || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 28, height: 28, border: `1px solid ${T.borderVis}`, borderTopColor: T.gray, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <InnerNav profile={profile} actions={navActions} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── Collector Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 64, paddingBottom: 48, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 60, height: 60, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.white }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0] || '?')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
              {profile?.archetype || 'Collector'}
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px,2.5vw,28px)', fontWeight: 700, margin: 0, color: T.white, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
              {profile?.display_name || 'Collector'}
            </h1>
            {profile?.username && <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13, marginTop: 4 }}>@{profile.username}</div>}
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { label: 'Items', val: items.length },
              { label: 'Brands', val: brandMemberships.length },
              ...(backstageBrands.length > 0 ? [{ label: 'Backstage', val: backstageBrands.length, highlight: true }] : []),
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: s.highlight ? T.white : T.white, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Backstage Access ── */}
        {backstageBrands.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <div style={sectionLabel('Backstage Access')}>Backstage Access</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
              {backstageBrands.map(m => (
                <div key={m.id} style={{ backgroundColor: T.bg, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 44, height: 44, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                    {m.brands?.logo_url ? <img src={m.brands.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.brands?.name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Exclusive Access Unlocked</div>
                    <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: T.white }}>{m.brands?.name}</div>
                    {m.customer_tiers && (
                      <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, marginTop: 2 }}>
                        {m.customer_tiers.name} member
                      </div>
                    )}
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

        {/* ── Brand Memberships ── */}
        {brandMemberships.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <div style={sectionLabel('Your Brands')}>Your Brands</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
              {brandMemberships.map(m => {
                const brand = m.brands; const tier = m.customer_tiers
                return (
                  <Link key={m.id} to={`/brand/${brand?.slug}`} style={{ textDecoration: 'none', backgroundColor: T.bg, padding: '20px 20px', display: 'block', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.card}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = T.bg}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
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

        {/* ── Collection ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={sectionLabel('Your Collection')}>Your Collection</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Link to="/add-item" style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>+ Add Item</Link>
              {profile?.username && (
                <Link to={`/vault/${profile.username}`} style={{
                  fontFamily: MONO, fontSize: 10, fontWeight: 600,
                  color: T.bg, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '7px 16px', backgroundColor: T.white, display: 'inline-block',
                  transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >Open Vault ◈</Link>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div>
              {/* Placeholder items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis, marginBottom: 1 }}>
                {PLACEHOLDER_ITEMS.map(item => (
                  <div key={item.id} style={{ backgroundColor: T.bg, padding: 0, position: 'relative', opacity: 0.35 }}>
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
              {/* Empty CTA */}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
                {items.map(item => (
                  <Link
                    key={item.id}
                    to={profile?.username ? `/vault/${profile.username}` : '/dashboard'}
                    style={{ backgroundColor: T.bg, overflow: 'hidden', textDecoration: 'none', display: 'block', cursor: 'pointer', transition: 'background 0.15s' }}
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
                    </div>
                  </Link>
                ))}
              </div>
              {/* Vault CTA below items */}
              {profile?.username && (
                <div style={{ marginTop: 1, backgroundColor: T.card, border: `1px solid ${T.borderVis}`, borderTop: 'none', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Full Vault View</div>
                    <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid }}>Wall · By Brand · By Category · Timeline</div>
                  </div>
                  <Link to={`/vault/${profile.username}`} style={{
                    fontFamily: MONO, fontSize: 10, fontWeight: 600, color: T.bg,
                    textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '10px 20px', backgroundColor: T.white, flexShrink: 0,
                  }}>Open Vault →</Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${T.border}`, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Find Your Tribe', to: '/tribe' },
            { label: 'Profile Settings', to: profile?.username ? `/profile/${profile.username}` : '/dashboard' },
          ].map(link => (
            <Link key={link.label} to={link.to} style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = T.white}
              onMouseLeave={e => (e.target as HTMLElement).style.color = T.grayMid}
            >{link.label} →</Link>
          ))}
        </div>
      </div>

      {/* Backstage Modal */}
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
            <div style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>Exclusive Access</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: T.white }}>{brand?.name}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.grayMid, fontSize: 22, cursor: 'pointer', lineHeight: 1, fontFamily: BODY }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: T.grayMid, fontFamily: BODY, fontSize: 14 }}>Loading exclusive content…</div>
        ) : (
          <>
            {events.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>Experiences</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{ backgroundColor: T.bg, padding: '20px 24px' }}>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: T.white, marginBottom: 8 }}>{ev.name}</div>
                      {ev.description && <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>{ev.description}</div>}
                      <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em' }}>
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
                <div style={{ fontFamily: DISPLAY, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>From the Brand</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: T.borderVis }}>
                  {posts.map(p => (
                    <div key={p.id} style={{ backgroundColor: T.bg, padding: '20px 24px' }}>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: T.white, marginBottom: 8 }}>{p.title}</div>
                      <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13, lineHeight: 1.7 }}>{p.content}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: T.borderVis, marginTop: 12, letterSpacing: '0.1em' }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {events.length === 0 && posts.length === 0 && (
              <div style={{ padding: '48px 24px', textAlign: 'center', border: `1px solid ${T.borderVis}` }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 24, color: T.borderVis, marginBottom: 16 }}>◎</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 14, color: T.white, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Nothing posted yet</div>
                <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13 }}>This brand is preparing something exclusive. Check back soon.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
