import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const C = {
  primary: '#0F0F1A',
  accent: '#E63946',
  cream: '#F1FAEE',
  muted: '#8D99AE',
  gold: '#FFB703',
  card: '#16162A',
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Vault />
      <PostPurchase />
      <ForBrands />
      <Tribe />
      <ComingSoon />
      <Footer />
    </div>
  )
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled ? 'rgba(15,15,26,0.95)' : C.primary,
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <span style={{ fontWeight: 800, fontSize: 22, color: C.cream, letterSpacing: '-0.5px' }}>Rebl</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{
            color: C.cream, textDecoration: 'none', fontSize: 14, fontWeight: 500,
            padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
          >Login</Link>
          <Link to="/signup" style={{
            backgroundColor: C.accent, color: C.cream, textDecoration: 'none',
            fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8,
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.88'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >Join</Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '100px 24px 60px',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,44,180,0.35) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(230,57,70,0.15) 0%, transparent 60%), #0F0F1A',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 30% at 20% 50%, rgba(60,30,120,0.2) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      <div style={{ maxWidth: 760, position: 'relative', animation: 'floatUp 0.8s ease forwards' }}>
        <div style={{
          display: 'inline-block', marginBottom: 20,
          padding: '6px 16px', borderRadius: 100,
          backgroundColor: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)',
          fontSize: 12, fontWeight: 600, letterSpacing: 1, color: C.accent, textTransform: 'uppercase',
        }}>For serious collectors</div>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05,
          letterSpacing: '-2px', color: C.cream, margin: '0 0 24px',
        }}>
          Mass market<br />is over.
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: C.muted, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          Rebl is for collectors who refuse to blend in. Showcase what you own.
          Prove it's real. Find your people.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            backgroundColor: C.accent, color: C.cream, textDecoration: 'none',
            fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 10,
            transition: 'transform 0.15s, opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >Start Your Collection</Link>
          <Link to="/brand/signup" style={{
            color: C.cream, textDecoration: 'none',
            fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          >Explore Drops</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
        marginTop: 64, position: 'relative',
      }}>
        {[
          { value: '500+', label: 'Collectors' },
          { value: '20+', label: 'Brands' },
          { value: '1000+', label: 'Verified Items' },
        ].map((s, i) => (
          <div key={i} style={{
            backgroundColor: 'rgba(22,22,42,0.85)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px 32px', textAlign: 'center', minWidth: 140,
            backdropFilter: 'blur(12px)',
            animation: `floatCard ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.cream }}>{s.value}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── THE PROBLEM ─── */
function Problem() {
  const statements = [
    'Tired of showing your collection in Stories that disappear in 24 hours?',
    'Tired of being questioned about whether you actually own it?',
    'Tired of not knowing the 200 other people who care as much as you do?',
  ]
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {statements.map((s, i) => (
          <p key={i} style={{
            fontSize: 'clamp(20px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.3,
            color: i === 0 ? C.cream : `rgba(241,250,238,${0.75 - i * 0.1})`,
            margin: 0,
          }}>{s}</p>
        ))}
      </div>
      <div style={{ margin: '56px 0 40px', height: 2, backgroundColor: C.accent, width: 80 }} />
      <p style={{
        fontSize: 'clamp(22px, 4vw, 40px)', fontStyle: 'italic', fontWeight: 700,
        color: C.cream, lineHeight: 1.3,
      }}>
        Rebl is the place<br />you've been looking for.
      </p>
    </section>
  )
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Buy a Drop', desc: 'Purchase from a Rebl-partnered brand. Your ownership is recorded the moment you check out.' },
    { n: '02', title: 'AI Story Generated', desc: 'Our AI crafts a personalised story about your item — the drop, the culture, what it means.' },
    { n: '03', title: 'Verified + Community', desc: 'Your item is verified on your profile. Join the owner room. Connect with collectors like you.' },
  ]
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px', backgroundColor: C.card }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>How it works</SectionLabel>
        <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, margin: '12px 0 56px', letterSpacing: '-1px' }}>
          Three steps to own<br />your collection.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              padding: '36px 32px', borderRadius: 20,
              backgroundColor: C.primary, border: '1px solid rgba(255,255,255,0.07)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 20, right: 24, fontSize: 64, fontWeight: 900,
                color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
              }}>{s.n}</div>
              <div style={{
                width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(230,57,70,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, fontSize: 14, fontWeight: 800, color: C.accent,
              }}>{s.n}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>{s.title}</h3>
              <p style={{ color: C.muted, lineHeight: 1.65, margin: 0, fontSize: 15 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── THE VAULT ─── */
function Vault() {
  const placeholders = Array.from({ length: 6 })
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60, alignItems: 'center',
      }}>
        <div>
          <SectionLabel>Your Vault</SectionLabel>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, margin: '12px 0 24px', letterSpacing: '-1px', lineHeight: 1.15 }}>
            Permanent.<br />Organised.<br />Legacy.
          </h2>
          <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, maxWidth: 400 }}>
            Your vault is your collection, forever. Not a story that disappears. Not a post that gets buried.
            A living record of everything you own, every story behind it, every drop you were part of.
          </p>
          <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, maxWidth: 400, marginTop: 16 }}>
            This is your legacy. Make it count.
          </p>
          <Link to="/signup" style={{
            display: 'inline-block', marginTop: 32, backgroundColor: C.accent, color: C.cream,
            textDecoration: 'none', fontWeight: 700, fontSize: 15, padding: '13px 26px', borderRadius: 10,
          }}>Build Your Vault</Link>
        </div>

        {/* Vault mockup */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {placeholders.map((_, i) => (
            <div key={i} style={{
              aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden',
              backgroundColor: C.card, border: '1px solid rgba(255,255,255,0.07)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, rgba(${30 + i * 15},${20 + i * 10},${60 + i * 12},0.8), rgba(15,15,26,0.6))`,
              }} />
              <div style={{
                position: 'absolute', bottom: 10, left: 10, right: 10,
              }}>
                <div style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 6, width: '70%' }} />
                <div style={{ height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', width: '45%' }} />
              </div>
              {i === 1 && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, backgroundColor: C.accent,
                  borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: C.cream,
                }}>Verified</div>
              )}
              {i === 3 && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, backgroundColor: C.gold,
                  borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: C.primary,
                }}>Rare</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── POST-PURCHASE ─── */
