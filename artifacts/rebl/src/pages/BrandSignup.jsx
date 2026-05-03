import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

const C = {
  primary: '#000000',
  accent: '#A6A6A6',
  cream: '#FFFFFF',
  muted: '#555555',
  gold: '#A6A6A6',
  card: '#0D0D0D',
  border: '#1A1A1A',
}

const CATEGORIES = [
  { value: 'sneakers', label: 'Sneakers & Footwear', emoji: '👟' },
  { value: 'streetwear', label: 'Streetwear & Apparel', emoji: '👕' },
  { value: 'luxury_fashion', label: 'Luxury Fashion', emoji: '💎' },
  { value: 'watches', label: 'Watches & Horology', emoji: '⌚' },
  { value: 'art', label: 'Art & Prints', emoji: '🎨' },
  { value: 'electronics', label: 'Electronics & Tech', emoji: '🎮' },
  { value: 'concert_tickets', label: 'Concerts & Events', emoji: '🎵' },
  { value: 'sports_memorabilia', label: 'Sports Memorabilia', emoji: '🏆' },
  { value: 'trading_cards', label: 'Trading Cards', emoji: '🃏' },
  { value: 'vinyl_music', label: 'Vinyl & Music', emoji: '💿' },
  { value: 'books_rare', label: 'Rare Books', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '✦' },
]

const STRATEGIES = [
  { value: 'numbered_editions', label: 'Numbered / Serialised Editions' },
  { value: 'time_limited', label: 'Time-Limited Drops' },
  { value: 'quantity_limited', label: 'Quantity-Limited Drops' },
  { value: 'membership_tier', label: 'Membership / Tier Access' },
  { value: 'collab_drops', label: 'Collab Drops' },
  { value: 'seasonal', label: 'Seasonal / Annual Releases' },
  { value: 'physical_digital', label: 'Physical + Digital Bundle' },
  { value: 'experience_drops', label: 'Experience Drops (tickets, backstage, events)' },
]

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function BrandSignup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1
  const [brandName, setBrandName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef(null)

  // Step 2
  const [selectedCats, setSelectedCats] = useState([])
  const [primaryCat, setPrimaryCat] = useState(null)
  const clickTimers = useRef({})

  // Step 3
  const [strategies, setStrategies] = useState([])

  function goTo(next) {
    if (animating) return
    setDirection(next > step ? 1 : -1)
    setAnimating(true)
    setTimeout(() => { setStep(next); setAnimating(false) }, 280)
  }

  function handleBrandNameChange(v) {
    setBrandName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  function handleLogoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  function validateStep1() {
    if (!brandName.trim()) { toast.error('Brand name is required'); return false }
    if (!slug.trim()) { toast.error('Slug is required'); return false }
    if (!email.trim()) { toast.error('Email is required'); return false }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return false }
    if (!description.trim()) { toast.error('Short description is required'); return false }
    return true
  }

  function handleCatClick(value) {
    const alreadySelected = selectedCats.includes(value)

    if (alreadySelected) {
      // Second click → set as primary
      if (primaryCat === value) {
        // Already primary, deselect
        setSelectedCats(prev => prev.filter(c => c !== value))
        setPrimaryCat(null)
      } else {
        setPrimaryCat(value)
      }
    } else {
      setSelectedCats(prev => [...prev, value])
      if (!primaryCat) setPrimaryCat(value)
    }

    // Long-press also sets primary
    if (clickTimers.current[value]) clearTimeout(clickTimers.current[value])
    clickTimers.current[value] = setTimeout(() => {
      setPrimaryCat(value)
    }, 600)
  }

  function handleCatMouseUp(value) {
    if (clickTimers.current[value]) clearTimeout(clickTimers.current[value])
  }

  function toggleStrategy(value) {
    setStrategies(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value])
  }

  async function handleSubmit() {
    if (strategies.length === 0) { toast.error('Pick at least one exclusivity strategy'); return }
    setSubmitting(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw authErr
      const userId = authData.user.id

      // 2. Upload logo if present
      let logoUrl = null
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `brand-logos/${userId}.${ext}`
        const { error: upErr } = await supabase.storage.from('item-images').upload(path, logoFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
          logoUrl = urlData.publicUrl
        }
      }

      // 3. Insert into brands
      const { data: brand, error: brandErr } = await supabase.from('brands').insert({
        owner_id: userId,
        name: brandName,
        slug,
        email,
        description,
        logo_url: logoUrl,
        limited_edition_strategies: strategies,
      }).select().single()
      if (brandErr) throw brandErr

      // 4. Insert into brand_subdomains
      await supabase.from('brand_subdomains').insert({ brand_id: brand.id, slug })

      // 5. Insert brand_categories (primary first)
      const catRows = []
      if (primaryCat) catRows.push({ brand_id: brand.id, category: primaryCat, is_primary: true })
      selectedCats.filter(c => c !== primaryCat).forEach(c =>
        catRows.push({ brand_id: brand.id, category: c, is_primary: false })
      )
      if (catRows.length > 0) await supabase.from('brand_categories').insert(catRows)

      // 6. Create default customer tiers
      await supabase.from('customer_tiers').insert([
        { brand_id: brand.id, name: 'Follower', level: 1, color: '888888', min_purchases: null, min_spend: null },
        { brand_id: brand.id, name: 'Insider', level: 2, color: 'C0A060', min_purchases: 2, min_spend: 15000 },
        { brand_id: brand.id, name: 'Legend', level: 3, color: 'FFD700', min_purchases: 5, min_spend: 50000 },
      ])

      // 7. Update profile role
      await supabase.from('profiles').update({ role: 'brand' }).eq('id', userId)

      toast.success('Brand created!')
      navigate('/brand-dashboard?welcome=1')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => step > 1 ? goTo(step - 1) : navigate('/')}
          style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>Brand Signup</span>
      </div>

      {/* Progress */}
      <WizardProgress step={step} />

      {/* Content */}
      <div style={{
        maxWidth: 640, margin: '0 auto', padding: '36px 20px 100px',
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${direction * 30}px)` : 'translateX(0)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>
        {step === 1 && (
          <Step1
            brandName={brandName} onBrandName={handleBrandNameChange}
            slug={slug} onSlug={v => { setSlug(slugify(v)); setSlugManual(true) }}
            email={email} onEmail={setEmail}
            password={password} onPassword={setPassword}
            description={description} onDescription={setDescription}
            logoPreview={logoPreview} logoRef={logoRef} onLogoChange={handleLogoChange}
            onNext={() => { if (validateStep1()) goTo(2) }}
          />
        )}
        {step === 2 && (
          <Step2
            selectedCats={selectedCats} primaryCat={primaryCat}
            onCatClick={handleCatClick} onCatMouseUp={handleCatMouseUp}
            onNext={() => {
              if (!primaryCat) { toast.error('Pick at least one category and set a primary'); return }
              goTo(3)
            }}
          />
        )}
        {step === 3 && (
          <Step3
            strategies={strategies} onToggle={toggleStrategy}
            submitting={submitting} onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}

/* ─── PROGRESS ─── */
function WizardProgress({ step }) {
  const labels = ['Brand Basics', 'Categories', 'Strategy']
  return (
    <div style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}`, padding: '16px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {labels.map((label, i) => {
          const s = i + 1
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: step >= s ? C.accent : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  color: step >= s ? C.cream : C.muted,
                  transition: 'background-color 0.3s',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 12, fontWeight: step === s ? 700 : 400, color: step >= s ? C.cream : C.muted, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, margin: '0 12px', backgroundColor: step > s ? C.accent : 'rgba(255,255,255,0.08)', transition: 'background-color 0.3s' }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── STEP 1 ─── */
