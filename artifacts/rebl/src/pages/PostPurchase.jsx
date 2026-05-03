import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const C = {
  primary: '#000000',
  accent: '#A6A6A6',
  cream: '#FFFFFF',
  muted: '#555555',
  gold: '#A6A6A6',
  card: '#0D0D0D',
  border: '#1A1A1A',
}

export default function PostPurchase() {
  const { purchaseId } = useParams()
  const navigate = useNavigate()
  const [screen, setScreen] = useState(0) // 0 = welcome, 1 = story, 2 = community
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [animating, setAnimating] = useState(false)
  const [purchase, setPurchase] = useState(null)
  const [item, setItem] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)

      const { data: purch } = await supabase
        .from('purchases').select('*, items(*)').eq('id', purchaseId).single()

      if (!purch) {
        toast.error('Purchase not found')
        navigate('/dashboard')
        return
      }
      setPurchase(purch)
      setItem(purch.items)
      setLoading(false)
    }
    load()
  }, [purchaseId])

  function goTo(next) {
    if (animating) return
    setDirection(next > screen ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setScreen(next)
      setAnimating(false)
    }, 320)
  }

  if (loading) return <FullLoader />

  const screens = [
    <WelcomeScreen key={0} item={item} onAdvance={() => goTo(1)} />,
    <StoryScreen key={1} item={item} purchase={purchase} profile={profile}
      onNext={() => goTo(2)} />,
    <CommunityScreen key={2} item={item} purchase={purchase} profile={profile}
      navigate={navigate} />,
  ]

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: C.primary, overflow: 'hidden',
      position: 'relative', fontFamily: '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif', color: C.cream,
    }}>
      <ProgressDots current={screen} />
      <div style={{
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${direction * 40}px)` : 'translateX(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {screens[screen]}
      </div>
    </div>
  )
}

/* ─── PROGRESS DOTS ─── */
function ProgressDots({ current }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 10, zIndex: 100,
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: i === current ? 24 : 8, height: 8, borderRadius: 4,
          backgroundColor: i === current ? C.accent : i < current ? 'rgba(230,57,70,0.4)' : 'rgba(255,255,255,0.2)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  )
}

/* ─── SCREEN 1: WELCOME ─── */
function WelcomeScreen({ item, onAdvance }) {
  const [visible, setVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#E63946', '#A6A6A6', '#F1FAEE', '#a855f7'],
    })
    setTimeout(() => confetti({
      particleCount: 60, spread: 100, origin: { y: 0.4, x: 0.3 },
      colors: ['#E63946', '#A6A6A6'],
    }), 300)
    setTimeout(() => confetti({
      particleCount: 60, spread: 100, origin: { y: 0.4, x: 0.7 },
      colors: ['#E63946', '#F1FAEE'],
    }), 500)

    setTimeout(() => setVisible(true), 200)
    setTimeout(() => setSubtitleVisible(true), 900)
    setTimeout(() => onAdvance(), 3200)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '80px 24px',
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(230,57,70,0.12) 0%, transparent 70%), #0F0F1A',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
      `}</style>

      {/* Glow ring */}
      <div style={{
        width: 120, height: 120, borderRadius: '50%', marginBottom: 40,
        background: 'radial-gradient(circle, rgba(230,57,70,0.3) 0%, transparent 70%)',
        border: '2px solid rgba(230,57,70,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48,
        animation: 'pulse-ring 2s ease-in-out infinite',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s',
      }}>
        🎯
      </div>

      <h1 style={{
        fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: 900,
        letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 24px',
        maxWidth: 600,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {item?.name ?? 'Your piece'}
      </h1>

      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 22px)', color: C.muted,
        fontStyle: 'italic', lineHeight: 1.5,
        opacity: subtitleVisible ? 1 : 0,
        transform: subtitleVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        It's yours. Now let's tell your story.
      </p>
    </div>
  )
}

