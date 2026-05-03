import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import StarField from '@/components/StarField'
import CrossHair from '@/components/CrossHair'

const C = {
  void: '#050508', cosmos: '#0A0A12', nebula: '#12121E', crater: '#1C1C2E',
  silver: '#A8B2C4', silverBright: '#C8D4E8', ghost: '#2A2A3E',
  cream: '#F0F4FF', dim: '#5A6380', orbit: '#7B8FA8',
}

const AI_TEXT = "The Air Jordan 1 Chicago is not just a shoe. It is the document of a cultural collision — the moment basketball, rebellion, and style fused into a single object. When Michael Jordan wore this colorway in 1985, Nike was fined $5,000 per game. He wore it anyway. Your story with this piece begins — what does owning it say about you?"

function TypewriterText({ text, active }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(interval); setDone(true) }
    }, 22)
    return () => clearInterval(interval)
  }, [active, text])

  return (
    <span>
      {displayed}
      {!done && <span style={{ animation: 'blink 1s step-end infinite', borderRight: `2px solid ${C.silver}` }}>&nbsp;</span>}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  )
}

const ITEMS = [
  { name: 'Air Jordan 1 Retro High OG Chicago', brand: 'Nike', color: '#B22222' },
  { name: 'Nike Dunk Low Panda', brand: 'Nike', color: '#1C1C2E' },
  { name: 'Supreme Box Logo Hoodie FW23', brand: 'Supreme', color: '#CC0000' },
  { name: 'New Balance 550 White Grey', brand: 'New Balance', color: '#3A3A4A' },
  { name: 'Adidas Samba OG', brand: 'Adidas', color: '#2A2A3E' },
  { name: 'Off-White x Nike Air Force 1', brand: 'Off-White', color: '#8B7355' },
]

const MESSAGES = [
  { user: 'Ravi S.', avatar: 'R', msg: 'Just copped at VegNonVeg drop. Condition is insane.' },
  { user: 'Priya M.', avatar: 'P', msg: 'Anyone know a good crep protect for these?' },
  { user: 'Arjun K.', avatar: 'A', msg: '2 years and the toe box still holds. Zero crease.' },
]

const BARS = [
  { label: 'Buyers', pct: 100 },
  { label: 'Story Done', pct: 89 },
  { label: 'Community', pct: 74 },
  { label: 'Returned', pct: 41 },
]

