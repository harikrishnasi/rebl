import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const C = {
  primary: '#0F0F1A',
  accent: '#E63946',
  cream: '#F1FAEE',
  muted: '#8D99AE',
  gold: '#FFB703',
  card: '#16162A',
  border: 'rgba(255,255,255,0.09)',
}

const CATEGORIES = [
  { value: 'sneakers', label: '👟 Sneakers' },
  { value: 'streetwear', label: '🧢 Streetwear' },
  { value: 'luxury_fashion', label: '💎 Luxury Fashion' },
  { value: 'watches', label: '⌚ Watches' },
  { value: 'art', label: '🎨 Art' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'concert_tickets', label: '🎫 Concert Tickets' },
  { value: 'trading_cards', label: '🃏 Trading Cards' },
  { value: 'vinyl', label: '🎵 Vinyl' },
  { value: 'other', label: '📦 Other' },
]

const VIBE_TAGS = [
  'Anti-mainstream', 'Grail Hunt', 'First Love', 'Trophy Piece', 'Daily Beater',
  'Investment', 'Gift', 'Memory', 'Community Pick', 'Future Classic',
  'Statement Piece', 'Heritage', 'Underrated', 'Collab Alert', 'One of a Kind',
]

const LOADING_MESSAGES = [
  'Researching your item...',
  'Crafting your story...',
  'Almost ready...',
]

