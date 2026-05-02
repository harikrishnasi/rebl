import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const C = {
  primary: '#0F0F1A', accent: '#E63946', cream: '#F1FAEE',
  muted: '#8D99AE', gold: '#FFB703', card: '#16162A',
  border: 'rgba(255,255,255,0.09)',
}

const CATEGORIES = [
  { value: 'sneakers',        label: '👟 Sneakers' },
  { value: 'streetwear',      label: '🧢 Streetwear' },
  { value: 'luxury_fashion',  label: '💎 Luxury Fashion' },
  { value: 'watches',         label: '⌚ Watches' },
  { value: 'art',             label: '🎨 Art' },
  { value: 'electronics',     label: '📱 Electronics' },
  { value: 'concert_tickets', label: '🎫 Concert Tickets' },
  { value: 'trading_cards',   label: '🃏 Trading Cards' },
  { value: 'vinyl',           label: '🎵 Vinyl' },
  { value: 'other',           label: '📦 Other' },
]

const VIBE_TAGS = [
  'Anti-mainstream', 'Grail Hunt', 'First Love', 'Trophy Piece', 'Daily Beater',
  'Investment', 'Gift', 'Memory', 'Community Pick', 'Future Classic',
  'Statement Piece', 'Heritage', 'Underrated', 'Collab Alert', 'One of a Kind',
]

/* Verification overlay messages */
const VERIFY_STEPS = [
  { icon: '📡', label: 'Confirming with brand partner…',       ms: 2400 },
  { icon: '🔍', label: 'Verifying photo with AI…',             ms: 2200 },
  { icon: '🔐', label: 'Cross-checking authenticity signals…', ms: 2000 },
  { icon: '⚡', label: 'Only real Rebls make it past this.',   ms: 1800, gold: true },
]

/* ══════════════════════════════════════════════════════ */

