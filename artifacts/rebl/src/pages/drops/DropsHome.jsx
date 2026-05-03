import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DropsNav from '@/components/DropsNav'
import { demoProducts, getLiveDrops, getUpcomingDrops } from '@/data/demoProducts'
import { formatINR, useCountdown } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const FALLBACK_COLORS = ['#C0392B','#2980B9','#27AE60','#8E44AD','#D35400','#16A085','#2C3E50','#F39C12']

function mapSupaDrop(d, idx) {
  const brand = d.brands || {}
  return {
    id: `supa-${d.id}`,
    brand: brand.name || 'Unknown Brand',
    brandSlug: brand.slug || '',
    name: d.name,
    edition: d.edition || '',
    price: d.price || 0,
    units: d.quantity || 100,
    unitsSold: 0,
    status: d.status || 'upcoming',
    category: 'sneakers',
    dropDate: d.drop_date,
    endDate: null,
    mainColor: brand.theme_primary || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
    _fromSupabase: true,
  }
}

const T = {
  bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D', borderDim: '#111111',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

function DropCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const countdown = useCountdown(product.endDate)
  const pct = (product.unitsSold / product.units) * 100
  const endingSoon = product.endDate && (new Date(product.endDate) - new Date()) < 1000 * 60 * 60 * 24

  const statusColor = product.status === 'live' ? '#4CAF50' : product.status === 'upcoming' ? T.gray : '#CC0000'
  const statusLabel = product.status === 'live' ? 'LIVE' : product.status === 'upcoming' ? 'UPCOMING' : 'SOLD OUT'

  return (
    <Link
      to={`/drops/product/${product.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: T.card, border: `1px solid ${hovered ? T.borderVis : T.border}`,
        transition: 'all 0.2s', transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: 'pointer',
      }}>
        <div style={{
          aspectRatio: '4/5', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${product.mainColor}22 0%, ${T.surface} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: MONO, fontSize: 80, color: `${product.mainColor}15`,
            fontWeight: 700, userSelect: 'none', textAlign: 'center', lineHeight: 1, padding: 16,
          }}>{product.brand.split(' ')[0].toUpperCase()}</span>
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: statusColor, color: '#000',
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em',
            padding: '3px 8px', fontWeight: 700,
          }}>{statusLabel}</div>
          {product.category === 'concert_tickets' && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              border: `1px solid ${T.gray}`, color: T.gray,
              fontFamily: MONO, fontSize: 8, letterSpacing: '0.15em',
              padding: '3px 8px',
            }}>EVENT</div>
          )}
          {hovered && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.85)', padding: '16px',
              display: 'flex', justifyContent: 'center',
              fontFamily: MONO, fontSize: 11, color: T.white, letterSpacing: '0.15em',
              borderTop: `1px solid ${T.borderVis}`,
            }}>SHOP DROP →</div>
          )}
        </div>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>{product.brand}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 13, color: T.white, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 14, color: T.white }}>{formatINR(product.price)}</span>
            {endingSoon && product.status === 'live' && (
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#CC0000', letterSpacing: '0.1em' }}>{countdown}</span>
            )}
          </div>
          {product.pricing?.full?.length > 1 && (() => {
            const pts = product.pricing.full.slice(-10)
            const mn = Math.min(...pts.map(d => d.p))
            const mx = Math.max(...pts.map(d => d.p))
            const rng = mx - mn || 1
            const polyPts = pts.map((d, i) =>
              `${(i / (pts.length - 1)) * 54},${13 - ((d.p - mn) / rng) * 11}`
            ).join(' ')
            const up = pts[pts.length - 1].p >= pts[0].p
            return (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.2em' }}>LIVE PRICE</span>
                  <svg width="54" height="14">
                    <polyline points={polyPts} fill="none" stroke={up ? '#A6A6A6' : '#555555'} strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.1em' }}>
                  {formatINR(product.pricing.floor)} — {formatINR(product.pricing.ceiling)}
                </div>
              </div>
            )
          })()}
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginBottom: 6 }}>
            {product.unitsSold} of {product.units} claimed
          </div>
          <div style={{ height: 2, background: T.borderDim, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${pct}%`,
              background: pct > 80 ? '#CC0000' : pct > 50 ? T.gray : '#4CAF50',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function UpcomingCard({ product }) {
  const countdown = useCountdown(product.dropDate)
  const notified = JSON.parse(localStorage.getItem('rebl_waitlist') || '[]').includes(product.id)
  const [isNotified, setIsNotified] = useState(notified)

  function handleNotify(e) {
    e.preventDefault()
    const list = JSON.parse(localStorage.getItem('rebl_waitlist') || '[]')
    if (!list.includes(product.id)) {
      localStorage.setItem('rebl_waitlist', JSON.stringify([...list, product.id]))
    }
    setIsNotified(true)
    toast.success('You\'ll be notified when this drops.', { style: { background: '#0D0D0D', color: '#FFFFFF', border: '1px solid #2D2D2D' } })
  }

  return (
    <div style={{
      minWidth: 260, background: T.card, border: `1px solid ${T.border}`, padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase' }}>{product.brand}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 13, color: T.white, fontWeight: 700, lineHeight: 1.3 }}>{product.name}</div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>{product.edition}</div>
      <div style={{ fontFamily: MONO, fontSize: 18, color: T.white, letterSpacing: '0.1em' }}>{countdown}</div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>DROPS IN</div>
      <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.15em' }}>
        STARTING PRICE · {formatINR(product.pricing?.floor)} — {formatINR(product.pricing?.ceiling)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: T.white }}>{formatINR(product.price)}</span>
        <button
          onClick={handleNotify}
          style={{
            background: isNotified ? T.borderDim : T.white, color: isNotified ? T.gray : '#000',
            border: 'none', fontFamily: MONO, fontSize: 9, letterSpacing: '0.15em',
            padding: '6px 14px', cursor: isNotified ? 'default' : 'pointer', textTransform: 'uppercase',
          }}
        >{isNotified ? 'NOTIFIED ✓' : 'NOTIFY ME'}</button>
      </div>
    </div>
  )
}

function EventCard({ product }) {
  const countdown = useCountdown(product.endDate)
  return (
    <Link to={`/drops/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: `linear-gradient(135deg, ${product.mainColor}18 0%, ${T.card} 100%)`,
        border: `1px solid ${product.mainColor}33`, padding: '28px 32px',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
        transition: 'border-color 0.2s', cursor: 'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = `${product.mainColor}66`}
        onMouseLeave={e => e.currentTarget.style.borderColor = `${product.mainColor}33`}
      >
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: product.accentColor || T.gray, letterSpacing: '0.3em', marginBottom: 8 }}>LIVE EVENT</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 20, color: T.white, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>{product.name}</div>
          <div style={{ fontFamily: BODY, fontSize: 13, color: T.gray, marginBottom: 12 }}>{product.eventDate} · {product.eventVenue}</div>
          {product.ticketTiers && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.ticketTiers.map(t => (
                <span key={t.name} style={{
                  fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em',
                  border: `1px solid ${t.sold ? T.borderDim : T.borderVis}`,
                  color: t.sold ? T.grayMid : T.gray, padding: '3px 10px',
                  textDecoration: t.sold ? 'line-through' : 'none',
                }}>{t.name} · {formatINR(t.price)}{t.sold ? ' · SOLD OUT' : ` · ${t.remaining} left`}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginBottom: 4 }}>ENDS IN</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: T.white }}>{countdown}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: T.white, fontWeight: 700, marginTop: 16 }}>{formatINR(product.price)}</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>from</div>
          {product.pricing && (
            <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.12em', marginTop: 5, textAlign: 'right' }}>
              LIVE · {formatINR(product.pricing.floor)}–{formatINR(product.pricing.ceiling)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function FeaturedBanner({ product }) {
  const countdown = useCountdown(product.endDate)
  const navigate = useNavigate()
  const pct = (product.unitsSold / product.units) * 100

  return (
    <div style={{
      height: '70vh', minHeight: 500, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at 60% 50%, ${product.mainColor}20 0%, ${T.bg} 70%)`,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: MONO, fontSize: 'clamp(80px, 18vw, 220px)', color: `${product.mainColor}08`,
          fontWeight: 700, userSelect: 'none', lineHeight: 1,
        }}>{product.brand.split(' ')[0].toUpperCase()}</span>
      </div>
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '64px 40px', width: '100%' }}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#4CAF50', letterSpacing: '0.25em' }}>LIVE DROP</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.15em' }}>{product.brand.toUpperCase()}</span>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px, 4vw, 44px)', color: T.white, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>{product.name}</div>
          <div style={{ fontFamily: BODY, fontSize: 14, color: T.gray, marginBottom: 24 }}>{product.edition}</div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 32, color: T.white, fontWeight: 700 }}>{formatINR(product.price)}</div>
              {product.pricing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.2em' }}>LIVE PRICE</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid }}>
                    {formatINR(product.pricing.floor)} — {formatINR(product.pricing.ceiling)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, marginBottom: 4 }}>ENDS IN</div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: '#CC3333', letterSpacing: '0.05em' }}>{countdown}</div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, marginBottom: 4 }}>{product.unitsSold} / {product.units} CLAIMED</div>
              <div style={{ width: 140, height: 2, background: T.borderDim }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#CC0000' : T.gray }} />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/drops/product/${product.id}`)}
            style={{
              background: T.white, color: '#000', border: 'none',
              fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em',
              padding: '14px 36px', cursor: 'pointer', textTransform: 'uppercase',
            }}
          >Shop Now →</button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
    </div>
  )
}

