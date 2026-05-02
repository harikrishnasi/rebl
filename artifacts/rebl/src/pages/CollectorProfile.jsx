import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const C = {
  primary: '#0F0F1A',
  accent: '#E63946',
  cream: '#F1FAEE',
  muted: '#8D99AE',
  gold: '#FFB703',
  card: '#16162A',
  border: 'rgba(255,255,255,0.08)',
}

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
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !prof) {
        toast.error('Profile not found')
        setLoading(false)
        return
      }
      setProfile(prof)

      const { data: its } = await supabase
        .from('items')
        .select('*, product_stories(*)')
        .eq('owner_id', prof.id)
        .order('created_at', { ascending: false })

      setItems(its ?? [])
      setLoading(false)
    }
    load()
  }, [username])

  const isOwn = currentUserId && profile && currentUserId === profile.id
  const verifiedCount = items.filter(i => i.verified).length

  if (loading) return <LoadingScreen />

  if (!profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.muted }}>Profile not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, sans-serif' }}>
      {/* Back nav */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: 0,
        }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        <ProfileHeader profile={profile} items={items} verifiedCount={verifiedCount} isOwn={isOwn} />

        <div style={{ marginTop: 40 }}>
          {items.length === 0 ? (
            <EmptyState isOwn={isOwn} />
          ) : (
            <CollectionGrid items={items} onSelect={setSelectedItem} />
          )}
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

/* ─── PROFILE HEADER ─── */
function ProfileHeader({ profile, items, verifiedCount, isOwn }) {
  const initials = (profile.display_name || profile.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
          backgroundColor: 'rgba(230,57,70,0.2)', border: '2px solid rgba(230,57,70,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
        }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, margin: 0 }}>
              {profile.display_name || profile.username}
            </h1>
            {profile.is_pro && (
              <span style={{
                backgroundColor: C.gold, color: C.primary, fontSize: 11, fontWeight: 800,
                padding: '3px 9px', borderRadius: 100, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>PRO</span>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 14, margin: '4px 0 8px' }}>@{profile.username}</p>
          {profile.bio && (
            <p style={{ color: C.cream, fontSize: 15, lineHeight: 1.6, margin: '0 0 12px', maxWidth: 500 }}>{profile.bio}</p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
            {[
              { label: 'Items', value: items.length },
              { label: 'Verified', value: verifiedCount },
              { label: 'Score', value: profile.collector_score ?? 0 },
            ].map(s => (
              <div key={s.label}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>{s.value}</span>
                <span style={{ color: C.muted, fontSize: 13, marginLeft: 5 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* DNA archetype badge */}
          {profile.archetype && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
              backgroundColor: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.25)',
              borderRadius: 12, padding: '10px 16px',
            }}>
              <span style={{ fontSize: 18 }}>🧬</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.gold }}>{profile.archetype}</div>
                {profile.signature_phrase && (
                  <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', marginTop: 2 }}>
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
            <Link to="/add-item" style={redBtn}>+ Add Item</Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── COLLECTION GRID ─── */
function CollectionGrid({ items, onSelect }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: C.cream }}>
        Collection <span style={{ color: C.muted, fontWeight: 400, fontSize: 15 }}>({items.length})</span>
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: 16,
      }}>
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
        background: 'none', border: `1px solid ${hovered ? 'rgba(230,57,70,0.4)' : C.border}`,
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        backgroundColor: C.card, transition: 'border-color 0.2s, transform 0.15s',
        transform: hovered ? 'translateY(-3px)' : 'none', padding: 0,
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '1/1', backgroundColor: 'rgba(99,44,180,0.15)', position: 'relative', overflow: 'hidden' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            📦
          </div>
        )}
        {item.verified && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            backgroundColor: C.accent, borderRadius: 100, width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>✓</div>
        )}
        {item.rarity_score >= 90 && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: C.gold, color: C.primary, borderRadius: 100,
            padding: '3px 8px', fontSize: 10, fontWeight: 800,
          }}>RARE</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: C.cream }}>
          {item.name}
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{item.brand}</div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                backgroundColor: 'rgba(141,153,174,0.12)', color: C.muted,
                borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 500,
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