function Step1({ brandName, onBrandName, slug, onSlug, email, onEmail, password, onPassword, description, onDescription, logoPreview, logoRef, onLogoChange, onNext }) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Brand Basics</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Let's set up your brand's home on Rebl.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            onClick={() => logoRef.current?.click()}
            style={{
              width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
              backgroundColor: C.card, border: `2px dashed ${logoPreview ? C.accent : 'rgba(255,255,255,0.15)'}`,
              cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 28 }}>🏷</span>
            }
          </div>
          <input ref={logoRef} type="file" accept="image/*" onChange={onLogoChange} style={{ display: 'none' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Brand Logo</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Tap to upload · Circular crop</div>
          </div>
        </div>

        <TwoCol>
          <Field label="Brand Name *">
            <Input value={brandName} onChange={onBrandName} placeholder="e.g. House of Drip" />
          </Field>
          <Field label="Slug *">
            <Input value={slug} onChange={onSlug} placeholder="house-of-drip" />
            {slug && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                Your drop page: <span style={{ color: C.cream, fontWeight: 600 }}>{slug}.rebl.in</span>
              </div>
            )}
          </Field>
        </TwoCol>

        <TwoCol>
          <Field label="Email *">
            <Input type="email" value={email} onChange={onEmail} placeholder="brand@email.com" />
          </Field>
          <Field label="Password *">
            <Input type="password" value={password} onChange={onPassword} placeholder="Min 8 characters" />
          </Field>
        </TwoCol>

        <Field label={`Short Description * (${description.length}/140)`}>
          <textarea
            value={description}
            onChange={e => onDescription(e.target.value.slice(0, 140))}
            placeholder="What makes your brand unique? What do you create?"
            rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </Field>

        <PrimaryBtn onClick={onNext}>Continue →</PrimaryBtn>
      </div>
    </div>
  )
}