export default function DropsHome() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [supaDrops, setSupaDrops] = useState([])

  useEffect(() => {
    async function fetchDrops() {
      const { data: drops, error } = await supabase
        .from('drops')
        .select('id, brand_id, name, edition, quantity, price, drop_date, status')
        .order('drop_date', { ascending: false })
        .limit(50)
      if (error || !drops?.length) return

      const brandIds = [...new Set(drops.map(d => d.brand_id).filter(Boolean))]
      let brandsMap = {}
      if (brandIds.length) {
        const { data: brands } = await supabase
          .from('brands')
          .select('id, name, slug, logo_url, theme_primary')
          .in('id', brandIds)
        if (brands) brands.forEach(b => { brandsMap[b.id] = b })
      }

      setSupaDrops(drops.map((d, i) => mapSupaDrop({ ...d, brands: brandsMap[d.brand_id] }, i)))
    }
    fetchDrops()
  }, [])

  const filterMap = { All: null, Sneakers: 'sneakers', Streetwear: 'streetwear', Events: 'concert_tickets' }
  const categoryFilter = filterMap[activeFilter]

  const allProducts = [...demoProducts, ...supaDrops]

  const liveDrops = allProducts.filter(p => p.status === 'live')
  const upcomingDrops = allProducts.filter(p => p.status === 'upcoming')
  const events = allProducts.filter(p => p.category === 'concert_tickets')
  const featured = allProducts.find(p => p.id === 'nike-aj1-chicago-2025') || allProducts[0]

  const filtered = categoryFilter
    ? allProducts.filter(p => p.category === categoryFilter)
    : allProducts.filter(p => p.category !== 'concert_tickets')

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <DropsNav activeFilter={activeFilter} onFilter={setActiveFilter} />

      <FeaturedBanner product={featured} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        {(activeFilter === 'All' || activeFilter === 'Sneakers' || activeFilter === 'Streetwear') && (
          <section style={{ marginBottom: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>Currently available</div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE NOW</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: MONO, fontSize: 9, color: '#4CAF50', letterSpacing: '0.2em' }}>{liveDrops.filter(p => p.category !== 'concert_tickets').length} ACTIVE</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: T.borderDim }}>
              {(categoryFilter ? allProducts.filter(p => p.category === categoryFilter && p.status === 'live') : liveDrops.filter(p => p.category !== 'concert_tickets')).map(p => (
                <div key={p.id} style={{ background: T.bg }}>
                  <DropCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeFilter === 'All' || activeFilter === 'Sneakers') && upcomingDrops.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 8 }}>MARK YOUR CALENDAR</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, letterSpacing: '0.05em' }}>UPCOMING DROPS</h2>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
              {upcomingDrops.map(p => <UpcomingCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {(activeFilter === 'All' || activeFilter === 'Events') && events.length > 0 && (
          <section>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 8 }}>LIVE EXPERIENCES</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, letterSpacing: '0.05em' }}>EVENT TICKETS</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.borderDim }}>
              {events.map(p => (
                <div key={p.id} style={{ background: T.bg }}>
                  <EventCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
