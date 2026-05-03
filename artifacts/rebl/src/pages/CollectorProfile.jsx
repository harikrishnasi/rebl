import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const T = {
  bg: '#000000', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

export default function CollectorProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: prof, error } = await supabase
        .from('profiles').select('*').eq('username', username).single()
      if (error || !prof) {
        toast.error('Profile not found')
        setLoading(false)
        return
      }
      setProfile(prof)
      const { data: its } = await supabase
        .from('items').select('*, product_stories(*)')
        .eq('owner_id', prof.id).order('created_at', { ascending: false })
      setItems(its ?? [])
      setLoading(false)
    }
    load()
  }, [username])

  const isOwn = currentUserId && profile && currentUserId === profile.id
  const verifiedCount = items.filter(i => i.verified).length

  if (loading) return <LoadingScreen />

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: BODY, color: T.grayMid }}>Profile not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.white, fontFamily: BODY }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{ backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/dashboard" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: T.white, textDecoration: 'none' }}>Rēbl</Link>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: T.grayMid, cursor: 'pointer', fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}>← Back</button>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '44px 20px 80px' }}>
        <ProfileHeader profile={profile} items={items} verifiedCount={verifiedCount} isOwn={isOwn} />
        <div style={{ marginTop: 48 }}>
          {items.length === 0 ? <EmptyState isOwn={isOwn} /> : <CollectionGrid items={items} onSelect={setSelectedItem} />}
        </div>
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOwn={isOwn}
          onClose={() => setSelectedItem(null)}
          onStoryUpdated={(id, story) => {
            setItems(prev => prev.map(i => i.id === id ? { ...i, user_story: story } : i))
            setSelectedItem(prev => ({ ...prev, user_story: story }))
          }}
        />
      )}
    </div>
  )
}

