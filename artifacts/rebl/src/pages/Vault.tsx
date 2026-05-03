import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

/* ── Design tokens ── */
const C = {
  primary: '#000000', accent: '#A6A6A6', cream: '#FFFFFF',
  muted: '#555555', gold: '#A6A6A6', card: '#0D0D0D',
  border: '#1A1A1A', sidebar: '#000000',
}

const CAT_LABELS = {
  sneakers: 'Sneakers', streetwear: 'Streetwear', luxury_fashion: 'Luxury',
  watches: 'Watches', art: 'Art', electronics: 'Electronics',
  concert_tickets: 'Concerts', trading_cards: 'Cards', vinyl: 'Vinyl', other: 'Other',
}

const VIEWS = ['Wall', 'By Brand', 'By Category', 'Timeline']

/* ── Rarity helpers ── */
function computeRarity(item) {
  let s = 20
  if (item.verified) s += 35
  if (item.serial_number) s += 15
  if (item.user_story || item.ai_story) s += 15
  if (item.image_url) s += 10
  if (item.brand) s += 5
  return Math.min(s, 100)
}
function rarityLabel(r) {
  if (r >= 91) return 'Ultra Rare'
  if (r >= 71) return 'Very Rare'
  if (r >= 51) return 'Rare'
  if (r >= 31) return 'Uncommon'
  return 'Common'
}
function rarityColor(r) {
  if (r >= 91) return '#22c55e'
  if (r >= 71) return C.accent
  if (r >= 51) return C.gold
  return C.muted
}

/* ── Est value ── */
function fmtValue(items) {
  const total = items.reduce((s, i) => s + (Number(i.purchase_price) || 0), 0)
  if (total === 0) return null
  if (total >= 100000) return `₹${(total / 100000).toFixed(1)}L`
  if (total >= 1000) return `₹${Math.round(total / 1000)}K`
  return `₹${total.toLocaleString('en-IN')}`
}

/* ─────────────────────────────────────────── */