/* ─── STEP 2 ─── */
function Step2({ selectedCats, primaryCat, onCatClick, onCatMouseUp, onNext }) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>What does your brand create?</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>
        Select all that apply. <span style={{ color: C.cream }}>Click once</span> to select,{' '}
        <span style={{ color: C.gold }}>click again</span> to set as primary.
      </p>
      {primaryCat && (
        <div style={{ fontSize: 13, color: C.gold, marginBottom: 20, fontWeight: 600 }}>
          ★ Primary: {CATEGORIES.find(c => c.value === primaryCat)?.label}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
        gap: 12, marginBottom: 32,
      }}>
        {CATEGORIES.map(cat => {
          const selected = selectedCats.includes(cat.value)
          const isPrimary = primaryCat === cat.value
          return (
            <button
              key={cat.value}
              onMouseDown={() => onCatClick(cat.value)}
              onMouseUp={() => onCatMouseUp(cat.value)}
              onTouchStart={() => onCatClick(cat.value)}
              onTouchEnd={() => onCatMouseUp(cat.value)}
              style={{
                padding: '16px 14px', borderRadius: 14, cursor: 'pointer',
                backgroundColor: isPrimary ? 'rgba(255,183,3,0.1)' : selected ? 'rgba(230,57,70,0.1)' : C.card,
                border: `2px solid ${isPrimary ? C.gold : selected ? C.accent : 'rgba(255,255,255,0.09)'}`,
                textAlign: 'left', position: 'relative', transition: 'all 0.15s',
                transform: selected ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {isPrimary && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  backgroundColor: C.gold, color: '#0F0F1A',
                  borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 800,
                }}>★ PRIMARY</div>
              )}
              {selected && !isPrimary && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  backgroundColor: C.accent, color: C.cream,
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>✓</div>
              )}
              <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.cream, lineHeight: 1.3 }}>{cat.label}</div>
            </button>
          )
        })}
      </div>

      <PrimaryBtn onClick={onNext} disabled={!primaryCat}>Continue →</PrimaryBtn>
    </div>
  )
}

/* ─── STEP 3 ─── */
function Step3({ strategies, onToggle, submitting, onSubmit }) {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>How do you create exclusivity?</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Select all that apply to your drops.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        {STRATEGIES.map(s => {
          const checked = strategies.includes(s.value)
          return (
            <button
              key={s.value}
              onClick={() => onToggle(s.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                backgroundColor: checked ? 'rgba(230,57,70,0.08)' : C.card,
                border: `1px solid ${checked ? C.accent : 'rgba(255,255,255,0.09)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                backgroundColor: checked ? C.accent : 'transparent',
                border: `2px solid ${checked ? C.accent : 'rgba(255,255,255,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {checked && <span style={{ fontSize: 12, color: C.cream, fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 15, fontWeight: checked ? 600 : 400, color: checked ? C.cream : C.muted, transition: 'color 0.15s' }}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tier preview */}
      <div style={{
        backgroundColor: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '20px 22px', marginBottom: 32,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Default Customer Tiers (auto-created)
        </div>
        {[
          { name: 'Follower', color: '#888888', desc: 'All customers' },
          { name: 'Insider', color: '#C0A060', desc: '2+ purchases or ₹15,000+ spent' },
          { name: 'Legend', color: '#FFD700', desc: '5+ purchases or ₹50,000+ spent' },
        ].map((tier, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: tier.color, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.cream }}>{tier.name}</span>
              <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>{tier.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <PrimaryBtn onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Launching…' : 'Launch My Brand 🚀'}
      </PrimaryBtn>
    </div>
  )
}

/* ─── HELPERS ─── */
function TwoCol({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} style={inputStyle} />
  )
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', backgroundColor: disabled ? 'rgba(230,57,70,0.4)' : C.accent,
        color: C.cream, border: 'none', borderRadius: 12, padding: '15px',
        fontWeight: 700, fontSize: 16, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
      }}
    >{children}</button>
  )
}

const inputStyle = {
  width: '100%', backgroundColor: C.card, color: C.cream,
  border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 10,
  padding: '11px 14px', fontSize: 14, outline: 'none',
  fontFamily: '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif', boxSizing: 'border-box',
}
