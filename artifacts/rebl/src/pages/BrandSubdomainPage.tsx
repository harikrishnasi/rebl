import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/* ── useCountdown ── */
function useCountdown(target: string | null) {
  const [diff, setDiff] = useState<number>(target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0)
  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setDiff(Math.max(0, new Date(target).getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return { d, h, m, s: sec, done: diff === 0 }
}

function pad(n: number) { return String(n).padStart(2, '0') }

const DROP_HEADINGS: Record<string, string> = {
  sneakers:         'The Drop',
  streetwear:       'The Drop',
  concert_tickets:  'The Show',
  art:              'The Collection',
  photography:      'The Collection',
  watches:          'The Timepiece',
  jewellery:        'The Edit',
  sports_cards:     'The Pull',
  books:            'The Edition',
}

const BRAND_COLORS = { primary: '#0F0F1A', accent: '#E63946', cream: '#F1FAEE', muted: '#8D99AE', gold: '#FFB703' }

export default function BrandSubdomainPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>()
  const [brand, setBrand] = useState<any>(null)
  const [drops, setDrops] = useState<any[]>([])
  const [story, setStory] = useState<any>(null)
  const [collectors, setCollectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifySlug, setNotifySlug] = useState<string | null>(null)
  const dropsRef = useRef<HTMLElement>(null)

  const primary = brand?.theme_primary || BRAND_COLORS.primary
  const accent   = brand?.theme_accent  || BRAND_COLORS.accent

  useEffect(() => {
    if (!brand) return
    document.documentElement.style.setProperty('--page-primary', primary)
    document.documentElement.style.setProperty('--page-accent',  accent)
    return () => {
      document.documentElement.style.removeProperty('--page-primary')
      document.documentElement.style.removeProperty('--page-accent')
    }
  }, [primary, accent])

  useEffect(() => {
    async function load() {
      const { data: br } = await supabase
        .from('brands')
        .select('*, brand_categories(*), brand_subdomains(*)')
        .eq('slug', brandSlug)
        .single()
      if (!br) { setLoading(false); return }
      setBrand(br)

      const [dropsRes, storyRes, collRes] = await Promise.all([
        supabase.from('drops').select('*').eq('brand_id', br.id)
          .in('status', ['live', 'upcoming']).order('drop_date', { ascending: true }),
        supabase.from('product_stories').select('*').eq('brand_id', br.id)
          .eq('published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('purchases')
          .select('profiles(id, display_name, avatar_url)')
          .eq('brand_id', br.id).limit(12),
      ])
      setDrops(dropsRes.data || [])
      setStory(storyRes.data?.[0] || null)
      const profs = (collRes.data || [])
        .map((p: any) => p.profiles).filter(Boolean)
        .filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i)
      setCollectors(profs)
      setLoading(false)
    }
    load()
  }, [brandSlug])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BRAND_COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: BRAND_COLORS.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!brand) return (
    <div style={{ minHeight: '100vh', background: BRAND_COLORS.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: BRAND_COLORS.cream }}>
      <div style={{ fontSize: 48 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Brand not found</div>
      <Link to="/" style={{ color: BRAND_COLORS.accent }}>← Back to Rebl</Link>
    </div>
  )

  const primaryCat = brand.brand_categories?.find((c: any) => c.is_primary)?.category || 'default'
  const dropHeading = DROP_HEADINGS[primaryCat] || 'The Drop'
  const liveDrops = drops.filter(d => d.status === 'live')
  const upcomingDrops = drops.filter(d => d.status === 'upcoming')

  const textColor = BRAND_COLORS.cream
  const mutedColor = 'rgba(241,250,238,0.55)'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: primary, color: textColor, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .bsp-fade{animation:fadeUp 0.7s ease both}
        .bsp-fade-2{animation:fadeUp 0.7s 0.15s ease both}
        .bsp-fade-3{animation:fadeUp 0.7s 0.3s ease both}
        .notify-btn:hover{opacity:0.85!important}
        .claim-btn:hover{filter:brightness(1.12)!important}
        .drop-card:hover{transform:translateY(-3px)!important;border-color:rgba(255,255,255,0.2)!important}
      `}</style>

      {/* ══ 1. HERO ══ */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle radial glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', backgroundColor: accent, opacity: 0.06, filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="bsp-fade">
          {brand.logo_url
            ? <img src={brand.logo_url} alt={brand.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `2px solid rgba(255,255,255,0.12)`, marginBottom: 32 }} />
            : <div style={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, marginBottom: 32, margin: '0 auto 32px' }}>{brand.name[0]}</div>
          }
        </div>

        <h1 className="bsp-fade-2" style={{ fontSize: 'clamp(36px, 8vw, 80px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20, maxWidth: 800 }}>
          {brand.hero_headline || brand.name}
        </h1>

        {(brand.hero_subheadline || brand.description) && (
          <p className="bsp-fade-3" style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: mutedColor, maxWidth: 560, lineHeight: 1.65, marginBottom: 40 }}>
            {brand.hero_subheadline || brand.description}
          </p>
        )}

        <div className="bsp-fade-3">
          <button
            onClick={() => dropsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="claim-btn"
            style={{ backgroundColor: accent, color: textColor, border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3, transition: 'filter 0.2s' }}>
            See What's Dropping
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.35 }}>
          <div style={{ width: 1, height: 40, backgroundColor: textColor }} />
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</div>
        </div>
      </section>

      {/* ══ 2. DROPS ══ */}
      <section ref={dropsRef as any} id="drops" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, letterSpacing: -1, margin: 0 }}>{dropHeading}</h2>
          {drops.length > 0 && <span style={{ fontSize: 14, color: mutedColor }}>{drops.length} {drops.length === 1 ? 'drop' : 'drops'}</span>}
        </div>

        {drops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: mutedColor }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: textColor, marginBottom: 8 }}>Something is coming.</div>
            <div>Follow {brand.name} on Rebl to be the first to know.</div>
          </div>
        )}

        {/* LIVE DROPS — hero card */}
        {liveDrops.map(drop => (
          <LiveDropCard key={drop.id} drop={drop} accent={accent} textColor={textColor} mutedColor={mutedColor} primary={primary} />
        ))}

        {/* UPCOMING DROPS — grid */}
        {upcomingDrops.length > 0 && (
          <div style={{ marginTop: liveDrops.length ? 60 : 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: mutedColor, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>Upcoming</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {upcomingDrops.map(drop => (
                <UpcomingDropCard key={drop.id} drop={drop} accent={accent} textColor={textColor} mutedColor={mutedColor} primary={primary}
                  onNotify={() => setNotifySlug(drop.id)}
                  notified={notifySlug === drop.id}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══ 3. PRODUCT STORY ══ */}
      {story && (
        <section style={{ padding: '100px 24px', borderTop: `1px solid rgba(255,255,255,0.06)`, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: accent, marginBottom: 24 }}>The Story</div>

            <h2 style={{ fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 36 }}>
              {story.headline}
            </h2>

            {story.origin && (
              <p style={{ fontSize: 18, lineHeight: 1.85, color: mutedColor, marginBottom: 44, maxWidth: 640 }}>
                {story.origin}
              </p>
            )}

            {story.design_intent && (
              <blockquote style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 28, margin: '0 0 44px', fontSize: 22, lineHeight: 1.55, fontWeight: 600, letterSpacing: -0.3 }}>
                {story.design_intent}
              </blockquote>
            )}

            {story.why_limited && (
              <p style={{ fontSize: 16, lineHeight: 1.8, color: mutedColor, fontStyle: 'italic', borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: 28 }}>
                {story.why_limited}
              </p>
            )}

            {story.behind_scenes && (
              <p style={{ fontSize: 15, lineHeight: 1.75, color: mutedColor, marginTop: 28 }}>
                {story.behind_scenes}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ══ 4. COMMUNITY TEASER ══ */}
      {collectors.length > 0 && (
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {/* Avatar stack */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              {collectors.slice(0, 5).map((p: any, i: number) => (
                <div key={p.id} style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: `2px solid ${primary}`, overflow: 'hidden', marginLeft: i > 0 ? -14 : 0, position: 'relative', zIndex: 5 - i, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                  {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.display_name?.[0] || '?')}
                </div>
              ))}
              {collectors.length > 5 && (
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: `2px solid ${primary}`, marginLeft: -14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: mutedColor }}>
                  +{collectors.length - 5}
                </div>
              )}
            </div>

            <p style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, lineHeight: 1.4, marginBottom: 20 }}>
              Join {collectors.length} other collector{collectors.length !== 1 ? 's' : ''} who own{' '}
              <span style={{ color: textColor }}>{brand.name}</span> pieces on Rebl
            </p>
            <p style={{ color: mutedColor, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              Track your collection. Earn your tier. Unlock exclusive access.
            </p>

            <Link to={`/brand/${brand.slug}`}
              style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: textColor, borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.2 }}>
              See the Community ↗
            </Link>
          </div>
        </section>
      )}

      {/* ══ 5. FOOTER ══ */}
      <footer style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {brand.logo_url && <img src={brand.logo_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
          <span style={{ fontWeight: 700, fontSize: 14 }}>{brand.name}</span>
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noreferrer" style={{ color: mutedColor, fontSize: 13, textDecoration: 'none' }}>
              {brand.website.replace(/^https?:\/\//, '')} ↗
            </a>
          )}
        </div>

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, color: mutedColor, fontWeight: 600, letterSpacing: 0.3 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: accent }}>R</span>
          Powered by Rebl ↗
        </a>
      </footer>
    </div>
  )
}

/* ── LIVE DROP HERO CARD ── */
function LiveDropCard({ drop, accent, textColor, mutedColor, primary }: any) {
  const countdown = useCountdown(drop.drop_close_date || drop.drop_date)

  return (
    <div style={{ borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr', marginBottom: 24 }}>
      <style>{`@media(min-width:680px){.live-drop-inner{grid-template-columns:3fr 2fr!important}}`}</style>

      {/* Live pill */}
      <div style={{ gridColumn: '1/-1', padding: '12px 20px', backgroundColor: `${accent}18`, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#22c55e' }}>Live Now</span>
      </div>

      <div className="live-drop-inner" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        {/* Image */}
        <div style={{ minHeight: 280, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {drop.image_url
            ? <img src={drop.image_url} alt={drop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 280 }} />
            : <div style={{ fontSize: 64, opacity: 0.3 }}>📦</div>
          }
        </div>

        {/* Details */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          {drop.tier_required && (
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent }}>
              🔒 {drop.tier_required} access only
            </div>
          )}

          <h3 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15, letterSpacing: -0.5, margin: 0 }}>{drop.name}</h3>

          {drop.description && (
            <p style={{ fontSize: 14, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{drop.description}</p>
          )}

          {/* Price + units */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            {drop.price > 0 && <span style={{ fontSize: 28, fontWeight: 900 }}>₹{Number(drop.price).toLocaleString('en-IN')}</span>}
            {drop.units_remaining != null && (
              <span style={{ fontSize: 13, color: drop.units_remaining < 20 ? '#ef4444' : mutedColor, fontWeight: drop.units_remaining < 20 ? 700 : 400 }}>
                {drop.units_remaining} left
              </span>
            )}
          </div>

          {/* Countdown to close */}
          {drop.drop_close_date && !countdown.done && (
            <div>
              <div style={{ fontSize: 11, color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Closes in</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['D', countdown.d], ['H', countdown.h], ['M', countdown.m], ['S', countdown.s]].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', minWidth: 44, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 0', textAlign: 'center' }}>{pad(v as number)}</div>
                    <div style={{ fontSize: 10, color: mutedColor, marginTop: 4, letterSpacing: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="claim-btn"
            style={{ marginTop: 8, backgroundColor: accent, color: textColor, border: 'none', borderRadius: 12, padding: '16px 28px', fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'filter 0.2s', letterSpacing: 0.3 }}>
            Claim Yours →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── UPCOMING DROP CARD ── */
function UpcomingDropCard({ drop, accent, textColor, mutedColor, primary, onNotify, notified }: any) {
  const countdown = useCountdown(drop.drop_date)

  return (
    <div className="drop-card" style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s' }}>
      <div style={{ height: 180, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {drop.image_url
          ? <img src={drop.image_url} alt={drop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ fontSize: 48, opacity: 0.2 }}>📦</div>
        }
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>{drop.name}</h3>

        {/* Countdown to open */}
        {drop.drop_date && !countdown.done && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: mutedColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Opens in</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['D', countdown.d], ['H', countdown.h], ['M', countdown.m]].map(([l, v]) => (
                <div key={l as string} style={{ fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 8px', fontVariantNumeric: 'tabular-nums' }}>
                  {pad(v as number)}<span style={{ fontSize: 9, color: mutedColor, marginLeft: 2 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {drop.price > 0 && (
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>₹{Number(drop.price).toLocaleString('en-IN')}</div>
        )}

        <button className="notify-btn" onClick={onNotify}
          style={{ width: '100%', backgroundColor: notified ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.07)', color: notified ? '#22c55e' : textColor, border: `1px solid ${notified ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s, background 0.2s' }}>
          {notified ? '✓ Notified' : '🔔 Notify When Live'}
        </button>
      </div>
    </div>
  )
}