export default function Demo() {
  const [aiActive, setAiActive] = useState(false)
  const step2Ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAiActive(true) }, { threshold: 0.4 })
    if (step2Ref.current) observer.observe(step2Ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"DM Sans", Inter, sans-serif' }}>
      <style>{`@keyframes pulse-dot{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}`}</style>

      {/* Nav */}
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}`, position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em' }}
            onMouseEnter={e => e.target.style.color = C.silver}
            onMouseLeave={e => e.target.style.color = C.dim}
          >← REBL</Link>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.void,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '8px 20px', backgroundColor: C.silver, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.silverBright}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.silver}
          >Start Free</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px 0' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>INTERACTIVE DEMO</div>
        <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 700, color: C.cream, margin: '0 0 16px', letterSpacing: '-1.5px' }}>See Rebl in 4 minutes.</h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: C.dim, margin: 0 }}>A walkthrough of every core feature. No signup required.</p>
      </div>

      {/* STEP 1 — VAULT */}
      <div id="step-1" style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        <StepLabel n="01" label="YOUR VAULT" />
        <div style={{ backgroundColor: C.nebula, border: `1px solid ${C.ghost}`, padding: 32 }}>
          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${C.ghost}` }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: C.crater, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono", monospace', fontSize: 18, color: C.silver }}>A</div>
            <div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 16, color: C.cream }}>Arjun K.</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>THE GRAIL HUNTER</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                {[['23', 'ITEMS'], ['847', 'SCORE']].map(([v, l]) => (
                  <div key={l} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 14, color: C.cream }}>{v}</span>
                    <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.1em' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Item grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            {ITEMS.map((item, i) => (
              <div key={i} style={{ backgroundColor: C.crater, border: `1px solid ${C.ghost}`, padding: '16px 14px', position: 'relative' }}>
                <div style={{ width: '100%', aspectRatio: '1', backgroundColor: item.color, marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: C.cream, lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim }}>{item.brand}</div>
                {i < 3 && <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80', animation: 'pulse-dot 2s ease-in-out infinite' }} />}
              </div>
            ))}
          </div>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.silver}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Start Your Vault →</Link>
        </div>
      </div>

      {/* STEP 2 — AI STORY */}
      <div ref={step2Ref} style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px clamp(48px,6vw,80px)' }}>
        <StepLabel n="02" label="AI STORY ENGINE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, backgroundColor: C.ghost }}>
          {/* Item card */}
          <div style={{ backgroundColor: C.nebula, padding: 32 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 16 }}>ITEM DETAILS</div>
            <div style={{ backgroundColor: '#B22222', aspectRatio: '1', marginBottom: 20, opacity: 0.3 }} />
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 16, color: C.cream, marginBottom: 4 }}>Air Jordan 1 Chicago</div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim }}>Nike · 1985 / 2022 · Sz 10</div>
          </div>
          {/* Typewriter */}
          <div style={{ backgroundColor: C.nebula, padding: 32 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.silver, letterSpacing: '0.15em', marginBottom: 16 }}>AI PROVENANCE STORY</div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: '#8090A8', lineHeight: 1.8, minHeight: 160 }}>
              <TypewriterText text={AI_TEXT} active={aiActive} />
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.1em', marginBottom: 8 }}>YOUR CHAPTER</div>
              <div style={{ border: `1px solid ${C.ghost}`, padding: '12px 16px', fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: C.dim }}>Tell your story with this piece…</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/add-item" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.silver}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Add Your First Item →</Link>
        </div>
      </div>

      {/* STEP 3 — OWNER ROOMS */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px clamp(48px,6vw,80px)' }}>
        <StepLabel n="03" label="OWNER ROOMS" />
        <div style={{ backgroundColor: C.nebula, border: `1px solid ${C.ghost}` }}>
          <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.ghost}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: C.cream }}># jordan-1-chicago-owners</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, marginTop: 4 }}>347 VERIFIED OWNERS</div>
            </div>
            <CrossHair size={18} color={C.silver} />
          </div>
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {MESSAGES.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.crater, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Mono", monospace', fontSize: 12, color: C.silver, flexShrink: 0 }}>{m.avatar}</div>
                <div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, marginBottom: 6 }}>{m.user}</div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: '#8090A8', lineHeight: 1.5 }}>{m.msg}</div>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 16, borderTop: `1px solid ${C.ghost}` }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.1em' }}>ONLY VERIFIED OWNERS CAN POST</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.silver}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Join Your First Owner Room →</Link>
        </div>
      </div>

      {/* STEP 4 — BRAND DASHBOARD */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px clamp(48px,6vw,80px)' }}>
        <StepLabel n="04" label="BRAND DASHBOARD" />
        <div style={{ backgroundColor: C.nebula, border: `1px solid ${C.ghost}`, padding: 32 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 14, color: C.cream, marginBottom: 28 }}>VegNonVeg Dashboard</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, backgroundColor: C.ghost, marginBottom: 32 }}>
            {[['1,247', 'TOTAL SOLD'], ['89%', 'STORY COMPLETION'], ['74%', 'COMMUNITY JOIN'], ['₹2.3Cr', 'REVENUE']].map(([v, l]) => (
              <div key={l} style={{ backgroundColor: C.nebula, padding: '24px 20px' }}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 24, fontWeight: 700, color: C.cream }}>{v}</div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 8, color: C.dim, letterSpacing: '0.15em', marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, letterSpacing: '0.15em', marginBottom: 16 }}>POST-PURCHASE JOURNEY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BARS.map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.dim, width: 80 }}>{b.label}</div>
                <div style={{ flex: 1, height: 6, backgroundColor: C.crater }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', backgroundColor: b.pct > 80 ? C.silver : b.pct > 60 ? C.orbit : '#5A6380', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, width: 36, textAlign: 'right' }}>{b.pct}%</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/brand/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.silver}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Launch Your Brand →</Link>
        </div>
      </div>

      {/* STEP 5 — COMING NEXT */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px clamp(48px,6vw,80px)', position: 'relative', overflow: 'hidden' }}>
        <StarField />
        <StepLabel n="05" label="WHAT'S COMING" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, backgroundColor: C.ghost, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'NFC TAP', body: 'Hold your phone to the item. Ownership verified in under 1 second.' },
            { label: 'BLOCKCHAIN RECORD', body: 'Every transfer recorded on-chain. Permanent, public, verifiable.' },
            { label: 'NFT IN VAULT', body: 'Soulbound NFT for every verified item. Non-transferable proof.' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: C.void, padding: '32px 28px' }}>
              <div style={{ width: 24, height: 24, border: `1px solid ${C.ghost}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, backgroundColor: C.silver, animation: `pulse-dot ${2 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
              </div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.15em', marginBottom: 12 }}>{item.label}</div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: C.dim, lineHeight: 1.7, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '12px 28px', border: `1px solid ${C.silver}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Get Early Access →</Link>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ backgroundColor: C.void, borderTop: `1px solid ${C.ghost}`, padding: 'clamp(48px,6vw,96px) 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <StarField />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(24px,4vw,48px)', fontWeight: 700, color: C.cream, margin: '0 0 16px', letterSpacing: '-1px' }}>Ready to start your vault?</h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: C.dim, margin: '0 0 40px' }}>Join 500+ collectors already on Rebl.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.void,
              textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '14px 36px', backgroundColor: C.silver, transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.silverBright}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.silver}
            >Create Your Account</Link>
            <Link to="/brand/signup" style={{
              fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim,
              textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '14px 36px', border: `1px solid ${C.ghost}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = C.silver; e.currentTarget.style.borderColor = C.silver }}
              onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.ghost }}
            >Launch a Brand</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepLabel({ n, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim }}>Step {n}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.ghost }} />
      <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.15em' }}>{label}</span>
    </div>
  )
}