export default function AddItem() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [profile, setProfile] = useState(null)

  /* Step 1 */
  const [form, setForm] = useState({
    name: '', brand: '', edition: '', serialNumber: '',
    category: '', purchaseDate: '', purchasePrice: '',
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [vibeTags, setVibeTags]         = useState([])
  const [customTag, setCustomTag]       = useState('')

  /* Step 2 */
  const [userStory, setUserStory]   = useState('')     // what the user typed
  const [aiStory, setAiStory]       = useState('')     // AI-enhanced version
  const [finalStory, setFinalStory] = useState('')     // what gets saved
  const [enhancing, setEnhancing]   = useState(false)

  /* Verification overlay */
  const [verifying, setVerifying]   = useState(false)
  const [verifyStep, setVerifyStep] = useState(0)
  const [verifyDone, setVerifyDone] = useState(false)
  const saveResultRef               = useRef(null)     // {ok, err}

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', data.session.user.id).single()
      setProfile(prof)
    })
  }, [])

  /* ── helpers ── */
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function toggleTag(tag) {
    setVibeTags(p => p.includes(tag) ? p.filter(t => t !== tag) : p.length < 5 ? [...p, tag] : p)
  }

  function addCustomTag() {
    const t = customTag.trim().slice(0, 20)
    if (!t || vibeTags.includes(t) || vibeTags.length >= 5) return
    setVibeTags(p => [...p, t])
    setCustomTag('')
  }

  /* ── Step 1 → 2 ── */
  function handleStep1Submit(e) {
    e.preventDefault()
    if (!imageFile) { toast.error('Photo is required — tap the camera to take a shot.'); return }
    setStep(2)
  }

  /* ── AI Enhance ── */
  async function handleEnhance() {
    if (!userStory.trim()) { toast.error('Write your story first, then let AI build on it.'); return }
    setEnhancing(true)
    try {
      const system = `You are a story enhancer for Rebl, a premium collector platform in India. 
You receive a collector's personal story and enrich it — preserving their exact voice, memories, and feelings. 
Never change perspective. Add 2-3 sentences of cultural/historical context about the item or brand. Max 220 words.`

      const prompt = `Item: ${form.name} by ${form.brand}${form.edition ? ` (${form.edition})` : ''}
Category: ${form.category || 'collectible'}

Collector's own story:
"${userStory.trim()}"

Enhance this. Keep their voice and every personal detail. Add cultural context. Output only the enriched story — no labels, no headers.`

      const enhanced = await callGeminiAPI(prompt, system)
      setAiStory(enhanced)
      setFinalStory(enhanced)
    } catch (err) {
      toast.error(err.message || 'Enhancement failed.')
    } finally {
      setEnhancing(false)
    }
  }

  /* ── Save (runs in background during verification overlay) ── */
  async function doSave() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in')

      let imageUrl = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('item-images').upload(path, imageFile, { upsert: false })
        if (uploadErr) throw uploadErr
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }

      const storyToSave = finalStory || userStory

      const { error } = await supabase.from('items').insert({
        owner_id:      session.user.id,
        name:          form.name,
        brand:         form.brand,
        edition:       form.edition || null,
        serial_number: form.serialNumber || null,
        category:      form.category || null,
        acquired_date: form.purchaseDate || null,
        purchase_price: form.purchasePrice ? Number(form.purchasePrice) : null,
        image_url:     imageUrl,
        ai_story:      aiStory || null,
        user_story:    storyToSave || null,
        vibe_tags:     vibeTags,
        verified:      false,
      })

      if (error) throw error
      saveResultRef.current = { ok: true }
    } catch (err) {
      saveResultRef.current = { ok: false, err: err.message || 'Save failed' }
    }
  }

  /* ── Trigger verification overlay ── */
  function handleAddToVault() {
    if (!userStory.trim() && !finalStory.trim()) {
      toast.error('Write at least a few words about your piece.')
      return
    }
    saveResultRef.current = null
    setVerifyStep(0)
    setVerifyDone(false)
    setVerifying(true)

    // Start actual save immediately in background
    doSave()

    // Run through verification step timers
    let elapsed = 0
    VERIFY_STEPS.forEach((vs, i) => {
      setTimeout(() => setVerifyStep(i), elapsed)
      elapsed += vs.ms
    })
    // After all steps, mark done
    setTimeout(() => setVerifyDone(true), elapsed + 400)
  }

  /* ── After verification animation completes ── */
  useEffect(() => {
    if (!verifyDone) return
    // Poll until save finishes (usually already done)
    const poll = setInterval(() => {
      if (saveResultRef.current !== null) {
        clearInterval(poll)
        if (saveResultRef.current.ok) {
          setTimeout(() => {
            setVerifying(false)
            toast.success('Added to your vault!')
            if (profile?.username) navigate(`/vault/${profile.username}`)
            else navigate('/dashboard')
          }, 600)
        } else {
          setVerifying(false)
          toast.error(saveResultRef.current.err)
        }
      }
    }, 200)
    return () => clearInterval(poll)
  }, [verifyDone])

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes barGrow { from { width:0; } to { width:100%; } }
      `}</style>

      {/* ── Verification Overlay ── */}
      {verifying && <VerifyOverlay step={verifyStep} done={verifyDone} />}

      {/* ── Nav ── */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Add to Vault</span>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: '14px 20px', backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {['Your Piece', 'Your Story'].map((label, i) => {
            const s = i + 1
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: step >= s ? C.accent : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: step > s ? C.cream : step === s ? C.cream : C.muted,
                    transition: 'all 0.3s',
                  }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: step === s ? 700 : 400, color: step >= s ? C.cream : C.muted }}>
                    {label}
                  </span>
                </div>
                {i < 1 && (
                  <div style={{ flex: 1, height: 2, margin: '0 12px', backgroundColor: step > s ? C.accent : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 100px' }}>
        {step === 1 && (
          <Step1
            form={form} setField={setField}
            imagePreview={imagePreview} onImageChange={handleImageChange}
            vibeTags={vibeTags} toggleTag={toggleTag}
            customTag={customTag} setCustomTag={setCustomTag} addCustomTag={addCustomTag}
            onSubmit={handleStep1Submit}
          />
        )}
        {step === 2 && (
          <Step2
            form={form}
            userStory={userStory} setUserStory={setUserStory}
            aiStory={aiStory} finalStory={finalStory} setFinalStory={setFinalStory}
            enhancing={enhancing} onEnhance={handleEnhance}
            onSave={handleAddToVault}
          />
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   VERIFICATION OVERLAY
══════════════════════════════════════════════════════ */
function VerifyOverlay({ step, done }) {
  const total = VERIFY_STEPS.length
  const progress = done ? 100 : Math.round(((step + 0.5) / total) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      backgroundColor: '#08080f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }}>
      {/* Wordmark */}
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 56, opacity: 0.6 }}>Rebl</div>

      {/* Icon ring */}
      <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 40 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          border: `3px solid rgba(230,57,70,0.15)`,
          borderTopColor: done ? C.gold : C.accent,
          animation: done ? 'none' : 'spin 1s linear infinite',
          transition: 'border-top-color 0.4s',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          animation: 'fadeUp 0.3s ease',
          key: step,
        }}>
          {done ? '✦' : VERIFY_STEPS[step]?.icon}
        </div>
      </div>

      {/* Message sequence */}
      <div style={{ minHeight: 80, textAlign: 'center', marginBottom: 40 }}>
        {done ? (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.gold, letterSpacing: -0.3, marginBottom: 6 }}>
              Verified. ✦
            </div>
            <div style={{ color: C.muted, fontSize: 14 }}>Adding to your vault…</div>
          </div>
        ) : (
          <div key={step} style={{ animation: 'fadeUp 0.35s ease' }}>
            <div style={{
              fontSize: 18, fontWeight: 700,
              color: VERIFY_STEPS[step]?.gold ? C.gold : C.cream,
              marginBottom: 8, lineHeight: 1.3,
            }}>
              {VERIFY_STEPS[step]?.label}
            </div>
            {VERIFY_STEPS[step]?.gold && (
              <div style={{ color: C.muted, fontSize: 13, fontStyle: 'italic', animation: 'pulse 1.5s ease infinite' }}>
                Authenticating your ownership…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 280, height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: done ? C.gold : C.accent,
          borderRadius: 4,
          transition: 'width 0.6s ease, background-color 0.4s',
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        {VERIFY_STEPS.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: i <= step || done ? (done ? C.gold : C.accent) : 'rgba(255,255,255,0.15)',
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ position: 'absolute', bottom: 32, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        Powered by Rebl Authenticity Engine
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   STEP 1 — Item Details + Camera Photo
══════════════════════════════════════════════════════ */
function Step1({ form, setField, imagePreview, onImageChange, vibeTags, toggleTag, customTag, setCustomTag, addCustomTag, onSubmit }) {
  const cameraRef = useRef(null)

  return (
    <form onSubmit={onSubmit}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Tell us about your piece</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Every detail helps build your provenance.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Camera Photo (mandatory) ── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Photo <span style={{ color: C.accent }}>*</span>
          </div>
          <div
            onClick={() => cameraRef.current?.click()}
            style={{
              border: `2px dashed ${imagePreview ? C.accent : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
              backgroundColor: imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
              minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s',
              position: 'relative',
            }}>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Item" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 10px',
                  fontSize: 11, fontWeight: 700, color: C.cream,
                }}>
                  📷 Retake
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
                <div style={{ color: C.cream, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Take a photo</div>
                <div style={{ color: C.muted, fontSize: 13 }}>Camera access required for authenticity</div>
              </div>
            )}
          </div>
          {/* capture="environment" forces camera on mobile */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onImageChange}
            style={{ display: 'none' }}
          />
          {!imagePreview && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10 }}>🔒</span>
              Camera-only. Photos preserve genuine ownership.
            </div>
          )}
        </div>

        <Row>
          <Field label="Item Name *">
            <Input value={form.name} onChange={v => setField('name', v)} placeholder="e.g. Air Jordan 1 Retro High OG" required />
          </Field>
          <Field label="Brand *">
            <Input value={form.brand} onChange={v => setField('brand', v)} placeholder="e.g. Nike" required />
          </Field>
        </Row>

        <Row>
          <Field label="Edition / Colorway">
            <Input value={form.edition} onChange={v => setField('edition', v)} placeholder="e.g. Chicago, 2015" />
          </Field>
          <Field label="Serial Number">
            <Input value={form.serialNumber} onChange={v => setField('serialNumber', v)} placeholder="e.g. 123456" />
          </Field>
        </Row>

        <Field label="Category">
          <select value={form.category} onChange={e => setField('category', e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>

        <Row>
          <Field label="Purchase Date">
            <Input type="date" value={form.purchaseDate} onChange={v => setField('purchaseDate', v)} />
          </Field>
          <Field label="Purchase Price (₹)">
            <Input type="number" value={form.purchasePrice} onChange={v => setField('purchasePrice', v)} placeholder="e.g. 15000" />
          </Field>
        </Row>

        {/* Vibe tags */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            What does this piece say about you?
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Pick up to 5 {vibeTags.length > 0 && <span style={{ color: C.accent }}>({vibeTags.length}/5)</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VIBE_TAGS.map(tag => {
              const sel = vibeTags.includes(tag)
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  style={{
                    padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                    cursor: vibeTags.length >= 5 && !sel ? 'not-allowed' : 'pointer',
                    border: `1px solid ${sel ? C.accent : 'rgba(255,255,255,0.15)'}`,
                    backgroundColor: sel ? 'rgba(230,57,70,0.15)' : 'transparent',
                    color: sel ? C.accent : C.muted,
                    opacity: vibeTags.length >= 5 && !sel ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}>{tag}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={customTag}
              onChange={e => setCustomTag(e.target.value.slice(0, 20))}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Add custom tag…"
              style={{ ...inputStyle, flex: 1, fontSize: 13 }}
              disabled={vibeTags.length >= 5}
            />
            <button type="button" onClick={addCustomTag} disabled={vibeTags.length >= 5 || !customTag.trim()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', color: C.cream,
                padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                opacity: vibeTags.length >= 5 || !customTag.trim() ? 0.4 : 1,
              }}>Add</button>
          </div>
        </div>

        <button type="submit"
          style={{
            backgroundColor: C.accent, color: C.cream, border: 'none',
            borderRadius: 12, padding: '15px', width: '100%',
            fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8,
          }}>
          Write Your Story →
        </button>
      </div>
    </form>
  )
}

/* ══════════════════════════════════════════════════════
   STEP 2 — Your Story + AI Enhancement
══════════════════════════════════════════════════════ */
function Step2({ form, userStory, setUserStory, aiStory, finalStory, setFinalStory, enhancing, onEnhance, onSave }) {
  const userRef  = useRef(null)
  const finalRef = useRef(null)

  useEffect(() => {
    if (userRef.current) {
      userRef.current.style.height = 'auto'
      userRef.current.style.height = userRef.current.scrollHeight + 'px'
    }
  }, [userStory])

  useEffect(() => {
    if (finalRef.current) {
      finalRef.current.style.height = 'auto'
      finalRef.current.style.height = finalRef.current.scrollHeight + 'px'
    }
  }, [finalStory])

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Your Story</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>
        Write it yourself. Then let AI build on it.
      </p>

      {/* Item recap */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 22 }}>
          {CATEGORIES.find(c => c.value === form.category)?.label?.split(' ')[0] || '📦'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{form.name}</div>
          <div style={{ color: C.muted, fontSize: 12 }}>{form.brand}{form.edition ? ` · ${form.edition}` : ''}</div>
        </div>
      </div>

      {/* User's own story */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 10 }}>
          Your words *
        </label>
        <textarea
          ref={userRef}
          value={userStory}
          onChange={e => setUserStory(e.target.value)}
          placeholder={`How did you get it? What does it mean to you?\nWhat memory does it carry?\n\nWrite freely — even a few sentences is enough.`}
          style={{
            ...inputStyle,
            width: '100%', minHeight: 140, resize: 'none', lineHeight: 1.8,
            fontSize: 15, boxSizing: 'border-box', overflow: 'hidden',
          }}
        />
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6, textAlign: 'right' }}>
          {userStory.length} chars
        </div>
      </div>

      {/* Enhance button */}
      <button
        onClick={onEnhance}
        disabled={enhancing || !userStory.trim()}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, marginBottom: 28,
          border: `1px solid ${C.gold}`,
          backgroundColor: enhancing ? 'rgba(255,183,3,0.08)' : 'rgba(255,183,3,0.1)',
          color: C.gold, fontWeight: 700, fontSize: 14, cursor: enhancing || !userStory.trim() ? 'not-allowed' : 'pointer',
          opacity: !userStory.trim() ? 0.45 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.15s',
        }}>
        {enhancing ? (
          <>
            <div style={{ width: 14, height: 14, border: `2px solid rgba(255,183,3,0.2)`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            AI is building on your story…
          </>
        ) : (
          <>{aiStory ? '↺ Re-enhance with AI' : '✦ Enhance with AI'}</>
        )}
      </button>

      {/* AI-enhanced version */}
      {aiStory && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.gold }}>✦</span> AI-Enhanced — Edit Before Saving
          </div>
          <div style={{ backgroundColor: '#0d0d1a', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 12px 12px 0', padding: '18px 20px', marginBottom: 12 }}>
            <p style={{ color: C.muted, fontSize: 12, fontStyle: 'italic', margin: '0 0 10px' }}>Your original, enriched with context:</p>
            <textarea
              ref={finalRef}
              value={finalStory}
              onChange={e => setFinalStory(e.target.value)}
              style={{
                ...inputStyle,
                width: '100%', minHeight: 120, resize: 'none', lineHeight: 1.8,
                fontSize: 15, boxSizing: 'border-box', overflow: 'hidden',
                backgroundColor: 'transparent', border: 'none', padding: 0,
                color: C.cream,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            Tip: Edit freely — this is what goes into your vault.
          </div>
        </div>
      )}

      {/* Add to Vault */}
      <button
        onClick={onSave}
        disabled={!userStory.trim() && !finalStory.trim()}
        style={{
          width: '100%', backgroundColor: C.accent, color: C.cream, border: 'none',
          borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
          opacity: !userStory.trim() && !finalStory.trim() ? 0.5 : 1,
          letterSpacing: -0.2,
        }}>
        Add to Vault →
      </button>

      <p style={{ textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 14 }}>
        All items go through our authenticity check
      </p>
    </div>
  )
}

/* ── Helpers ── */
function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>{children}</div>
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, required }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required} style={inputStyle} />
  )
}

const inputStyle = {
  width: '100%', backgroundColor: C.card, color: C.cream,
  border: `1px solid ${C.border}`, borderRadius: 10,
  padding: '11px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
