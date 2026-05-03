import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

/* ── Tokens ── */
const C = {
  primary: '#0A0A12', accent: '#A8B2C4', cream: '#F0F4FF',
  muted: '#5A6380', gold: '#FFB703', card: '#12121E',
  border: '#2A2A3E', sidebar: '#050508',
}

const ARCHETYPES = [
  { name: 'The Purist',            icon: '🎯', color: '#60a5fa', desc: 'Only the authentic. Every time.' },
  { name: 'The Trendhunter',       icon: '⚡', color: C.accent,  desc: 'First on every wave.' },
  { name: 'The Heritage Keeper',   icon: '🏺', color: C.gold,    desc: 'History lives in objects.' },
  { name: 'The Hypebeast',         icon: '🔥', color: '#f97316', desc: 'Drops. Collabs. Culture.' },
  { name: 'The Minimalist',        icon: '◽', color: C.muted,   desc: 'Quality over quantity.' },
  { name: 'The Storyteller',       icon: '📖', color: '#a78bfa', desc: 'Every piece has a chapter.' },
  { name: 'The Investor',          icon: '📈', color: '#22c55e', desc: 'Eyes on the long game.' },
  { name: 'The Community Builder', icon: '🤝', color: '#38bdf8', desc: 'Collecting is social.' },
]

const VIBE_TAGS = [
  'Anti-mainstream', 'Grail Hunt', 'First Love', 'Trophy Piece', 'Daily Beater',
  'Investment', 'Gift', 'Memory', 'Community Pick', 'Future Classic',
  'Statement Piece', 'Heritage', 'Underrated', 'Collab Alert', 'One of a Kind',
]

/* ═══════════════════════════════════════════ */