/* ─── ITEM MODAL ─── */
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
    const { error } = await supabase
      .from('items')
      .update({ user_story: storyText })
      .eq('id', item.id)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    toast.success('Story saved!')
    setEditingStory(false)
    onStoryUpdated(item.id, storyText)
  }

  const rarityPct = item.rarity_score ?? 0

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        // On wider screens center it
        padding: 'clamp(0px, 5vw, 60px)',
      }}
    >
      <div style={{
        backgroundColor: C.card, borderRadius: 'clamp(20px, 3vw, 24px)',
        width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto',
        border: `1px solid ${C.border}`,
        // On mobile full-width bottom sheet feel
        marginBottom: 0,
      }}>
        {/* Close handle / button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 auto' }} />
        </div>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 20,
          background: 'rgba(255,255,255,0.08)', border: 'none', color: C.cream,
          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {/* Image */}
        <div style={{ aspectRatio: '16/9', backgroundColor: 'rgba(99,44,180,0.15)', overflow: 'hidden' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>📦</div>
          )}
        </div>

        <div style={{ padding: '24px 24px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{item.name}</h2>
              <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>{item.brand}{item.edition ? ` · ${item.edition}` : ''}</p>
              {item.serial_number && (
                <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 0', fontFamily: 'monospace' }}>
                  #{item.serial_number}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              {item.verified && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: 100, padding: '5px 12px',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Verified</span>
                </div>
              )}
              {item.estimated_value && (
                <span style={{ fontWeight: 700, fontSize: 18, color: C.gold }}>
                  ${item.estimated_value.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Rarity bar */}
          {rarityPct > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>RARITY SCORE</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: rarityPct >= 90 ? C.gold : C.cream }}>{rarityPct}/100</span>
              </div>
              <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3, transition: 'width 0.6s ease',
                  width: `${rarityPct}%`,
                  backgroundColor: rarityPct >= 90 ? C.gold : rarityPct >= 70 ? C.accent : C.muted,
                }} />
              </div>
            </div>
          )}

          <Divider />

          {/* Brand Story */}
          {story && (
            <div style={{ marginBottom: 28 }}>
              <SectionLabel>Brand Story</SectionLabel>
              {story.headline && (
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 10px', lineHeight: 1.2 }}>{story.headline}</h3>
              )}
              {story.origin && (
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, margin: '0 0 10px' }}>{story.origin}</p>
              )}
              {story.why_limited && (
                <p style={{ color: C.cream, fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${C.accent}`, paddingLeft: 14, margin: 0 }}>
                  {story.why_limited}
                </p>
              )}
              <Divider />
            </div>
          )}

          {/* Collector Story */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <SectionLabel>Collector Story</SectionLabel>
              {isOwn && !item.user_story && !editingStory && (
                <button onClick={() => setEditingStory(true)} style={{
                  backgroundColor: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.25)',
                  color: C.accent, borderRadius: 8, padding: '6px 14px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                }}>Edit Your Story</button>
              )}
            </div>

            {editingStory ? (
              <div>
                <textarea
                  value={storyText}
                  onChange={e => setStoryText(e.target.value)}
                  placeholder="Write your personal story about this piece..."
                  rows={5}
                  style={{
                    width: '100%', backgroundColor: C.primary, color: C.cream,
                    border: `1px solid rgba(230,57,70,0.4)`, borderRadius: 10,
                    padding: '12px 14px', fontSize: 14, lineHeight: 1.65,
                    resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button onClick={saveStory} disabled={saving} style={{ ...redBtn, flex: 1, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, border: 'none' }}>
                    {saving ? 'Saving…' : 'Save Story'}
                  </button>
                  <button onClick={() => setEditingStory(false)} style={{ ...ghostBtn, flex: 1, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : displayStory ? (
              <div>
                <p style={{ color: C.cream, fontSize: 15, lineHeight: 1.75, margin: 0 }}>{displayStory}</p>
                {item.user_story && isOwn && (
                  <button onClick={() => { setEditingStory(true); setStoryText(item.user_story) }} style={{
                    background: 'none', border: 'none', color: C.muted, fontSize: 13,
                    cursor: 'pointer', padding: 0, marginTop: 8, textDecoration: 'underline',
                  }}>Edit</button>
                )}
              </div>
            ) : (
              <p style={{ color: C.muted, fontSize: 14, fontStyle: 'italic' }}>No story yet.</p>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            {item.acquired_date && (
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Acquired</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(item.acquired_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            )}
          </div>

          {/* Vibe tags */}
          {item.vibe_tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {item.vibe_tags.map(tag => (
                <span key={tag} style={{
                  backgroundColor: 'rgba(141,153,174,0.12)', color: C.muted,
                  borderRadius: 100, padding: '5px 14px', fontSize: 13, fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Owner Room CTA */}
          <a
            href={item.owner_room_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', backgroundColor: 'rgba(88,101,242,0.15)',
              border: '1px solid rgba(88,101,242,0.3)',
              color: '#818cf8', textDecoration: 'none', borderRadius: 12,
              padding: '14px', fontWeight: 700, fontSize: 15,
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: 18 }}>🏠</span> Join Owner Room
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── EMPTY STATE ─── */
function EmptyState({ isOwn }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>📦</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        {isOwn ? 'Your collection starts here.' : 'Nothing here yet.'}
      </h2>
      <p style={{ color: C.muted, fontSize: 15, marginBottom: 32 }}>
        {isOwn ? 'Add your first item and start building your vault.' : 'This collector hasn\'t added anything yet.'}
      </p>
      {isOwn && (
        <Link to="/add-item" style={redBtn}>Add First Item</Link>
      )}
    </div>
  )
}

/* ─── HELPERS ─── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 36, height: 36, border: `3px solid rgba(230,57,70,0.2)`,
          borderTopColor: C.accent, borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: C.muted, fontSize: 14 }}>Loading profile…</span>
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: C.border, margin: '24px 0' }} />
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 11, fontWeight: 700, color: C.accent,
      letterSpacing: 1.5, textTransform: 'uppercase',
    }}>
      <div style={{ width: 16, height: 2, backgroundColor: C.accent }} />
      {children}
    </div>
  )
}

const redBtn = {
  display: 'inline-block', backgroundColor: C.accent, color: C.cream,
  textDecoration: 'none', fontWeight: 700, fontSize: 14,
  padding: '10px 20px', borderRadius: 10, border: 'none',
  textAlign: 'center',
}

const ghostBtn = {
  display: 'inline-block', color: C.cream, textDecoration: 'none',
  fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10,
  border: `1px solid rgba(255,255,255,0.18)`, backgroundColor: 'transparent',
  textAlign: 'center',
}