export default function AddItem() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(null)

  // Step 1 fields
  const [form, setForm] = useState({
    name: '', brand: '', edition: '', serialNumber: '',
    category: '', purchaseDate: '', purchasePrice: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [vibeTags, setVibeTags] = useState([])
  const [customTag, setCustomTag] = useState('')

  // Step 2 fields
  const [aiStory, setAiStory] = useState('')
  const [editedStory, setEditedStory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  // Step 3
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', data.session.user.id).single()
      setProfile(prof)
    })
  }, [])

  // Cycle loading messages
  useEffect(() => {
    if (!generating) return
    const interval = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [generating])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function toggleTag(tag) {
    setVibeTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    )
  }

  function addCustomTag() {
    const t = customTag.trim().slice(0, 20)
    if (!t || vibeTags.includes(t) || vibeTags.length >= 5) return
    setVibeTags(prev => [...prev, t])
    setCustomTag('')
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!form.name || !form.brand) { toast.error('Name and brand are required'); return }

    setStep(2)
    setGenerating(true)
    setLoadingMsgIdx(0)

    const systemPrompt = `You are the story engine for Rebl, a premium platform for serious collectors in India. You write compelling, authentic provenance stories. Tone: passionate, editorial, collector-to-collector. Never corporate.`

    const userPrompt = `A collector just added this item:
Item: ${form.name}
Brand: ${form.brand}
Edition: ${form.edition || 'Standard'}
Category: ${form.category || 'other'}
Date acquired: ${form.purchaseDate || 'recently'}

Write a 160-word provenance story. Include:
1. The cultural significance or backstory of this item/brand (2-3 sentences)
2. What makes this edition special (2-3 sentences)
3. A personal prompt starting with: 'Your story with this piece begins —'

Write in second person. No headers. No labels. Just the story.`

    try {
      const story = await callGeminiAPI(userPrompt, systemPrompt)
      setAiStory(story)
      setEditedStory(story)
    } catch (err) {
      toast.error('Story generation failed. You can write your own.')
      setAiStory('')
      setEditedStory('')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in')

      let imageUrl = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('item-images')
          .upload(path, imageFile, { upsert: false })
        if (uploadErr) throw uploadErr
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }

      const allTags = vibeTags.includes('Statement Piece') ? vibeTags : [...vibeTags, 'Statement Piece']

      const { error } = await supabase.from('items').insert({
        owner_id: session.user.id,
        name: form.name,
        brand: form.brand,
        edition: form.edition || null,
        serial_number: form.serialNumber || null,
        category: form.category || null,
        acquired_date: form.purchaseDate || null,
        purchase_price: form.purchasePrice ? Number(form.purchasePrice) : null,
        image_url: imageUrl,
        ai_story: aiStory || null,
        user_story: editedStory !== aiStory ? editedStory : null,
        vibe_tags: allTags,
        verified: false,
      })

      if (error) throw error

      toast.success('Added to your collection!')
      if (profile?.username) {
        navigate(`/profile/${profile.username}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, sans-serif' }}>
      {/* Top nav */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{
          background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0,
        }}>← Back</button>
        <span style={{ color: C.cream, fontWeight: 700, fontSize: 16 }}>Add Item</span>
      </div>

      {/* Progress bar */}
      <ProgressBar step={step} />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 80px' }}>
        {step === 1 && (
          <Step1
            form={form} setField={setField}
            imagePreview={imagePreview} onImageChange={handleImageChange}
            vibeTags={vibeTags} toggleTag={toggleTag}
            customTag={customTag} setCustomTag={setCustomTag} addCustomTag={addCustomTag}
            onSubmit={handleGenerate}
          />
        )}
        {step === 2 && (
          <Step2
            generating={generating} loadingMsg={LOADING_MESSAGES[loadingMsgIdx]}
            aiStory={aiStory} editedStory={editedStory} setEditedStory={setEditedStory}
            onRegenerate={handleGenerate}
            onSave={() => { setStep(3); handleSave() }}
          />
        )}
        {step === 3 && (
          <Step3 saving={saving} />
        )}
      </div>
    </div>
  )
}

/* ─── PROGRESS BAR ─── */
function ProgressBar({ step }) {
  return (
    <div style={{ padding: '16px 20px', backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 0 }}>
        {[1, 2, 3].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                backgroundColor: step >= s ? C.accent : 'rgba(255,255,255,0.08)',
                border: step === s ? `2px solid ${C.accent}` : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: step >= s ? C.cream : C.muted,
                transition: 'all 0.3s',
              }}>
                {step > s ? '✓' : s}
              </div>
              <span style={{ fontSize: 12, fontWeight: step === s ? 700 : 400, color: step >= s ? C.cream : C.muted, whiteSpace: 'nowrap' }}>
                {s === 1 ? 'Item Details' : s === 2 ? 'AI Story' : 'Save'}
              </span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, margin: '0 12px', backgroundColor: step > s ? C.accent : 'rgba(255,255,255,0.08)', transition: 'background-color 0.3s' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── STEP 1 ─── */
function Step1({ form, setField, imagePreview, onImageChange, vibeTags, toggleTag, customTag, setCustomTag, addCustomTag, onSubmit }) {
  const fileRef = useRef(null)

  return (
    <form onSubmit={onSubmit}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Tell us about your piece</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Row>
          <Field label="Item Name *" required>
            <Input value={form.name} onChange={v => setField('name', v)} placeholder="e.g. Air Jordan 1 Retro High OG" required />
          </Field>
          <Field label="Brand *" required>
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
          <select
            value={form.category}
            onChange={e => setField('category', e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}
          >
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

        {/* Photo upload */}
        <Field label="Item Photo">
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${imagePreview ? C.accent : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 12, cursor: 'pointer', overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s',
              minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <div style={{ color: C.muted, fontSize: 14 }}>Tap to upload photo</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} />
        </Field>

        {/* Vibe tags */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            What does this piece say about you?
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Pick up to 5 tags {vibeTags.length > 0 && <span style={{ color: C.accent }}>({vibeTags.length}/5 selected)</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VIBE_TAGS.map(tag => {
              const selected = vibeTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                    cursor: vibeTags.length >= 5 && !selected ? 'not-allowed' : 'pointer',
                    border: `1px solid ${selected ? C.accent : 'rgba(255,255,255,0.15)'}`,
                    backgroundColor: selected ? 'rgba(230,57,70,0.15)' : 'transparent',
                    color: selected ? C.accent : C.muted,
                    opacity: vibeTags.length >= 5 && !selected ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >{tag}</button>
              )
            })}
          </div>

          {/* Custom tag */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={customTag}
              onChange={e => setCustomTag(e.target.value.slice(0, 20))}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Add custom tag…"
              style={{ ...inputStyle, flex: 1, fontSize: 13 }}
              disabled={vibeTags.length >= 5}
            />
            <button
              type="button"
              onClick={addCustomTag}
              disabled={vibeTags.length >= 5 || !customTag.trim()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', color: C.cream,
                padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                opacity: vibeTags.length >= 5 || !customTag.trim() ? 0.4 : 1,
              }}
            >Add</button>
          </div>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: C.accent, color: C.cream, border: 'none',
            borderRadius: 12, padding: '15px', width: '100%',
            fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8,
          }}
        >
          Generate My Story ✦
        </button>
      </div>
    </form>
  )
}

/* ─── STEP 2 ─── */
function Step2({ generating, loadingMsg, aiStory, editedStory, setEditedStory, onRegenerate, onSave }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editedStory])

  if (generating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 24 }}>
        <div style={{
          width: 60, height: 60, border: `4px solid rgba(230,57,70,0.2)`,
          borderTopColor: C.accent, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: C.cream, marginBottom: 8, transition: 'opacity 0.3s' }}>{loadingMsg}</p>
          <p style={{ color: C.muted, fontSize: 14 }}>Gemini is writing your provenance story</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your Story</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Generated by Rebl AI · Edit it to make it yours</p>

      {/* AI story quote card */}
      {aiStory && (
        <div style={{
          backgroundColor: '#0d0d1a', borderLeft: `4px solid ${C.accent}`,
          borderRadius: '0 12px 12px 0', padding: '20px 22px', marginBottom: 24,
          position: 'relative',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            ✦ Rebl AI Story
          </div>
          <p style={{ color: C.cream, fontSize: 15, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
            {aiStory}
          </p>
        </div>
      )}

      {/* Editable textarea */}
      <div>
        <label style={{ fontSize: 13, color: C.muted, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Make it yours — edit your story
        </label>
        <textarea
          ref={textareaRef}
          value={editedStory}
          onChange={e => setEditedStory(e.target.value)}
          placeholder="Write your personal story about this piece..."
          style={{
            ...inputStyle,
            width: '100%', minHeight: 160, resize: 'none', lineHeight: 1.75,
            fontSize: 15, boxSizing: 'border-box', overflow: 'hidden',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          onClick={onSave}
          style={{
            flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none',
            borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >Save to Collection</button>
        <button
          onClick={onRegenerate}
          style={{
            flex: 1, backgroundColor: 'transparent', color: C.cream,
            border: `1px solid rgba(255,255,255,0.2)`,
            borderRadius: 12, padding: '14px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >Regenerate</button>
      </div>
    </div>
  )
}

/* ─── STEP 3 ─── */
function Step3({ saving }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20, textAlign: 'center' }}>
      {saving ? (
        <>
          <div style={{
            width: 60, height: 60, border: `4px solid rgba(230,57,70,0.2)`,
            borderTopColor: C.accent, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: C.muted, fontSize: 15 }}>Saving to your vault…</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 56 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Added to your collection!</h2>
          <p style={{ color: C.muted, fontSize: 15 }}>Redirecting to your profile…</p>
        </>
      )}
    </div>
  )
}

/* ─── HELPERS ─── */
function Row({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
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

function Input({ value, onChange, type = 'text', placeholder, required }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={inputStyle}
    />
  )
}

const inputStyle = {
  width: '100%',
  backgroundColor: C.card,
  color: C.cream,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