/* ─── SCREEN 2: STORY ─── */
function StoryScreen({ item, purchase, profile, onNext }) {
  const [genState, setGenState] = useState('loading') // loading | done
  const [aiStory, setAiStory] = useState('')
  const [editedStory, setEditedStory] = useState('')
  const [saving, setSaving] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const textareaRef = useRef(null)
  const msgs = ['Researching your item...', 'Crafting your story...', 'Almost ready...']

  useEffect(() => {
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!item) return
    const system = `You are the story engine for Rebl, a premium platform for serious collectors in India. You write compelling, authentic provenance stories. Tone: passionate, editorial, collector-to-collector. Never corporate.`
    const prompt = `A collector just added this item:
Item: ${item.name}
Brand: ${item.brand ?? ''}
Edition: ${item.edition ?? 'Standard'}
Category: ${item.category ?? 'other'}
Date acquired: ${item.acquired_date ?? 'recently'}

Write a 160-word provenance story. Include:
1. The cultural significance or backstory of this item/brand (2-3 sentences)
2. What makes this edition special (2-3 sentences)
3. A personal prompt starting with: 'Your story with this piece begins —'

Write in second person. No headers. No labels. Just the story.`

    callGeminiAPI(prompt, system)
      .then(story => {
        setAiStory(story)
        setEditedStory(story)
        setGenState('done')
      })
      .catch(() => {
        setAiStory('')
        setEditedStory('')
        setGenState('done')
      })
  }, [item?.id])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editedStory])

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all([
        supabase.from('items').update({ user_story: editedStory }).eq('id', item.id),
        supabase.from('purchases').update({ story_completed: true }).eq('id', purchase.id),
      ])
      toast.success('Story saved!')
      onNext()
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, marginBottom: 8 }}>
          Your Story Is Being Written
        </h2>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 36 }}>
          {item?.brand} · {item?.name}
        </p>

        {genState === 'loading' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 20 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{
              width: 48, height: 48, border: '3px solid rgba(230,57,70,0.2)',
              borderTopColor: C.accent, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: C.muted, fontSize: 15, transition: 'opacity 0.3s' }}>{msgs[msgIdx]}</p>
          </div>
        ) : (
          <>
            {aiStory && (
              <div style={{
                backgroundColor: '#0d0d1a', borderLeft: `4px solid ${C.accent}`,
                borderRadius: '0 14px 14px 0', padding: '22px 24px', marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  ✦ Rebl AI Story
                </div>
                <p style={{ color: C.cream, fontSize: 15, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                  {aiStory}
                </p>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 8 }}>
                Add your personal touch
              </label>
              <textarea
                ref={textareaRef}
                value={editedStory}
                onChange={e => setEditedStory(e.target.value)}
                placeholder="Write your personal story about this piece..."
                style={{
                  width: '100%', backgroundColor: C.card, color: C.cream,
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: '14px 16px', fontSize: 15, lineHeight: 1.75,
                  resize: 'none', outline: 'none', fontFamily: '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif',
                  boxSizing: 'border-box', minHeight: 140, overflow: 'hidden',
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', backgroundColor: C.accent, color: C.cream, border: 'none',
                borderRadius: 12, padding: '15px', fontWeight: 700, fontSize: 16,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save My Story'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── SCREEN 3: COMMUNITY ─── */
function CommunityScreen({ item, purchase, profile, navigate }) {
  const [ownerCount, setOwnerCount] = useState(null)
  const [scoreAdded, setScoreAdded] = useState(false)

  useEffect(() => {
    if (!item?.name) return
    supabase
      .from('items').select('id', { count: 'exact', head: true })
      .ilike('name', item.name)
      .then(({ count }) => setOwnerCount(Math.max(0, (count ?? 1) - 1)))
  }, [item?.name])

  useEffect(() => {
    if (scoreAdded || !profile?.id) return
    setScoreAdded(true)
    supabase
      .from('profiles')
      .update({ collector_score: (profile.collector_score ?? 0) + 10 })
      .eq('id', profile.id)
  }, [profile?.id])

  async function joinOwnerRoom() {
    if (purchase?.id) {
      await supabase.from('purchases').update({ community_joined: true }).eq('id', purchase.id)
    }
    window.open(item?.owner_room_url || '#', '_blank')
  }

  async function copyStoryLink() {
    const url = `${window.location.origin}/profile/${profile?.username}`
    await navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, marginBottom: 8 }}>
          You're Not Alone
        </h2>

        {ownerCount !== null && (
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 36 }}>
            {ownerCount > 0
              ? <><span style={{ color: C.cream, fontWeight: 700 }}>{ownerCount} other collector{ownerCount !== 1 ? 's' : ''}</span> own this exact piece on Rebl</>
              : <>You're the <span style={{ color: C.gold, fontWeight: 700 }}>first</span> to add this piece on Rebl</>
            }
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {/* Join Owner Room */}
          <ActionCard
            emoji="🤝"
            title="Join Owner Room"
            desc="Private community of owners"
            variant="accent"
            onClick={joinOwnerRoom}
          />

          {/* Add to Vault */}
          <ActionCard
            emoji="🖼"
            title="Add to Your Vault"
            desc="Make it visible on your profile"
            variant="dark"
            onClick={() => navigate(`/profile/${profile?.username}`)}
          />

          {/* Share Story */}
          <ActionCard
            emoji="🔗"
            title="Share Your Story"
            desc="Copy link to your item story"
            variant="dark"
            onClick={copyStoryLink}
          />
        </div>

        {/* Score badge */}
        <div style={{
          backgroundColor: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)',
          borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32,
        }}>
          <span style={{ fontSize: 24 }}>⭐</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.gold }}>+10 Collector Score</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Added to your profile</div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/profile/${profile?.username ?? ''}`)}
          style={{
            width: '100%', backgroundColor: C.accent, color: C.cream, border: 'none',
            borderRadius: 12, padding: '15px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
          }}
        >
          View My Vault →
        </button>
      </div>
    </div>
  )
}

function ActionCard({ emoji, title, desc, variant, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isAccent = variant === 'accent'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 18,
        padding: '20px 22px', borderRadius: 16, cursor: 'pointer',
        textAlign: 'left',
        backgroundColor: isAccent
          ? hovered ? '#c92c38' : C.accent
          : hovered ? '#1e1e36' : C.card,
        border: `1px solid ${isAccent ? 'transparent' : C.border}`,
        transition: 'background-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.cream }}>{title}</div>
        <div style={{ color: isAccent ? 'rgba(241,250,238,0.75)' : C.muted, fontSize: 13, marginTop: 3 }}>{desc}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: isAccent ? 'rgba(241,250,238,0.7)' : C.muted, fontSize: 18 }}>›</span>
    </button>
  )
}

/* ─── HELPERS ─── */
function FullLoader() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(230,57,70,0.2)', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}