function PostPurchase() {
  const features = [
    { icon: '✦', title: 'AI Story', desc: 'Every item gets a personalised story generated by AI. The drop, the culture, what it means to you.' },
    { icon: '◈', title: 'Owner Rooms', desc: 'Private rooms for verified owners of the same drop. Connect with the people who get it.' },
    { icon: '◉', title: 'Collector Score', desc: 'A living score that reflects the depth and authenticity of your collection.' },
  ]
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px', backgroundColor: C.card }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60, alignItems: 'center',
      }}>
        {/* Profile mockup */}
        <div style={{
          backgroundColor: C.primary, borderRadius: 24, padding: 28,
          border: '1px solid rgba(255,255,255,0.07)', order: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(230,57,70,0.2)', border: '2px solid rgba(230,57,70,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>@rebel_collector</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Collector Score: 847</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Nike Dunk Low', 'Supreme Box', 'Stüssy Jacket', 'Off-White Tee'].map((item, i) => (
              <div key={i} style={{
                backgroundColor: C.card, borderRadius: 12, padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Item {i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  <span style={{ fontSize: 11, color: C.muted }}>Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ order: 1 }}>
          <SectionLabel>Post-purchase</SectionLabel>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, margin: '12px 0 12px', letterSpacing: '-1px', lineHeight: 1.15 }}>
            This is where<br />Rebl lives.
          </h2>
          <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
            The drop is just the beginning. What happens after you buy is where culture is made.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 18 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(230,57,70,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: C.accent, fontSize: 16,
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOR BRANDS ─── */
function ForBrands() {
  const benefits = [
    { icon: '📊', title: 'Post-purchase data', desc: 'Know exactly who bought, where they are, and what else they collect.' },
    { icon: '✅', title: 'Verified communities', desc: 'Build genuine owner rooms — not followers, actual buyers of your drops.' },
    { icon: '🏆', title: 'Tier loyalty', desc: 'Reward your most dedicated collectors with exclusive access and early drops.' },
  ]
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel>For Brands</SectionLabel>
        <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, margin: '12px 0 16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
          Know Your Biggest Fans<br />After the Drop.
        </h2>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 56px' }}>
          The sale is just the start. Rebl gives you a direct line to the people who care most about your brand.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, textAlign: 'left', marginBottom: 48 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              backgroundColor: C.card, borderRadius: 20, padding: '32px 28px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{b.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{b.title}</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
        <Link to="/brand/signup" style={{
          display: 'inline-block', backgroundColor: C.accent, color: C.cream, textDecoration: 'none',
          fontWeight: 700, fontSize: 16, padding: '15px 36px', borderRadius: 12,
        }}>Partner with Rebl</Link>
      </div>
    </section>
  )
}

/* ─── FIND YOUR TRIBE ─── */
function Tribe() {
  return (
    <section style={{
      padding: 'clamp(60px,8vw,120px) 24px',
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,44,180,0.2) 0%, transparent 70%), #0F0F1A',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <SectionLabel>Find Your Tribe</SectionLabel>
        <h2 style={{ fontSize: 'clamp(28px,5vw,58px)', fontWeight: 900, margin: '12px 0 24px', letterSpacing: '-2px', lineHeight: 1.1 }}>
          Find the 12 people in Mumbai<br />who own the same thing as you.
        </h2>
        <p style={{ color: C.muted, fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.7 }}>
          Real collectors. Verified owners. Same taste as you.
        </p>
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: -12, flexWrap: 'wrap' }}>
          {['🇮🇳', '🇯🇵', '🇺🇸', '🇩🇪', '🇧🇷', '🇬🇧', '🇰🇷', '🇳🇬'].map((flag, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: '50%',
              backgroundColor: C.card, border: `2px solid ${C.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginLeft: i > 0 ? -14 : 0, zIndex: 10 - i,
              position: 'relative',
            }}>{flag}</div>
          ))}
        </div>
        <Link to="/signup" style={{
          display: 'inline-block', marginTop: 40, color: C.accent, textDecoration: 'none',
          fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10,
          border: `1px solid ${C.accent}`,
        }}>Find Your People</Link>
      </div>
    </section>
  )
}

/* ─── COMING SOON ─── */
function ComingSoon() {
  const items = [
    { icon: '📡', title: 'NFC Authentication', desc: 'Tap your physical item to verify it\'s real, instantly.' },
    { icon: '⛓️', title: 'Blockchain Provenance', desc: 'Immutable ownership records from factory to your vault.' },
    { icon: '🔄', title: 'P2P Resale Market', desc: 'Sell verified items directly to collectors in the community.' },
  ]
  return (
    <section style={{ padding: 'clamp(60px,8vw,120px) 24px', backgroundColor: C.card }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>What's Next</SectionLabel>
        <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, margin: '12px 0 48px', letterSpacing: '-1px' }}>
          Coming Soon.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              backgroundColor: C.primary, borderRadius: 20, padding: '36px 28px',
              border: '1px solid rgba(255,255,255,0.07)', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 20, right: 20,
                backgroundColor: 'rgba(255,183,3,0.15)', border: '1px solid rgba(255,183,3,0.3)',
                borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                color: C.gold, letterSpacing: 0.5,
              }}>Coming Soon</div>
              <div style={{ fontSize: 36, marginBottom: 20 }}>{item.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{
      padding: 'clamp(40px,6vw,80px) 24px 40px',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', marginBottom: 8 }}>Rebl</div>
            <p style={{ color: C.muted, fontSize: 14, maxWidth: 240, lineHeight: 1.65, margin: 0 }}>
              The platform for collectors who refuse to blend in.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {[
              { label: 'Product', links: ['How it works', 'The Vault', 'Pricing'] },
              { label: 'Brands', links: ['Partner with us', 'Brand dashboard', 'Case studies'] },
              { label: 'Community', links: ['Find your tribe', 'Drops', 'Blog'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 16 }}>{col.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((link, j) => (
                    <a key={j} href="#" style={{ color: C.cream, textDecoration: 'none', fontSize: 14, opacity: 0.7, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.target.style.opacity = '1'}
                      onMouseLeave={e => e.target.style.opacity = '0.7'}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ color: C.muted, fontSize: 13 }}>© 2025 Rebl. All rights reserved.</span>
          <span style={{ color: 'rgba(141,153,174,0.5)', fontSize: 12 }}>Powered by Rebl</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── HELPERS ─── */
function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 1.5, textTransform: 'uppercase',
    }}>
      <div style={{ width: 20, height: 2, backgroundColor: C.accent }} />
      {children}
    </div>
  )
}