export default function Vault() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('Wall')
  const [selectedItem, setSelectedItem] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [brandMemberships, setBrandMemberships] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setCurrentUserId(session.user.id)

      const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
      if (!prof) { setLoading(false); return }
      setProfile(prof)

      const [itemRes, membRes] = await Promise.all([
        supabase.from('items').select('*')
          .eq('owner_id', prof.id).order('created_at', { ascending: false }),
        session
          ? supabase.from('brand_customers').select('*, brands(id, name, slug), customer_tiers(name, color)').eq('profile_id', prof.id)
          : Promise.resolve({ data: [] }),
      ])
      setItems(itemRes.data || [])
      setBrandMemberships(membRes.data || [])
      setLoading(false)
    }
    load()
  }, [username])

  const isOwn = currentUserId && profile && currentUserId === profile.id
  const estVal = useMemo(() => fmtValue(items), [items])
  const verifiedCount = useMemo(() => items.filter(i => i.verified).length, [items])
  const brandCount = useMemo(() => new Set(items.map(i => i.brand).filter(Boolean)).size, [items])

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
    setSelectedItem(null)
  }

  function updateItemStory(id, story) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, user_story: story } : i))
    setSelectedItem(prev => prev?.id === id ? { ...prev, user_story: story } : prev)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: C.cream }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Vault not found</div>
      <Link to="/" style={{ color: C.accent, fontSize: 14 }}>← Back to Rebl</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .vault-wall{column-count:2;column-gap:12px}
        @media(min-width:560px){.vault-wall{column-count:3}}
        @media(min-width:900px){.vault-wall{column-count:4}}
        .wall-card{break-inside:avoid;margin-bottom:12px;cursor:pointer;border-radius:14px;overflow:hidden;position:relative;animation:fadeUp 0.5s ease both}
        .wall-card img{width:100%;display:block;transition:transform 0.35s ease}
        .wall-card:hover img{transform:scale(1.03)}
        .wall-overlay{position:absolute;bottom:0;left:0;right:0;padding:12px 10px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.82));transition:opacity 0.2s}
        .wall-story{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(15,15,26,0.88);padding:14px;display:flex;flex-direction:column;justify-content:center;opacity:0;transition:opacity 0.22s;pointer-events:none}
        .wall-card:hover .wall-story{opacity:1}
        .tab-btn{background:none;border:none;cursor:pointer;padding:8px 14px;border-radius:20px;font-size:13px;font-weight:700;transition:all 0.15s;white-space:nowrap}
        .hscroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
        .hscroll::-webkit-scrollbar{display:none}
        .timeline-line{position:absolute;left:0;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.07)}
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{ backgroundColor: C.sidebar, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/dashboard" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: C.cream, textDecoration: 'none' }}>Rēbl</Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {isOwn && (
            <>
              <Link to="/add-item" style={{ padding: '7px 16px', border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>+ Add Item</Link>
              <button onClick={() => setShowSettings(s => !s)}
                style={{ padding: '7px 16px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Edit Vault
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ══ HEADER ══ */}
      <header style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, backgroundColor: C.card, border: `1px solid #2D2D2D`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>
            {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.display_name?.[0] || '?')}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 10, color: C.muted, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 10 }}>
              {profile.archetype || 'Collector'}
            </div>
            <h1 style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, letterSpacing: '-0.3px', margin: '0 0 8px', textTransform: 'uppercase' }}>
              {profile.display_name || username}'s Vault
            </h1>
            {profile.username && <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>@{profile.username}</div>}
            {profile.signature_phrase && (
              <p style={{ color: C.muted, fontSize: 14, fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.5 }}>
                "{profile.signature_phrase}"
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Items', val: items.length },
                { label: 'Verified', val: verifiedCount },
                { label: 'Brands', val: brandCount },
                estVal ? { label: 'Est. Value', val: estVal } : null,
              ].filter(Boolean).map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 22, fontWeight: 700, color: C.cream, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vault Settings panel */}
        {showSettings && isOwn && (
          <VaultSettingsPanel profile={profile} onClose={() => setShowSettings(false)} />
        )}
      </header>

      {/* ══ VIEW TABS ══ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 0', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 20px',
              fontFamily: '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: view === v ? C.cream : C.muted,
              borderBottom: view === v ? `2px solid ${C.cream}` : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
              whiteSpace: 'nowrap',
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        {items.length === 0 ? (
          <EmptyVault isOwn={isOwn} />
        ) : (
          <>
            {view === 'Wall'        && <WallView items={items} onSelect={setSelectedItem} isOwn={isOwn} />}
            {view === 'By Brand'    && <ByBrandView items={items} onSelect={setSelectedItem} memberships={brandMemberships} />}
            {view === 'By Category' && <ByCategoryView items={items} onSelect={setSelectedItem} />}
            {view === 'Timeline'    && <TimelineView items={items} onSelect={setSelectedItem} />}
          </>
        )}
      </main>

      {/* ══ ITEM DETAIL MODAL ══ */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOwn={isOwn}
          onClose={() => setSelectedItem(null)}
          onRemove={removeItem}
          onStorySaved={updateItemStory}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════
   EMPTY STATE
════════════════════════════════ */
function EmptyVault({ isOwn }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🏛</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>The vault is empty.</div>
      <div style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>
        {isOwn ? 'Start adding pieces to build your collection.' : 'Nothing here yet.'}
      </div>
      {isOwn && (
        <Link to="/add-item" style={{ backgroundColor: C.accent, color: C.cream, borderRadius: 12, padding: '13px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          Add Your First Item
        </Link>
      )}
    </div>
  )
}

/* ════════════════════════════════
   WALL VIEW — masonry
════════════════════════════════ */
function WallView({ items, onSelect, isOwn }) {
  return (
    <div className="vault-wall">
      {items.map((item, idx) => (
        <div key={item.id} className="wall-card" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => onSelect(item)}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} loading="lazy" />
            : <div style={{ width: '100%', aspectRatio: '4/5', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>◈</div>
          }

          {/* Name overlay */}
          <div className="wall-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              {item.verified && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>✓</span>}
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{item.name}</span>
            </div>
            {item.vibe_tags?.slice(0, 2).map(tag => (
              <span key={tag} style={{ display: 'inline-block', marginRight: 4, marginBottom: 2, padding: '2px 7px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', fontSize: 10, fontWeight: 600 }}>{tag}</span>
            ))}
          </div>

          {/* Hover story */}
          {(item.user_story || item.ai_story) && (
            <div className="wall-story">
              <div style={{ fontSize: 10, color: C.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Story</div>
              <div style={{ fontSize: 12, color: 'rgba(241,250,238,0.82)', lineHeight: 1.65 }}>
                {(item.user_story || item.ai_story || '').slice(0, 120)}…
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════
   BY BRAND VIEW
════════════════════════════════ */
function ByBrandView({ items, onSelect, memberships }) {
  const groups = useMemo(() => {
    const map = {}
    for (const item of items) {
      const key = item.brand || 'Other'
      if (!map[key]) map[key] = { brandName: key, items: [] }
      map[key].items.push(item)
    }
    return Object.values(map).sort((a, b) => b.items.length - a.items.length)
  }, [items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {groups.map(group => {
        const memb = memberships.find(m => m.brands?.name === group.brandName)
        return (
          <div key={group.brandName}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{group.brandName[0]}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{group.brandName}</div>
                {memb?.customer_tiers && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: `#${memb.customer_tiers.color || 'FFB703'}` }}>
                    {memb.customer_tiers.name}
                  </span>
                )}
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>{group.items.length} piece{group.items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="hscroll">
              {group.items.map(item => (
                <HScrollCard key={item.id} item={item} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HScrollCard({ item, onSelect }) {
  return (
    <div onClick={() => onSelect(item)} style={{ flexShrink: 0, width: 160, cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, backgroundColor: C.card, transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
      <div style={{ height: 160, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>◈</div>
        }
      </div>
      <div style={{ padding: '10px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        {item.verified && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>✓ Verified</span>}
      </div>
    </div>
  )
}

/* ════════════════════════════════
   BY CATEGORY VIEW
════════════════════════════════ */
function ByCategoryView({ items, onSelect }) {
  const groups = useMemo(() => {
    const map = {}
    for (const item of items) {
      const key = item.category || 'other'
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      {groups.map(([cat, catItems]) => (
        <div key={cat}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{CAT_LABELS[cat] || cat}</div>
            <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <span style={{ fontSize: 12, color: C.muted }}>{catItems.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
            {catItems.map(item => (
              <HScrollCard key={item.id} item={item} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════
   TIMELINE VIEW
════════════════════════════════ */
function TimelineView({ items, onSelect }) {
  const sorted = useMemo(() =>
    [...items].sort((a, b) => {
      const da = a.acquired_date || a.created_at
      const db = b.acquired_date || b.created_at
      return new Date(db) - new Date(da)
    }), [items])

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', marginBottom: 32 }}>
        The story of a collection — in order.
      </div>
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div className="timeline-line" />
        {sorted.map((item, idx) => {
          const d = item.acquired_date || item.created_at
          const dateStr = d ? new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null
          const prevD = idx > 0 ? (sorted[idx - 1].acquired_date || sorted[idx - 1].created_at) : null
          const prevDateStr = prevD ? new Date(prevD).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null
          const showDate = dateStr && dateStr !== prevDateStr

          return (
            <div key={item.id}>
              {showDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, marginTop: idx > 0 ? 32 : 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: C.accent, marginLeft: -33, marginRight: 0, flexShrink: 0, border: `2px solid ${C.primary}`, boxShadow: `0 0 0 3px ${C.accent}40` }} />
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, textTransform: 'uppercase', letterSpacing: 1 }}>{dateStr}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => onSelect(item)}>
                <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {item.image_url ? <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    {item.verified && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{item.brand}</div>
                  {(item.user_story || item.ai_story) && (
                    <div style={{ fontSize: 12, color: 'rgba(241,250,238,0.55)', lineHeight: 1.6 }}>
                      {(item.user_story || item.ai_story).slice(0, 100)}…
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════
   ITEM DETAIL MODAL
════════════════════════════════ */
function ItemDetailModal({ item, isOwn, onClose, onRemove, onStorySaved }) {
  const [brandStory, setBrandStory] = useState(null)
  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState(item.user_story || item.ai_story || '')
  const [savingStory, setSavingStory] = useState(false)
  const [removing, setRemoving] = useState(false)

  const rarity = computeRarity(item)

  // Fetch brand story
  useEffect(() => {
    if (!item.brand) return
    supabase.from('product_stories').select('*').eq('brand_name', item.brand).eq('published', true)
      .order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => setBrandStory(data?.[0] || null))
  }, [item.id])

  async function saveStory() {
    setSavingStory(true)
    try {
      const { error } = await supabase.from('items').update({ user_story: storyDraft }).eq('id', item.id)
      if (error) throw error
      onStorySaved(item.id, storyDraft)
      setEditingStory(false)
      toast.success('Story saved!')
    } catch (err) { toast.error(err.message) }
    finally { setSavingStory(false) }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      const { error } = await supabase.from('items').delete().eq('id', item.id)
      if (error) throw error
      onRemove(item.id)
      toast.success('Removed from vault')
    } catch (err) { toast.error(err.message); setRemoving(false) }
  }

  async function toggleDisplayOnly() {
    const { error } = await supabase.from('items').update({ display_only: !item.display_only }).eq('id', item.id)
    if (!error) toast.success(item.display_only ? 'Available for sale' : 'Marked display only')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.82)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.primary, width: '100%', maxWidth: 620, maxHeight: '94vh', borderRadius: '24px 24px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.3s ease' }}>

        {/* ── Image top ── */}
        <div style={{ position: 'relative', height: 280, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.04)' }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>◈</div>
          }
          {/* Close */}
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', color: C.cream, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          {/* Verified badge */}
          {item.verified && (
            <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 10px', borderRadius: 20, backgroundColor: 'rgba(34,197,94,0.9)', fontSize: 11, fontWeight: 800, color: '#fff' }}>✓ Verified</div>
          )}
          {/* Display only badge */}
          {item.display_only && (
            <div style={{ position: 'absolute', bottom: 14, left: 14, padding: '4px 10px', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', fontSize: 10, fontWeight: 700, color: C.muted }}>Display Only</div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* Title + brand */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.4, margin: '0 0 4px' }}>{item.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{item.brand}</span>
              {item.edition && <span style={{ fontSize: 12, color: C.muted }}>· {item.edition}</span>}
            </div>
          </div>

          {/* Vibe tags */}
          {item.vibe_tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {item.vibe_tags.map(tag => (
                <span key={tag} style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', fontSize: 11, fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              item.acquired_date ? { label: 'Acquired', val: new Date(item.acquired_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } : null,
              item.purchase_price ? { label: 'Paid', val: `₹${Number(item.purchase_price).toLocaleString('en-IN')}` } : null,
              item.serial_number ? { label: 'Serial', val: `#${item.serial_number}` } : null,
            ].filter(Boolean).map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Rarity bar */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Rarity</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: rarityColor(rarity) }}>{rarityLabel(rarity)}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${rarity}%`, backgroundColor: rarityColor(rarity), borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* ── BRAND STORY ── */}
          {brandStory && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>The Brand Story</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3, margin: '0 0 10px' }}>{brandStory.headline}</h3>
              {brandStory.origin && <p style={{ fontSize: 13, color: 'rgba(241,250,238,0.7)', lineHeight: 1.7, margin: '0 0 10px' }}>{brandStory.origin}</p>}
              {brandStory.why_limited && <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{brandStory.why_limited}</p>}
            </div>
          )}

          {/* ── COLLECTOR STORY ── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 2 }}>Your Story</div>
              {isOwn && !editingStory && (
                <button onClick={() => { setStoryDraft(item.user_story || item.ai_story || ''); setEditingStory(true) }}
                  style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Edit Story ✏
                </button>
              )}
            </div>

            {editingStory ? (
              <div>
                <textarea value={storyDraft} onChange={e => setStoryDraft(e.target.value)} rows={5}
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '12px 14px', color: C.cream, fontSize: 13, lineHeight: 1.7, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={saveStory} disabled={savingStory}
                    style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: savingStory ? 0.7 : 1 }}>
                    {savingStory ? 'Saving…' : 'Save Story'}
                  </button>
                  <button onClick={() => setEditingStory(false)}
                    style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : item.user_story || item.ai_story ? (
              <p style={{ fontSize: 13, color: 'rgba(241,250,238,0.75)', lineHeight: 1.75, margin: 0 }}>
                {item.user_story || item.ai_story}
              </p>
            ) : isOwn ? (
              <button onClick={() => setEditingStory(true)}
                style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px dashed rgba(255,255,255,0.12)`, borderRadius: 10, color: C.muted, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                + Add Your Story
              </button>
            ) : (
              <div style={{ color: C.muted, fontSize: 13, fontStyle: 'italic' }}>No story yet.</div>
            )}
          </div>

          {/* ── CTA + Owner actions ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {item.brand && (
              <Link to={`/brand/${item.brand.toLowerCase().replace(/\s+/g, '-')}#owner-room`}
                style={{ display: 'block', textAlign: 'center', backgroundColor: C.accent, color: C.cream, borderRadius: 12, padding: '13px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                Join Owner Room ↗
              </Link>
            )}

            {isOwn && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={toggleDisplayOnly}
                  style={{ flex: 1, padding: '11px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {item.display_only ? '🔓 Mark for Sale' : '🏛 Display Only'}
                </button>
                <button onClick={handleRemove} disabled={removing}
                  style={{ flex: 1, padding: '11px', backgroundColor: 'rgba(230,57,70,0.08)', border: `1px solid rgba(230,57,70,0.2)`, borderRadius: 10, color: C.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {removing ? 'Removing…' : '🗑 Remove'}
                </button>
              </div>
            )}
          </div>

          {/* Item visibility override (own vault) */}
          {isOwn && (
            <ItemVisibilityRow item={item} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Per-item visibility toggle ── */
function ItemVisibilityRow({ item }) {
  const [vis, setVis] = useState(item.visibility || 'public')
  async function change(v) {
    setVis(v)
    await supabase.from('items').update({ visibility: v }).eq('id', item.id)
  }
  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Item Visibility</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['public', 'connections', 'private'].map(v => (
          <button key={v} onClick={() => change(v)}
            style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: vis === v ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${vis === v ? 'rgba(255,255,255,0.2)' : C.border}`, color: vis === v ? C.cream : C.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
            {v === 'public' ? '🌐' : v === 'connections' ? '👥' : '🔒'} {v}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════
   VAULT SETTINGS PANEL
════════════════════════════════ */
function VaultSettingsPanel({ profile, onClose }) {
  const [vis, setVis] = useState(profile.vault_visibility || 'public')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ vault_visibility: vis }).eq('id', profile.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Vault settings saved'); onClose() }
  }

  return (
    <div style={{ marginTop: 24, backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Vault Privacy</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Who can see your vault?</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { v: 'public',      icon: '🌐', label: 'Public' },
          { v: 'connections', icon: '👥', label: 'Connections' },
          { v: 'private',     icon: '🔒', label: 'Private' },
        ].map(opt => (
          <button key={opt.v} onClick={() => setVis(opt.v)}
            style={{ flex: 1, padding: '12px 8px', borderRadius: 10, backgroundColor: vis === opt.v ? C.accent : 'rgba(255,255,255,0.05)', border: `1px solid ${vis === opt.v ? 'transparent' : C.border}`, color: C.cream, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</div>
            {opt.label}
          </button>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        style={{ width: '100%', backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
