import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const T = {
  bg: '#000000', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const CATEGORIES = [
  { value: 'sneakers',        label: 'Sneakers' },
  { value: 'streetwear',      label: 'Streetwear' },
  { value: 'luxury_fashion',  label: 'Luxury Fashion' },
  { value: 'watches',         label: 'Watches' },
  { value: 'art',             label: 'Art' },
  { value: 'electronics',     label: 'Electronics' },
  { value: 'concert_tickets', label: 'Concert Tickets' },
  { value: 'trading_cards',   label: 'Trading Cards' },
  { value: 'vinyl',           label: 'Vinyl' },
  { value: 'other',           label: 'Other' },
]

const VIBE_TAGS = [
  'Anti-mainstream', 'Grail Hunt', 'First Love', 'Trophy Piece', 'Daily Beater',
  'Investment', 'Gift', 'Memory', 'Community Pick', 'Future Classic',
  'Statement Piece', 'Heritage', 'Underrated', 'Collab Alert', 'One of a Kind',
]

const VERIFY_STEPS = [
  { sym: '◈', label: 'Confirming with brand partner…',       ms: 2400 },
  { sym: '◎', label: 'Verifying photo with AI…',             ms: 2200 },
  { sym: '⊕', label: 'Cross-checking authenticity signals…', ms: 2000 },
  { sym: '✦', label: 'Only real Rebls make it past this.',   ms: 1800, gold: true },
]

const inputStyle = {
  width: '100%', backgroundColor: T.card, color: T.white,
  border: `1px solid ${T.border}`,
  padding: '11px 14px', fontSize: 14, outline: 'none',
  fontFamily: BODY, boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

export default function AddItem() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [profile, setProfile] = useState(null)

  const [form, setForm] = useState({
    name: '', brand: '', edition: '', serialNumber: '',
    category: '', purchaseDate: '', purchasePrice: '',
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [vibeTags, setVibeTags]         = useState([])
  const [customTag, setCustomTag]       = useState('')

  const [userStory, setUserStory]   = useState('')
  const [aiStory, setAiStory]       = useState('')
  const [finalStory, setFinalStory] = useState('')
  const [enhancing, setEnhancing]   = useState(false)

  const [verifying, setVerifying]   = useState(false)
  const [verifyStep, setVerifyStep] = useState(0)
  const [verifyDone, setVerifyDone] = useState(false)
  const saveResultRef               = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', data.session.user.id).single()
      setProfile(prof)
    })
  }, [])

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

  function handleStep1Submit(e) {
    e.preventDefault()
    if (!imageFile) { toast.error('Photo is required — tap the camera icon to take a shot.'); return }
    setStep(2)
  }

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

  function handleAddToVault() {
    if (!userStory.trim() && !finalStory.trim()) {
      toast.error('Write at least a few words about your piece.')
      return
    }
    saveResultRef.current = null
    setVerifyStep(0)
    setVerifyDone(false)
    setVerifying(true)
    doSave()
    let elapsed = 0
    VERIFY_STEPS.forEach((vs, i) => {
      setTimeout(() => setVerifyStep(i), elapsed)
      elapsed += vs.ms
    })
    setTimeout(() => setVerifyDone(true), elapsed + 400)
  }

  useEffect(() => {
    if (!verifyDone) return
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.white, fontFamily: BODY }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        input::placeholder, textarea::placeholder { color: ${T.grayMid}; }
        select option { background: ${T.card}; }
      `}</style>

      {verifying && <VerifyOverlay step={verifyStep} done={verifyDone} />}

      {/* ── Nav ── */}
      <div style={{ padding: '0 20px', borderBottom: `1px solid ${T.border}`, height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          style={{ background: 'none', border: 'none', color: T.grayMid, cursor: 'pointer', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}>
          ← Back
        </button>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Add to Vault</span>
      </div>

      {/* ── Progress ── */}
      <div style={{ padding: '16px 20px', backgroundColor: T.card, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {['Your Piece', 'Your Story'].map((label, i) => {
            const s = i + 1
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, flexShrink: 0,
                    backgroundColor: step >= s ? T.white : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${step >= s ? T.white : T.borderVis}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: MONO, fontSize: 10, fontWeight: 700,
                    color: step >= s ? T.bg : T.grayMid, transition: 'all 0.3s',
                  }}>
                    {step > s ? '◈' : s}
                  </div>
                  <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: step === s ? 600 : 400, color: step >= s ? T.white : T.grayMid }}>
                    {label}
                  </span>
                </div>
                {i < 1 && (
                  <div style={{ flex: 1, height: 1, margin: '0 14px', backgroundColor: step > s ? T.white : T.borderVis, transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '36px 20px 100px' }}>
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

/* ── Verification Overlay ── */
function VerifyOverlay({ step, done }) {
  const total = VERIFY_STEPS.length
  const progress = done ? 100 : Math.round(((step + 0.5) / total) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      backgroundColor: '#060606',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }}>
      <div style={{ fontFamily: '"Poppins", sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 56, opacity: 0.5, color: T.white }}>Rēbl</div>

      {/* Symbol */}
      <div style={{ width: 80, height: 80, border: `1px solid ${T.borderVis}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -4, border: `1px solid ${done ? T.white : T.gray}`, opacity: done ? 1 : 0.4, transition: 'opacity 0.4s' }} />
        <div style={{ fontFamily: DISPLAY, fontSize: 32, color: done ? T.white : T.gray, transition: 'color 0.4s', animation: 'fadeUp 0.3s ease' }}>
          {done ? '✦' : VERIFY_STEPS[step]?.sym}
        </div>
      </div>

      {/* Message */}
      <div style={{ minHeight: 80, textAlign: 'center', marginBottom: 40 }}>
        {done ? (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: T.white, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
              Verified. ✦
            </div>
            <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14 }}>Adding to your vault…</div>
          </div>
        ) : (
          <div key={step} style={{ animation: 'fadeUp 0.35s ease' }}>
            <div style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600,
              color: VERIFY_STEPS[step]?.gold ? T.gray : T.white,
              marginBottom: 8, lineHeight: 1.4,
            }}>
              {VERIFY_STEPS[step]?.label}
            </div>
            {VERIFY_STEPS[step]?.gold && (
              <div style={{ fontFamily: MONO, color: T.grayMid, fontSize: 11, animation: 'pulse 1.5s ease infinite', letterSpacing: '0.06em' }}>
                Authenticating your ownership…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 280, height: 2, backgroundColor: T.borderVis, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`, backgroundColor: T.white,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {VERIFY_STEPS.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5,
            backgroundColor: i <= step || done ? T.white : T.borderVis,
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 32, fontFamily: MONO, fontSize: 9, color: T.grayMid, textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Powered by Rebl Authenticity Engine
      </div>
    </div>
  )
}

/* ── Step 1 ── */
function Step1({ form, setField, imagePreview, onImageChange, vibeTags, toggleTag, customTag, setCustomTag, addCustomTag, onSubmit }) {
  const cameraRef = useRef(null)

  return (
    <form onSubmit={onSubmit}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tell us about your piece</h2>
      <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14, marginBottom: 32 }}>Every detail builds your provenance record.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Photo */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Photo <span style={{ color: T.white }}>*</span>
          </div>
          <div
            onClick={() => cameraRef.current?.click()}
            style={{
              border: `1px solid ${imagePreview ? T.gray : T.borderVis}`,
              cursor: 'pointer', overflow: 'hidden',
              backgroundColor: imagePreview ? 'transparent' : T.card,
              minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s', position: 'relative',
            }}>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Item" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  backgroundColor: 'rgba(0,0,0,0.75)', border: `1px solid ${T.borderVis}`,
                  padding: '4px 12px', fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.white,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  ◈ Retake
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 40, color: T.grayMid, marginBottom: 14 }}>◈</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 12, color: T.white, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Take a Photo</div>
                <div style={{ fontFamily: BODY, color: T.grayMid, fontSize: 13 }}>Camera access required for authenticity</div>
              </div>
            )}
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onImageChange} style={{ display: 'none' }} />
          {!imagePreview && (
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 9, color: T.grayMid, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.06em' }}>
              ◈ Camera-only. Photos preserve genuine ownership.
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
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
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

        {/* Vibe Tags */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            What does this piece say about you?
          </div>
          <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, marginBottom: 14 }}>
            Pick up to 5 {vibeTags.length > 0 && <span style={{ color: T.gray }}>({vibeTags.length}/5)</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VIBE_TAGS.map(tag => {
              const sel = vibeTags.includes(tag)
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  style={{
                    padding: '7px 14px', fontSize: 11, fontWeight: 600,
                    fontFamily: MONO, letterSpacing: '0.04em',
                    cursor: vibeTags.length >= 5 && !sel ? 'not-allowed' : 'pointer',
                    border: `1px solid ${sel ? T.white : T.borderVis}`,
                    backgroundColor: sel ? T.white : 'transparent',
                    color: sel ? T.bg : T.grayMid,
                    opacity: vibeTags.length >= 5 && !sel ? 0.4 : 1,
                    transition: 'all 0.15s',
                    textTransform: 'uppercase',
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
              style={{ ...inputStyle, flex: 1, fontSize: 12 }}
              disabled={vibeTags.length >= 5}
            />
            <button type="button" onClick={addCustomTag} disabled={vibeTags.length >= 5 || !customTag.trim()}
              style={{
                backgroundColor: T.white, border: 'none', color: T.bg,
                padding: '0 18px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase',
                opacity: vibeTags.length >= 5 || !customTag.trim() ? 0.4 : 1,
              }}>Add</button>
          </div>
        </div>

        <button type="submit"
          style={{
            backgroundColor: T.white, color: T.bg, border: 'none',
            padding: '15px', width: '100%',
            fontFamily: MONO, fontWeight: 700, fontSize: 12, cursor: 'pointer', marginTop: 8,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
          Write Your Story →
        </button>
      </div>
    </form>
  )
}

/* ── Step 2 ── */
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

  const catLabel = CATEGORIES.find(c => c.value === form.category)?.label || ''

  return (
    <div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Story</h2>
      <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 14, marginBottom: 32 }}>
        Write it yourself. Then let AI build on it.
      </p>

      {/* Item recap */}
      <div style={{ backgroundColor: T.card, border: `1px solid ${T.borderVis}`, padding: '14px 18px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, color: T.grayMid }}>◈</div>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: T.white }}>{form.name}</div>
          <div style={{ fontFamily: MONO, color: T.grayMid, fontSize: 10, marginTop: 3, letterSpacing: '0.06em' }}>
            {form.brand}{form.edition ? ` · ${form.edition}` : ''}{catLabel ? ` · ${catLabel}` : ''}
          </div>
        </div>
      </div>

      {/* User story */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>
          Your Words *
        </label>
        <textarea
          ref={userRef}
          value={userStory}
          onChange={e => setUserStory(e.target.value)}
          placeholder={`How did you get it? What does it mean to you?\nWhat memory does it carry?\n\nWrite freely — even a few sentences is enough.`}
          style={{
            ...inputStyle,
            width: '100%', minHeight: 140, resize: 'none', lineHeight: 1.8,
            fontSize: 14, boxSizing: 'border-box', overflow: 'hidden',
          }}
        />
        <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 6, textAlign: 'right', letterSpacing: '0.06em' }}>
          {userStory.length} chars
        </div>
      </div>

      {/* Enhance button */}
      <button
        onClick={onEnhance}
        disabled={enhancing || !userStory.trim()}
        style={{
          width: '100%', padding: '14px', marginBottom: 28,
          border: `1px solid ${T.borderVis}`,
          backgroundColor: enhancing ? T.card : 'transparent',
          color: T.gray, fontFamily: MONO, fontWeight: 700, fontSize: 11,
          cursor: enhancing || !userStory.trim() ? 'not-allowed' : 'pointer',
          opacity: !userStory.trim() ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 0.15s', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
        {enhancing ? (
          <>
            <div style={{ width: 12, height: 12, border: `1px solid ${T.grayMid}`, borderTopColor: T.white, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            AI is building on your story…
          </>
        ) : (
          <>{aiStory ? '◈ Re-enhance with AI' : '✦ Enhance with AI'}</>
        )}
      </button>

      {/* AI-enhanced version */}
      {aiStory && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✦</span> AI-Enhanced — Edit Before Saving
          </div>
          <div style={{ backgroundColor: T.card, borderLeft: `2px solid ${T.gray}`, padding: '18px 20px', marginBottom: 12 }}>
            <p style={{ fontFamily: BODY, color: T.grayMid, fontSize: 12, fontStyle: 'italic', margin: '0 0 10px' }}>Your original, enriched with context:</p>
            <textarea
              ref={finalRef}
              value={finalStory}
              onChange={e => setFinalStory(e.target.value)}
              style={{
                ...inputStyle,
                width: '100%', minHeight: 120, resize: 'none', lineHeight: 1.8,
                fontSize: 14, boxSizing: 'border-box', overflow: 'hidden',
                backgroundColor: 'transparent', border: 'none', padding: 0,
                color: T.white,
              }}
            />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.06em' }}>
            Tip: Edit freely — this is what goes into your vault.
          </div>
        </div>
      )}

      {/* Add to Vault */}
      <button
        onClick={onSave}
        disabled={!userStory.trim() && !finalStory.trim()}
        style={{
          width: '100%', backgroundColor: T.white, color: T.bg, border: 'none',
          padding: '16px', fontFamily: MONO, fontWeight: 800, fontSize: 12,
          cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          opacity: !userStory.trim() && !finalStory.trim() ? 0.4 : 1,
        }}>
        Add to Vault →
      </button>

      <p style={{ textAlign: 'center', fontFamily: MONO, color: T.grayMid, fontSize: 9, marginTop: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        All items go through our authenticity check
      </p>
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>{children}</div>
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, fontWeight: 700, color: T.grayMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
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
