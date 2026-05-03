import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

const C = {
  primary: '#0A0A12', accent: '#A8B2C4', cream: '#F0F4FF',
  muted: '#5A6380', gold: '#FFB703', card: '#12121E',
  border: '#2A2A3E', sidebar: '#050508',
}

const IS = {
  width: '100%', backgroundColor: 'rgba(255,255,255,0.05)',
  border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10,
  padding: '12px 14px', color: C.cream, fontSize: 14, outline: 'none',
  boxSizing: 'border-box' as const,
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [brandMemberships, setBrandMemberships] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backstageView, setBackstageView] = useState<any>(null) // brand membership obj

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    const userId = session.user.id

    const [profRes, memberRes, itemRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('brand_customers')
        .select(`
          *,
          brands(id, name, slug, logo_url, description),
          customer_tiers(id, name, color, has_backstage_access, level)
        `)
        .eq('profile_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('items')
        .select('*, brands(name, slug, logo_url)')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    setProfile(profRes.data)
    setBrandMemberships(memberRes.data || [])
    setItems(itemRes.data || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,0.1)`, borderTop: `3px solid ${C.gold}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const backstageBrands = brandMemberships.filter(m => m.customer_tiers?.has_backstage_access)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'system-ui, sans-serif' }}>
      {/* Top nav */}
      <div style={{ backgroundColor: C.sidebar, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>Rebl</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/add-item" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>+ Add Item</Link>
          {profile?.username && (
            <Link to={`/profile/${profile.username}`}
              style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: C.cream, textDecoration: 'none', overflow: 'hidden', flexShrink: 0 }}>
              {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.display_name?.[0] || '?')}
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* ── Collector header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: C.card, border: `2px solid ${C.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.display_name?.[0] || '?')}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
              {profile?.display_name || 'Collector'}
            </h1>
            {profile?.username && <div style={{ color: C.muted, fontSize: 14 }}>@{profile.username}</div>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
            <StatPill label="Items" val={items.length} />
            <StatPill label="Brands" val={brandMemberships.length} />
            {backstageBrands.length > 0 && <StatPill label="Backstage" val={backstageBrands.length} gold />}
          </div>
        </div>

        {/* ── Backstage access cards ── */}
        {backstageBrands.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
              🎭 Backstage Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {backstageBrands.map(m => (
                <BackstageAccessCard
                  key={m.id}
                  membership={m}
                  onView={() => setBackstageView(m)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Brand memberships ── */}
        {brandMemberships.length > 0 && (
          <div style={{ marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
              Your Brands
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {brandMemberships.map(m => {
                const brand = m.brands
                const tier = m.customer_tiers
                return (
                  <Link key={m.id} to={`/brand/${brand?.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 16px', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                          {brand?.logo_url ? <img src={brand.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : brand?.name?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand?.name}</div>
                        </div>
                      </div>
                      {tier && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, backgroundColor: `#${tier.color}18`, border: `1px solid #${tier.color}40`, fontSize: 12, fontWeight: 700, color: `#${tier.color}` }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: `#${tier.color}` }} />
                          {tier.name}
                          {tier.has_backstage_access && ' 🎭'}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Collection ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Your Collection
            </div>
            <Link to="/add-item" style={{ fontSize: 13, color: C.accent, fontWeight: 600, textDecoration: 'none' }}>+ Add Item</Link>
          </div>

          {items.length === 0
            ? (
              <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Nothing in your vault yet</div>
                <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Add the things you own and care about</div>
                <Link to="/add-item" style={{ backgroundColor: C.accent, color: C.cream, padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                  Add First Item
                </Link>
              </div>
            )
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {items.map(item => (
                  <div key={item.id} style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: 160, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📷</div>
                    }
                    <div style={{ padding: '14px 14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      {item.brands?.name && <div style={{ fontSize: 12, color: C.muted }}>{item.brands.name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* ── BACKSTAGE VIEW MODAL ── */}
      {backstageView && (
        <BackstageViewModal
          membership={backstageView}
          onClose={() => setBackstageView(null)}
        />
      )}
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ label, val, gold }: { label: string; val: number; gold?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: gold ? C.gold : C.cream }}>{val}</div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ── Backstage access card ── */
function BackstageAccessCard({ membership, onView }: { membership: any; onView: () => void }) {
  const brand = membership.brands
  const tier = membership.customer_tiers

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.gold}`, backgroundImage: `linear-gradient(135deg, rgba(255,183,3,0.08) 0%, rgba(22,22,42,0.6) 100%)`, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
      {/* Brand logo */}
      <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: `1px solid rgba(255,183,3,0.2)` }}>
        {brand?.logo_url ? <img src={brand.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : brand?.name?.[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 4 }}>🎭 Backstage Unlocked</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>
          {brand?.name} has unlocked something for you.
        </div>
        {tier && (
          <div style={{ fontSize: 12, color: C.muted }}>
            You're a <span style={{ color: `#${tier.color}`, fontWeight: 700 }}>{tier.name}</span> member
          </div>
        )}
      </div>

      <button onClick={onView}
        style={{ flexShrink: 0, backgroundColor: C.gold, color: C.primary, border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        View Backstage
      </button>
    </div>
  )
}

/* ── Backstage view modal ── */
function BackstageViewModal({ membership, onClose }: { membership: any; onClose: () => void }) {
  const brand = membership.brands
  const [events, setEvents] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!brand?.id) return
    Promise.all([
      supabase
        .from('backstage_events')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('backstage_posts')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(([evRes, postRes]) => {
      setEvents(evRes.data || [])
      setPosts(postRes.data || [])
      setLoading(false)
    })
  }, [brand?.id])

  const BS_ICONS: Record<string, string> = {
    design_preview: '🎨', founder_call: '📞', factory_tour: '🏭',
    early_purchase: '⚡', virtual_event: '🎙', custom: '✦',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: '24px 24px 0 0', border: `1px solid ${C.gold}`, borderBottom: 'none', width: '100%', maxWidth: 700, maxHeight: '88vh', overflowY: 'auto', padding: '28px 28px 40px' }}>
        <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{ animation: 'slideUp 0.3s ease' }}>

          {/* Handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 auto 24px' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, border: `1px solid ${C.gold}40` }}>
              {brand?.logo_url ? <img src={brand.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : brand?.name?.[0]}
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 3 }}>🎭 BACKSTAGE ACCESS</div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>{brand?.name}</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.muted, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {loading
            ? <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading exclusive content…</div>
            : <>
              {/* Events */}
              {events.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 14 }}>
                    Experiences
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {events.map(ev => (
                      <div key={ev.id} style={{ backgroundColor: 'rgba(255,183,3,0.06)', borderRadius: 14, border: `1px solid rgba(255,183,3,0.2)`, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ fontSize: 24, flexShrink: 0 }}>{BS_ICONS[ev.event_type] || '✦'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ev.name}</div>
                            {ev.description && <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{ev.description}</div>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: C.muted }}>
                              {ev.rolling_access && <span style={{ color: C.gold, fontWeight: 600 }}>∞ Rolling access</span>}
                              {!ev.rolling_access && ev.event_date && (
                                <span>📅 {new Date(ev.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              )}
                              {ev.max_attendees > 0 && <span>👥 {ev.rsvp_count ?? 0}/{ev.max_attendees} attending</span>}
                            </div>
                          </div>
                          {ev.rsvp_required && (
                            <RSVPButton event={ev} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {posts.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 14 }}>
                    From the Brand
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {posts.map(p => (
                      <div key={p.id} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{p.title}</div>
                        <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.65 }}>{p.content}</div>
                        <div style={{ fontSize: 11, color: 'rgba(141,153,174,0.4)', marginTop: 10 }}>
                          {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {events.length === 0 && posts.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Nothing posted yet</div>
                  <div style={{ color: C.muted, fontSize: 13 }}>This brand is preparing something exclusive for you. Check back soon.</div>
                </div>
              )}
            </>
          }
        </div>
      </div>
    </div>
  )
}

/* ── RSVP button ── */
function RSVPButton({ event }: { event: any }) {
  const [rsvp, setRsvp] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    setRsvp(r => !r)
    setLoading(false)
    if (!rsvp) toast.success('RSVP confirmed!')
  }

  return (
    <button onClick={toggle} disabled={loading}
      style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: rsvp ? 'none' : `1px solid rgba(255,183,3,0.4)`, backgroundColor: rsvp ? C.gold : 'transparent', color: rsvp ? C.primary : C.gold, opacity: loading ? 0.6 : 1, transition: 'all 0.2s' }}>
      {loading ? '…' : rsvp ? '✓ Going' : 'RSVP'}
    </button>
  )
}