/* ── Profile Header ── */
function ProfileHeader({ profile, items, verifiedCount, isOwn }) {
  const initials = (profile.display_name || profile.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, flexShrink: 0,
          backgroundColor: T.card, border: `1px solid ${T.borderVis}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: T.gray }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          {profile.archetype && (
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
              {profile.archetype}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
              {profile.display_name || profile.username}
            </h1>
            {profile.is_pro && (
              <span style={{
                fontFamily: MONO, backgroundColor: T.white, color: T.bg, fontSize: 9,
                fontWeight: 700, padding: '3px 10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>PRO</span>
            )}
          </div>
          <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13, margin: '0 0 8px' }}>@{profile.username}</p>
          {profile.bio && (
            <p style={{ fontFamily: BODY, color: T.white, fontSize: 14, lineHeight: 1.65, margin: '0 0 16px', maxWidth: 500 }}>{profile.bio}</p>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 8 }}>
            {[
              { label: 'Items', value: items.length },
              { label: 'Verified', value: verifiedCount },
              { label: 'Score', value: profile.collector_score ?? 0 },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: T.white, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Archetype + signature */}
          {(profile.archetype || profile.signature_phrase) && (
            <div style={{
              marginTop: 20, border: `1px solid ${T.borderVis}`,
              padding: '14px 18px', display: 'inline-flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 16, color: T.grayMid, lineHeight: 1, marginTop: 2 }}>◎</div>
              <div>
                {profile.archetype && <div style={{ fontFamily: DISPLAY, fontSize: 11, fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{profile.archetype}</div>}
                {profile.signature_phrase && (
                  <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, fontStyle: 'italic' }}>
                    "{profile.signature_phrase}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {isOwn && (
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={ghostBtn}>Edit Profile</Link>
            <Link to="/add-item" style={solidBtn}>+ Add Item</Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Collection Grid ── */
function CollectionGrid({ items, onSelect }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.28em', textTransform: 'uppercase' }}>Collection</div>
        <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.06em' }}>{items.length} pieces</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 1, backgroundColor: T.borderVis }}>
        {items.map(item => (
          <ItemCard key={item.id} item={item} onClick={() => onSelect(item)} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  const tags = item.vibe_tags || []

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none',
        backgroundColor: hovered ? T.card : T.bg,
        overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s', padding: 0, display: 'block', width: '100%',
      }}
    >
      <div style={{ aspectRatio: '1/1', backgroundColor: T.card, position: 'relative', overflow: 'hidden' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 36, color: T.borderVis }}>
            ◈
          </div>
        )}
        {item.verified && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            backgroundColor: T.bg, border: `1px solid ${T.gray}`,
            padding: '3px 8px', fontFamily: MONO, fontSize: 8, fontWeight: 700, color: T.gray,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>◈ VFD</div>
        )}
        {item.rarity_score >= 90 && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: T.white, color: T.bg,
            padding: '3px 8px', fontFamily: MONO, fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
          }}>RARE</div>
        )}
      </div>

      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.white, marginBottom: 4 }}>
          {item.name}
        </div>
        <div style={{ fontFamily: MONO, color: T.grayMid, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.brand}</div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: MONO, color: T.grayMid, border: `1px solid ${T.border}`,
                padding: '2px 8px', fontSize: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

/* ── Item Modal ── */
function ItemModal({ item, isOwn, onClose, onStoryUpdated }) {
  const [editingStory, setEditingStory] = useState(false)
  const [storyText, setStoryText] = useState(item.user_story || '')
  const [saving, setSaving] = useState(false)
  const overlayRef = useRef(null)
  const story = item.product_stories?.[0] ?? null
  const displayStory = item.user_story || item.ai_story

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  async function saveStory() {
    setSaving(true)
    const { error } = await supabase.from('items').update({ user_story: storyText }).eq('id', item.id)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    toast.success('Story saved!')
    setEditingStory(false)
    onStoryUpdated(item.id, storyText)
  }

  const rarityPct = item.rarity_score ?? 0

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: 'clamp(0px, 5vw, 60px)',
    }}>
      <div style={{
        backgroundColor: T.card, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto',
        border: `1px solid ${T.borderVis}`, borderBottom: 'none',
      }}>
        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px 0' }}>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.borderVis}`, color: T.white,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, fontFamily: MONO,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Image */}
        <div style={{ aspectRatio: '16/9', backgroundColor: T.bg, overflow: 'hidden', margin: '0 0 0' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 56, color: T.borderVis }}>◈</div>
          )}
        </div>

        <div style={{ padding: '24px 24px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>{item.name}</h2>
              <p style={{ fontFamily: BODY, color: T.grayMid, margin: 0, fontSize: 13 }}>{item.brand}{item.edition ? ` · ${item.edition}` : ''}</p>
              {item.serial_number && (
                <p style={{ fontFamily: MONO, color: T.grayMid, fontSize: 10, margin: '4px 0 0', letterSpacing: '0.06em' }}>#{item.serial_number}</p>
              )}
            </div>
            {item.verified && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: `1px solid ${T.borderVis}`, padding: '5px 12px',
              }}>
                <div style={{ width: 6, height: 6, backgroundColor: T.gray }} />
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.gray, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verified</span>
              </div>
            )}
          </div>

          {/* Rarity */}
          {rarityPct > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rarity Score</span>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: rarityPct >= 90 ? T.white : T.gray }}>{rarityPct}/100</span>
              </div>
              <div style={{ height: 2, backgroundColor: T.borderVis }}>
                <div style={{
                  height: '100%', transition: 'width 0.6s ease',
                  width: `${rarityPct}%`, backgroundColor: T.white,
                }} />
              </div>
            </div>
          )}

          <div style={{ height: 1, backgroundColor: T.border, margin: '0 0 24px' }} />

          {/* Brand Story */}
          {story && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 1, backgroundColor: T.grayMid }} /> Brand Story
              </div>
              {story.headline && <h3 style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '-0.2px' }}>{story.headline}</h3>}
              {story.origin && <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14, lineHeight: 1.7, margin: '0 0 10px' }}>{story.origin}</p>}
              {story.why_limited && (
                <p style={{ fontFamily: BODY, color: T.white, fontSize: 13, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `2px solid ${T.gray}`, paddingLeft: 14, margin: 0 }}>
                  {story.why_limited}
                </p>
              )}
              <div style={{ height: 1, backgroundColor: T.border, margin: '24px 0' }} />
            </div>
          )}

          {/* Collector Story */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 1, backgroundColor: T.grayMid }} /> Collector Story
              </div>
              {isOwn && !item.user_story && !editingStory && (
                <button onClick={() => setEditingStory(true)} style={{
                  fontFamily: MONO, border: `1px solid ${T.borderVis}`,
                  backgroundColor: 'transparent', color: T.gray, padding: '5px 12px', fontSize: 9,
                  fontWeight: 600, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Edit Story ◈</button>
              )}
            </div>

            {editingStory ? (
              <div>
                <textarea
                  value={storyText} onChange={e => setStoryText(e.target.value)}
                  placeholder="Write your personal story about this piece..."
                  rows={5}
                  style={{
                    width: '100%', backgroundColor: T.bg, color: T.white,
                    border: `1px solid ${T.borderVis}`, padding: '12px 14px',
                    fontSize: 14, lineHeight: 1.65, resize: 'vertical', outline: 'none',
                    fontFamily: BODY, boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button onClick={saveStory} disabled={saving} style={{ ...solidBtn, flex: 1, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, border: 'none' }}>
                    {saving ? 'Saving…' : 'Save Story'}
                  </button>
                  <button onClick={() => setEditingStory(false)} style={{ ...ghostBtn, flex: 1, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : displayStory ? (
              <div>
                <p style={{ fontFamily: BODY, color: T.white, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{displayStory}</p>
                {item.user_story && isOwn && (
                  <button onClick={() => { setEditingStory(true); setStoryText(item.user_story) }} style={{
                    background: 'none', border: 'none', color: T.grayMid, fontFamily: MONO, fontSize: 9,
                    cursor: 'pointer', padding: 0, marginTop: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>◈ Edit</button>
                )}
              </div>
            ) : (
              <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14, fontStyle: 'italic' }}>No story yet.</p>
            )}
          </div>

          {/* Meta */}
          {item.acquired_date && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Acquired</div>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600 }}>{new Date(item.acquired_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          )}

          {/* Vibe tags */}
          {item.vibe_tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {item.vibe_tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: MONO, color: T.grayMid, border: `1px solid ${T.border}`,
                  padding: '4px 12px', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Owner Room CTA */}
          <a href={item.owner_room_url || '#'} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', backgroundColor: T.white, border: 'none',
            color: T.bg, textDecoration: 'none', padding: '14px',
            fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            boxSizing: 'border-box',
          }}>
            ◎ Join Owner Room
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ isOwn }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 48, color: T.grayMid, marginBottom: 20 }}>◈</div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {isOwn ? 'Your collection starts here.' : 'Nothing here yet.'}
      </h2>
      <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14, marginBottom: 32 }}>
        {isOwn ? 'Add your first item and start building your vault.' : "This collector hasn't added anything yet."}
      </p>
      {isOwn && (
        <Link to="/add-item" style={solidBtn}>Add First Item</Link>
      )}
    </div>
  )
}

/* ── Loading ── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 28, height: 28, border: `1px solid #2D2D2D`, borderTopColor: T.gray, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading profile…</span>
      </div>
    </div>
  )
}

const solidBtn = {
  display: 'inline-block', backgroundColor: T.white, color: T.bg,
  textDecoration: 'none', fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 11,
  padding: '11px 22px', border: 'none', textAlign: 'center',
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
}

const ghostBtn = {
  display: 'inline-block', backgroundColor: 'transparent', color: T.gray,
  textDecoration: 'none', fontFamily: '"Space Mono", monospace', fontWeight: 600, fontSize: 10,
  padding: '10px 20px', border: `1px solid #2D2D2D`, textAlign: 'center',
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
}