export default function TribePage() {
  const navigate = useNavigate()
  const [profile, setProfile]                   = useState<any>(null)
  const [loading, setLoading]                   = useState(true)
  const [tribePeople, setTribePeople]           = useState<any[]>([])
  const [archetypeCounts, setArchetypeCounts]   = useState<Record<string, number>>({})
  const [localCollectors, setLocalCollectors]   = useState<any[]>([])

  /* Vibe */
  const [selectedVibe, setSelectedVibe]         = useState<string | null>(null)
  const [vibeCollectors, setVibeCollectors]     = useState<any[]>([])
  const [vibeLoading, setVibeLoading]           = useState(false)

  /* Archetype */
  const [selectedArchetype, setSelectedArchetype]     = useState<string | null>(null)
  const [archetypeCollectors, setArchetypeCollectors] = useState<any[]>([])
  const [archetypeLoading, setArchetypeLoading]       = useState(false)

  /* City CTA */
  const [cityInput, setCityInput]   = useState('')
  const [savingCity, setSavingCity] = useState(false)

  /* ── Initial load ── */
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      const userId = session.user.id

      const [profRes, itemRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('items').select('brand, brands(id,name)').eq('owner_id', userId),
      ])

      const prof = profRes.data
      setProfile(prof)

      const myBrands = [...new Set(
        (itemRes.data || []).map((i: any) => i.brands?.name || i.brand).filter(Boolean)
      )] as string[]

      const [tribeRes, archetypeRes, cityRes] = await Promise.all([
        myBrands.length > 0
          ? supabase.from('items')
              .select('owner_id, brand, brands(name), profiles!owner_id(id,username,display_name,avatar_url,archetype,signature_phrase)')
              .in('brand', myBrands.slice(0, 25))
              .neq('owner_id', userId)
              .limit(400)
          : Promise.resolve({ data: [] }),
        supabase.from('profiles').select('archetype').not('archetype', 'is', null),
        prof?.city
          ? supabase.from('profiles')
              .select('id,username,display_name,avatar_url,archetype,signature_phrase')
              .eq('city', prof.city).neq('id', userId).limit(20)
          : Promise.resolve({ data: [] }),
      ])

      /* Group tribe by profile */
      const grouped: Record<string, { profile: any; brands: Set<string>; itemCount: number }> = {}
      for (const item of (tribeRes.data || [])) {
        const pid = (item as any).owner_id
        const p   = (item as any).profiles
        if (!p?.username) continue
        if (!grouped[pid]) grouped[pid] = { profile: p, brands: new Set(), itemCount: 0 }
        const bn = (item as any).brands?.name || (item as any).brand
        if (bn) grouped[pid].brands.add(bn)
        grouped[pid].itemCount++
      }
      setTribePeople(
        Object.values(grouped)
          .filter(g => g.brands.size > 0)
          .sort((a, b) => b.brands.size - a.brands.size)
          .slice(0, 24)
      )

      /* Archetype counts */
      const counts: Record<string, number> = {}
      for (const row of (archetypeRes.data || [])) {
        const a = (row as any).archetype
        if (a) counts[a] = (counts[a] || 0) + 1
      }
      setArchetypeCounts(counts)

      setLocalCollectors(cityRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  /* ── Vibe click ── */
  async function handleVibeSelect(tag: string) {
    if (selectedVibe === tag) { setSelectedVibe(null); setVibeCollectors([]); return }
    setSelectedVibe(tag); setVibeCollectors([]); setVibeLoading(true)
    const { data } = await supabase
      .from('items')
      .select('owner_id, profiles!owner_id(id,username,display_name,avatar_url,archetype,signature_phrase)')
      .contains('vibe_tags', [tag])
      .neq('owner_id', profile?.id || '')
      .limit(120)
    const seen = new Set<string>()
    setVibeCollectors(
      (data || []).filter((i: any) => {
        if (!i.profiles?.username || seen.has(i.owner_id)) return false
        seen.add(i.owner_id); return true
      }).map((i: any) => i.profiles)
    )
    setVibeLoading(false)
  }

  /* ── Archetype click ── */
  async function handleArchetypeSelect(name: string) {
    if (selectedArchetype === name) { setSelectedArchetype(null); setArchetypeCollectors([]); return }
    setSelectedArchetype(name); setArchetypeCollectors([]); setArchetypeLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,username,display_name,avatar_url,archetype,signature_phrase')
      .eq('archetype', name)
      .neq('id', profile?.id || '')
      .limit(32)
    setArchetypeCollectors(data || [])
    setArchetypeLoading(false)
  }

  /* ── Save city ── */
  async function saveCity() {
    const city = cityInput.trim()
    if (!city) return
    setSavingCity(true)
    const { error } = await supabase.from('profiles').update({ city }).eq('id', profile.id)
    if (error) { toast.error(error.message); setSavingCity(false); return }
    setProfile((p: any) => ({ ...p, city }))
    const { data } = await supabase
      .from('profiles').select('id,username,display_name,avatar_url,archetype,signature_phrase')
      .eq('city', city).neq('id', profile.id).limit(20)
    setLocalCollectors(data || [])
    toast.success('City saved!')
    setSavingCity(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .t-hscroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
        .t-hscroll::-webkit-scrollbar{display:none}
        .t-card{flex-shrink:0;width:190px;background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:16px 14px;display:flex;flex-direction:column;gap:10px;transition:border-color 0.15s,transform 0.15s;animation:fadeUp 0.4s ease both}
        .t-card:hover{border-color:rgba(255,255,255,0.18);transform:translateY(-2px)}
        .t-grid .t-card{width:100%}
        .t-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-top:20px}
        .vpill{flex-shrink:0;padding:7px 15px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;white-space:nowrap;border:1px solid transparent}
        .arch-card{border-radius:14px;border:1px solid ${C.border};padding:18px 16px;cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden}
        .arch-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,0.18)}
        .section{margin-bottom:60px}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ backgroundColor: C.sidebar, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/dashboard" style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5, color: C.cream, textDecoration: 'none' }}>Rebl</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/add-item" style={{ color: C.muted, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>+ Add Item</Link>
          {profile?.username && (
            <Link to={`/vault/${profile.username}`}
              style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: C.accent, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: C.cream, textDecoration: 'none', flexShrink: 0 }}>
              {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.display_name?.[0] || '?')}
            </Link>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 22px 80px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 56 }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: -1.5, margin: '0 0 10px', lineHeight: 1.05 }}>
            Find Your People
          </h1>
          <p style={{ color: C.muted, fontSize: 16, margin: 0, lineHeight: 1.6 }}>
            Real collectors. Verified owners. Same taste as you.
          </p>
        </div>

        {/* ══════════════════════════════════════
            01 — SAME BRANDS
        ══════════════════════════════════════ */}
        <div className="section">
          <SHead n="01" title="People Who Own the Same Things"
            sub="Collectors who share brands with your vault" />

          {tribePeople.length === 0 ? (
            <EmptyStrip icon="🔭" title="Add items to find your tribe"
              desc="Once your vault has items, we'll surface collectors with overlapping taste."
              cta="Add an Item" href="/add-item" />
          ) : (
            <div className="t-hscroll">
              {tribePeople.map((entry: any, i: number) => (
                <div key={entry.profile.id} className="t-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <CollectorHead profile={entry.profile} />

                  {entry.profile.archetype && (
                    <ArchBadge name={entry.profile.archetype} />
                  )}

                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                    <span style={{ color: C.cream, fontWeight: 700 }}>{entry.brands.size}</span>
                    {' '}shared brand{entry.brands.size !== 1 ? 's' : ''}
                    <span style={{ margin: '0 4px', opacity: 0.35 }}>·</span>
                    <span style={{ color: C.cream, fontWeight: 700 }}>{entry.itemCount}</span>
                    {' '}item{entry.itemCount !== 1 ? 's' : ''} in common
                  </div>

                  <ViewBtn username={entry.profile.username} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            02 — BROWSE BY VIBE
        ══════════════════════════════════════ */}
        <div className="section">
          <SHead n="02" title="Browse by Vibe"
            sub="Find collectors who share the same energy" />

          <div className="t-hscroll" style={{ marginBottom: 24 }}>
            {VIBE_TAGS.map(tag => {
              const active = selectedVibe === tag
              return (
                <button key={tag} className="vpill" onClick={() => handleVibeSelect(tag)}
                  style={{
                    backgroundColor: active ? C.accent : 'rgba(255,255,255,0.06)',
                    borderColor: active ? 'transparent' : C.border,
                    color: active ? C.cream : C.muted,
                  }}>
                  {tag}
                </button>
              )
            })}
          </div>

          {selectedVibe && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
                Collectors into <span style={{ color: C.cream }}>"{selectedVibe}"</span>
                {!vibeLoading && (
                  <span style={{ fontWeight: 400, marginLeft: 8 }}>({vibeCollectors.length})</span>
                )}
              </div>
              {vibeLoading ? <SpinRow /> : vibeCollectors.length === 0
                ? <NoResult />
                : (
                  <div className="t-grid">
                    {vibeCollectors.map((p: any, i: number) => (
                      <div key={p.id} className="t-card" style={{ animationDelay: `${i * 0.025}s` }}>
                        <CollectorHead profile={p} />
                        {p.archetype && <ArchBadge name={p.archetype} />}
                        <ViewBtn username={p.username} />
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}
        </div>

        {/* ══════════════════════════════════════
            03 — BROWSE BY ARCHETYPE
        ══════════════════════════════════════ */}
        <div className="section">
          <SHead n="03" title="Browse by Archetype"
            sub="Every serious collector has a type." />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(218px, 1fr))', gap: 12, marginBottom: 28 }}>
            {ARCHETYPES.map(arch => {
              const count = archetypeCounts[arch.name] || 0
              const active = selectedArchetype === arch.name
              return (
                <div key={arch.name} className="arch-card"
                  onClick={() => handleArchetypeSelect(arch.name)}
                  style={{
                    backgroundColor: active ? `${arch.color}15` : 'rgba(255,255,255,0.025)',
                    borderColor: active ? `${arch.color}50` : C.border,
                  }}>

                  {/* Count badge */}
                  {count > 0 && (
                    <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 800, backgroundColor: `${arch.color}20`, color: arch.color, padding: '2px 7px', borderRadius: 20 }}>
                      {count}
                    </span>
                  )}

                  <div style={{ fontSize: 26, marginBottom: 8 }}>{arch.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: active ? arch.color : C.cream, transition: 'color 0.15s' }}>
                    {arch.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{arch.desc}</div>

                  {active && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: arch.color, borderRadius: '0 0 14px 14px' }} />
                  )}
                </div>
              )
            })}
          </div>

          {selectedArchetype && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
                {ARCHETYPES.find(a => a.name === selectedArchetype)?.icon}{' '}
                <span style={{ color: C.cream }}>{selectedArchetype}</span> collectors
                {!archetypeLoading && (
                  <span style={{ fontWeight: 400, marginLeft: 8 }}>({archetypeCollectors.length})</span>
                )}
              </div>
              {archetypeLoading ? <SpinRow /> : archetypeCollectors.length === 0
                ? <NoResult />
                : (
                  <div className="t-grid">
                    {archetypeCollectors.map((p: any, i: number) => (
                      <div key={p.id} className="t-card" style={{ animationDelay: `${i * 0.025}s` }}>
                        <CollectorHead profile={p} />
                        {p.signature_phrase && (
                          <div style={{ fontSize: 11, color: C.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
                            "{p.signature_phrase.slice(0, 60)}{p.signature_phrase.length > 60 ? '…' : ''}"
                          </div>
                        )}
                        <ViewBtn username={p.username} />
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}
        </div>

        {/* ══════════════════════════════════════
            04 — PEOPLE IN YOUR CITY
        ══════════════════════════════════════ */}
        <div className="section">
          <SHead n="04"
            title={profile?.city ? `Collectors in ${profile.city}` : 'People in Your City'}
            sub={profile?.city ? 'Serious collectors near you' : undefined}
          />

          {!profile?.city ? (
            <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 24px', maxWidth: 460 }}>
              <div style={{ fontSize: 26, marginBottom: 12 }}>📍</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Add your city to find local collectors</div>
              <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 20 }}>
                Connect with collectors from your city — meetups, trades, shared drops.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveCity()}
                  placeholder="Mumbai, Bangalore, Delhi…"
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '11px 14px', color: C.cream, fontSize: 13, outline: 'none' }}
                />
                <button onClick={saveCity} disabled={savingCity || !cityInput.trim()}
                  style={{ padding: '11px 20px', backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (savingCity || !cityInput.trim()) ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                  {savingCity ? '…' : 'Save'}
                </button>
              </div>
            </div>
          ) : localCollectors.length === 0 ? (
            <EmptyStrip icon="🏙" title={`No other collectors in ${profile.city} yet`}
              desc="Share Rebl with local collectors — you'll show up here for each other." />
          ) : (
            <div className="t-grid">
              {localCollectors.map((p: any, i: number) => (
                <div key={p.id} className="t-card" style={{ animationDelay: `${i * 0.03}s` }}>
                  <CollectorHead profile={p} />
                  {p.archetype && <ArchBadge name={p.archetype} />}
                  {p.signature_phrase && (
                    <div style={{ fontSize: 11, color: C.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
                      "{p.signature_phrase.slice(0, 60)}{p.signature_phrase.length > 60 ? '…' : ''}"
                    </div>
                  )}
                  <ViewBtn username={p.username} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
═══════════════════════════════════════════ */

function SHead({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10, fontWeight: 900, color: C.muted, letterSpacing: 2, padding: '4px 9px', border: `1px solid ${C.border}`, borderRadius: 6, marginTop: 4, flexShrink: 0 }}>{n}</span>
      <div>
        <h2 style={{ fontSize: 'clamp(17px, 3vw, 22px)', fontWeight: 900, letterSpacing: -0.4, margin: '0 0 3px' }}>{title}</h2>
        {sub && <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{sub}</p>}
      </div>
    </div>
  )
}

function CollectorHead({ profile }: { profile: any }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {profile.avatar_url
          ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (profile.display_name?.[0] || '?')}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.display_name || profile.username}
        </div>
        {profile.username && (
          <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            @{profile.username}
          </div>
        )}
      </div>
    </div>
  )
}

function ArchBadge({ name }: { name: string }) {
  const arch = ARCHETYPES.find(a => a.name === name)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, backgroundColor: arch ? `${arch.color}18` : 'rgba(255,183,3,0.12)', color: arch?.color || C.gold, fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
      {arch?.icon} {name}
    </span>
  )
}

function ViewBtn({ username }: { username: string }) {
  return (
    <Link to={`/vault/${username}`}
      style={{ display: 'block', textAlign: 'center', padding: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.cream, textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: 0.2, transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.11)'}
      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.06)'}>
      View Collection ↗
    </Link>
  )
}

function EmptyStrip({ icon, title, desc, cta, href }: { icon: string; title: string; desc: string; cta?: string; href?: string }) {
  return (
    <div style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 22px', display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: 500 }}>
      <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{title}</div>
        <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: cta ? 14 : 0 }}>{desc}</div>
        {cta && href && (
          <Link to={href} style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: C.accent, color: C.cream, borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>{cta}</Link>
        )}
      </div>
    </div>
  )
}

function SpinRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, fontSize: 13, padding: '14px 0' }}>
      <div style={{ width: 16, height: 16, border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      Finding collectors…
    </div>
  )
}

function NoResult() {
  return <div style={{ color: C.muted, fontSize: 13, fontStyle: 'italic', paddingTop: 8 }}>No collectors found here yet.</div>
}
