import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DropsNav from '@/components/DropsNav'
import { getDemoProduct, demoProducts } from '@/data/demoProducts'
import { formatINR, useCountdown } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'
import PriceChart from '@/components/PriceChart'

const T = {
  bg: '#000000', surface: '#050508', card: '#0A0A12',
  border: '#1A1A1A', borderVis: '#2D2D2D', borderDim: '#1C1C2E',
  white: '#F0F4FF', gray: '#A8B2C4', grayMid: '#5A6380',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

const DEMO_OWNERS = [
  { initials: 'AK', city: 'Mumbai' }, { initials: 'RV', city: 'Delhi' },
  { initials: 'PM', city: 'Bangalore' }, { initials: 'SK', city: 'Chennai' },
  { initials: 'JD', city: 'Hyderabad' }, { initials: 'MN', city: 'Pune' },
]

function StoryBlock({ num, label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 40, alignItems: 'flex-start' }}>
      <div style={{ fontFamily: MONO, fontSize: 96, color: T.borderDim, lineHeight: 1, userSelect: 'none', textAlign: 'right' }}>{num}</div>
      <div>{children}</div>
    </div>
  )
}

export default function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const product = getDemoProduct(productId)

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [activeDot, setActiveDot] = useState(0)
  const [chartOpen, setChartOpen] = useState(false)

  const countdown = useCountdown(product?.endDate)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (product?.category === 'concert_tickets' && product.ticketTiers) {
      const first = product.ticketTiers.find(t => !t.sold)
      if (first) setSelectedTier(first.name)
    }
  }, [productId])

  if (!product) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <DropsNav />
        <span style={{ fontFamily: DISPLAY, fontSize: 48, color: T.white }}>DROP NOT FOUND</span>
        <Link to="/drops" style={{ fontFamily: MONO, fontSize: 11, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em' }}>← Back to Drops</Link>
      </div>
    )
  }

  const pct = (product.unitsSold / product.units) * 100
  const stockColor = pct > 80 ? '#CC0000' : pct > 50 ? T.gray : '#4CAF50'

  function handleAddToCart() {
    if (product.category === 'sneakers' && !selectedSize) {
      toast.error('Select a size first', { style: { background: T.card, color: T.white, border: `1px solid ${T.borderVis}` } })
      return
    }
    if (product.category === 'streetwear' && !selectedSize) {
      toast.error('Select a size first', { style: { background: T.card, color: T.white, border: `1px solid ${T.borderVis}` } })
      return
    }
    const variant = product.category === 'concert_tickets' ? selectedTier : selectedSize
    addToCart(product, variant)
    toast.success(`Added to cart`, { style: { background: T.card, color: T.white, border: `1px solid ${T.borderVis}` } })
  }

  const related = demoProducts.filter(p => p.id !== product.id).slice(0, 3)

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <DropsNav />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: 32 }}>
          <Link to="/drops" style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.1em' }}>← DROPS</Link>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.borderVis, margin: '0 10px' }}>/</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.1em' }}>{product.name.toUpperCase()}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 64, marginBottom: 120 }}>
          <div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                aspectRatio: '1/1',
                background: `linear-gradient(135deg, ${product.mainColor}20 0%, ${T.card} 70%)`,
                border: `1px solid ${T.borderVis}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <span style={{ fontFamily: MONO, fontSize: 180, color: `${product.mainColor}10`, fontWeight: 700, userSelect: 'none', lineHeight: 1 }}>
                  {product.brand.split(' ')[0].toUpperCase()}
                </span>
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  border: `1px solid ${T.gray}`, fontFamily: MONO, fontSize: 8,
                  color: T.gray, padding: '3px 10px', letterSpacing: '0.2em',
                }}>LIMITED RUN</div>
                <div style={{
                  position: 'absolute', bottom: 12, right: 16,
                  fontFamily: MONO, fontSize: 10, color: T.grayMid,
                }}>0{activeDot + 1} / 04</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveDot(i)}
                  style={{
                    flex: 1, height: 60,
                    background: activeDot === i
                      ? `linear-gradient(135deg, ${product.mainColor}30 0%, ${T.card} 100%)`
                      : T.card,
                    border: `1px solid ${activeDot === i ? T.borderVis : T.border}`,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 16, color: T.borderDim }}>◈</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Link
              to={`/brands/${product.brandSlug}`}
              style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.3em', textDecoration: 'none', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}
            >{product.brand}</Link>
            <h1 style={{ fontFamily: MONO, fontSize: 36, color: T.white, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 12 }}>{product.name}</h1>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, marginBottom: 32, lineHeight: 1.6 }}>{product.edition}</div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: MONO, fontSize: 40, color: T.white, fontWeight: 700, letterSpacing: '-1px' }}>{formatINR(product.price)}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 4, letterSpacing: '0.1em' }}>INCLUDES AI VAULT STORY</div>
              {product.pricing && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', opacity: 0.85 }} />
                      <span style={{ fontFamily: MONO, fontSize: 8, color: T.gray, letterSpacing: '0.2em' }}>LIVE DYNAMIC PRICE</span>
                    </div>
                    <button
                      onClick={() => setChartOpen(true)}
                      style={{
                        background: 'none', border: `1px solid ${T.border}`, color: T.grayMid,
                        fontFamily: MONO, fontSize: 7, letterSpacing: '0.2em',
                        padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase',
                      }}
                    >VIEW CHART ↗</button>
                  </div>
                  <div style={{ position: 'relative', height: 3, background: T.border, marginBottom: 6 }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${((product.price - product.pricing.floor) / (product.pricing.ceiling - product.pricing.floor)) * 100}%`,
                      background: T.borderVis,
                    }} />
                    <div style={{
                      position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                      left: `${((product.price - product.pricing.floor) / (product.pricing.ceiling - product.pricing.floor)) * 100}%`,
                      width: 8, height: 8, background: T.white, borderRadius: '50%',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.1em' }}>FLOOR {formatINR(product.pricing.floor)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.1em' }}>CEILING {formatINR(product.pricing.ceiling)}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, marginBottom: 8 }}>{product.unitsSold} of {product.units} claimed</div>
              <div style={{ height: 2, background: T.borderDim, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: stockColor }} />
              </div>
            </div>

            {product.status === 'live' && product.endDate && (
              <div style={{ marginBottom: 28, padding: '14px 16px', border: `1px solid ${T.border}`, background: T.card }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginBottom: 4, letterSpacing: '0.1em' }}>ENDS IN</div>
                <div style={{ fontFamily: MONO, fontSize: 28, color: '#CC3333', letterSpacing: '0.05em' }}>{countdown}</div>
              </div>
            )}

            {product.category === 'concert_tickets' && product.ticketTiers && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>SELECT TICKET TIER</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.ticketTiers.map(tier => (
                    <button
                      key={tier.name}
                      onClick={() => !tier.sold && setSelectedTier(tier.name)}
                      disabled={tier.sold}
                      style={{
                        padding: '14px 16px', border: `1px solid ${selectedTier === tier.name ? T.gray : T.border}`,
                        background: selectedTier === tier.name ? T.borderDim : 'transparent',
                        cursor: tier.sold ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        opacity: tier.sold ? 0.4 : 1,
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: T.white }}>{tier.name}</div>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 2 }}>
                          {tier.sold ? 'SOLD OUT' : `${tier.remaining} remaining`}
                        </div>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 13, color: T.white }}>{formatINR(tier.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(product.category === 'sneakers' || product.category === 'streetwear') && product.sizes && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>SELECT SIZE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.sizes.map(size => {
                    const oos = product.sizesOOS?.includes(size)
                    const selected = selectedSize === size
                    return (
                      <button
                        key={size}
                        onClick={() => !oos && setSelectedSize(size)}
                        disabled={oos}
                        style={{
                          padding: '10px 14px', minWidth: 52,
                          border: `1px solid ${selected ? T.white : T.border}`,
                          background: selected ? T.white : 'transparent',
                          color: selected ? '#000' : oos ? T.borderDim : T.white,
                          fontFamily: MONO, fontSize: 11, cursor: oos ? 'not-allowed' : 'pointer',
                          textDecoration: oos ? 'line-through' : 'none', opacity: oos ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                      >{size}</button>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              style={{
                width: '100%', padding: '16px 0',
                background: T.white, color: '#000', border: 'none',
                fontFamily: MONO, fontSize: 12, letterSpacing: '0.25em',
                cursor: 'pointer', textTransform: 'uppercase', marginBottom: 10,
              }}
            >Add to Cart →</button>
            <button
              style={{
                width: '100%', padding: '14px 0',
                background: 'transparent', color: T.gray,
                border: `1px solid ${T.border}`,
                fontFamily: MONO, fontSize: 11, letterSpacing: '0.15em',
                cursor: 'pointer', textTransform: 'uppercase',
              }}
            >Add to Wishlist</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
              {['Rebl Verified', 'AI Story Included', 'Vault Ready'].map(label => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.gray, letterSpacing: '0.1em', lineHeight: 1.4 }}>→ {label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ margin: '0 -40px', background: T.surface, padding: '80px 40px', marginBottom: 0 }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 64 }}>THE STORY BEHIND THIS DROP</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
              <StoryBlock num="01">
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 16 }}>/ THE ORIGIN</div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, marginBottom: 28, lineHeight: 1.3 }}>{product.story.origin.headline}</h2>
                {product.story.origin.body.map((p, i) => (
                  <p key={i} style={{ fontFamily: BODY, fontSize: 16, color: T.gray, lineHeight: 1.8, marginBottom: 20 }}>{p}</p>
                ))}
                {product.story.origin.pullQuote && (
                  <div style={{
                    borderTop: `1px solid ${T.borderVis}`, borderBottom: `1px solid ${T.borderVis}`,
                    padding: '32px 0', margin: '32px 0', textAlign: 'center',
                  }}>
                    <em style={{ fontFamily: DISPLAY, fontSize: 22, color: T.white, lineHeight: 1.5 }}>"{product.story.origin.pullQuote}"</em>
                  </div>
                )}
              </StoryBlock>

              <StoryBlock num="02">
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 16 }}>/ THIS DROP</div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, marginBottom: 28, lineHeight: 1.3 }}>{product.story.thisEdition.headline}</h2>
                {product.story.thisEdition.body.map((p, i) => (
                  <p key={i} style={{ fontFamily: BODY, fontSize: 16, color: T.gray, lineHeight: 1.8, marginBottom: 20 }}>{p}</p>
                ))}
              </StoryBlock>
            </div>
          </div>
        </div>

        <div style={{
          margin: '0 -40px', background: '#0A0A12',
          borderTop: `1px solid ${T.borderDim}`, borderBottom: `1px solid ${T.borderDim}`,
          padding: '64px 40px', marginBottom: 0,
        }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 16 }}>03 / THE REBL ELEMENT</div>
              <p style={{ fontFamily: BODY, fontSize: 17, color: T.white, lineHeight: 1.8 }}>{product.story.reblElement}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: 72, color: T.borderDim, marginBottom: 24 }}>◈</div>
              <Link
                to="/demo"
                style={{
                  fontFamily: MONO, fontSize: 11, color: T.gray, textDecoration: 'none',
                  letterSpacing: '0.15em', border: `1px solid ${T.borderVis}`, padding: '12px 28px',
                  display: 'inline-block', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.white}
                onMouseLeave={e => e.currentTarget.style.color = T.gray}
              >Learn how the vault works →</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 8 }}>VERIFIED OWNERS ON REBL</div>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 24, color: T.white, fontWeight: 700, marginBottom: 32 }}>
            {product.unitsSold} people already own this on Rebl
          </h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {DEMO_OWNERS.map(owner => (
              <div key={owner.initials} style={{
                width: 52, height: 52, border: `1px solid ${T.borderVis}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 11, color: T.white,
                background: T.card,
              }}>
                {owner.initials}
              </div>
            ))}
            <div style={{
              width: 52, height: 52, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 9, color: T.grayMid,
            }}>+{product.unitsSold - 6}</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, letterSpacing: '0.1em' }}>Join their owner room after purchase →</div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 32 }}>YOU MIGHT ALSO WANT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: T.borderDim }}>
            {related.map(p => (
              <div key={p.id} style={{ background: T.bg }}>
                <Link to={`/drops/product/${p.id}`} style={{ textDecoration: 'none', display: 'block', padding: '24px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', marginBottom: 6 }}>{p.brand.toUpperCase()}</div>
                  <div style={{ fontFamily: MONO, fontSize: 14, color: T.white, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: T.white }}>{formatINR(p.price)}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      {chartOpen && <PriceChart product={product} onClose={() => setChartOpen(false)} />}
    </div>
  )
}
