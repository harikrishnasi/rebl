import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const T = {
  bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D', borderDim: '#111111',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

const CATEGORIES = ['Sneakers', 'Streetwear', 'Concert Tickets', 'Vinyl & Music', 'Art & Print', 'Accessories', 'Other']
const SIZE_TYPES = ['UK Sizes', 'US Sizes', 'EU Sizes', 'S / M / L / XL', 'One Size', 'No Sizing', 'Custom']
const UK_SIZES = ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12']
const US_SIZES = ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13']
const EU_SIZES = ['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'EU 46']
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const STEPS = [
  { n: 1, label: 'BRAND IDENTITY' },
  { n: 2, label: 'CAMPAIGN' },
  { n: 3, label: 'DROP DETAILS' },
  { n: 4, label: 'REVIEW & SUBMIT' },
]

function emptyDrop(idx = 0) {
  return {
    id: Date.now() + idx,
    name: '', edition: '', category: 'Sneakers', units: '',
    floor: '', ceiling: '', launchPrice: '', dynamicPricing: true,
    sizeType: 'UK Sizes', sizes: [],
    dropDate: '', endDate: '',
    imageUrl: '', mainColor: '#1A1A2E',
    originHeadline: '', originBody: '', pullQuote: '',
    editionHeadline: '', editionBody: '',
    reblElement: '',
    tags: '',
  }
}

function Field({ label, value, onChange, placeholder = '', type = 'text', required = false, hint = '' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#CC3333', marginLeft: 4 }}>✦</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: T.card, border: `1px solid ${focused ? T.borderVis : T.border}`,
          color: T.white, fontFamily: BODY, fontSize: 14, padding: '12px 16px',
          outline: 'none', transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <div style={{ fontFamily: BODY, fontSize: 11, color: T.grayMid, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder = '', rows = 5, required = false, hint = '', maxLen }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: '#CC3333', marginLeft: 4 }}>✦</span>}
        </label>
        {maxLen && (
          <span style={{ fontFamily: MONO, fontSize: 8, color: value.length > maxLen * 0.9 ? '#CC3333' : T.grayMid }}>
            {value.length}/{maxLen}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: T.card, border: `1px solid ${focused ? T.borderVis : T.border}`,
          color: T.white, fontFamily: BODY, fontSize: 14, padding: '12px 16px',
          outline: 'none', resize: 'vertical', lineHeight: 1.7, transition: 'border-color 0.15s',
          width: '100%', boxSizing: 'border-box',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <div style={{ fontFamily: BODY, fontSize: 11, color: T.grayMid, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

function Select({ label, value, onChange, options, required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#CC3333', marginLeft: 4 }}>✦</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: T.card, border: `1px solid ${T.border}`, color: T.white,
          fontFamily: BODY, fontSize: 14, padding: '12px 16px', outline: 'none', cursor: 'pointer',
          width: '100%', boxSizing: 'border-box', appearance: 'none',
        }}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: T.card }}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: 8, color: T.gray, letterSpacing: '0.4em',
      textTransform: 'uppercase', borderBottom: `1px solid ${T.borderDim}`,
      paddingBottom: 12, marginBottom: 24, marginTop: 8,
    }}>{children}</div>
  )
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
      {children}
    </div>
  )
}

function BrandInfoStep({ data, setData }) {
  const set = (k) => (v) => setData(prev => ({ ...prev, [k]: v }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, marginBottom: 8 }}>Tell us about your brand.</h2>
        <p style={{ fontFamily: BODY, fontSize: 15, color: T.gray, lineHeight: 1.7 }}>This becomes your public identity on Rebl. Collectors see this information on every drop page and your brand profile.</p>
      </div>

      <SectionLabel>Identity</SectionLabel>
      <Grid cols={2}>
        <Field label="Brand Name" value={data.name} onChange={set('name')} placeholder="e.g. Supreme, Nike India" required />
        <Select label="Category" value={data.category} onChange={set('category')} options={CATEGORIES} required />
      </Grid>
      <Field label="Tagline" value={data.tagline} onChange={set('tagline')}
        placeholder="One line that defines you" hint="Shown on your brand profile and drop banners. Keep it sharp." />
      <TextArea label="Brand Description" value={data.description} onChange={set('description')} rows={4} maxLen={400}
        placeholder="Who you are, what you make, why it matters to collectors..."
        hint="Shown on your Rebl brand profile. Collectors read this before buying." />

      <SectionLabel>Contact & Links</SectionLabel>
      <Grid cols={2}>
        <Field label="Contact Email" value={data.email} onChange={set('email')} type="email" placeholder="drops@yourbrand.com" required />
        <Field label="Website" value={data.website} onChange={set('website')} placeholder="https://yourbrand.com" />
      </Grid>
      <Grid cols={2}>
        <Field label="Instagram Handle" value={data.instagram} onChange={set('instagram')} placeholder="@yourbrand" />
        <Field label="Twitter / X Handle" value={data.twitter || ''} onChange={set('twitter')} placeholder="@yourbrand" />
      </Grid>
    </div>
  )
}

function CampaignStep({ data, setData }) {
  const set = (k) => (v) => setData(prev => ({ ...prev, [k]: v }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, marginBottom: 8 }}>Create your campaign.</h2>
        <p style={{ fontFamily: BODY, fontSize: 15, color: T.gray, lineHeight: 1.7 }}>
          A campaign is the parent container for your drops. It can have one drop or many — a seasonal collection, a tour, an entire product line. Each drop inside inherits the campaign's story context.
        </p>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 24, color: T.grayMid }}>◈</span>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', marginBottom: 4 }}>CAMPAIGN → DROPS</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, lineHeight: 1.6 }}>
              "FW24 Drop Season" can contain Box Logo, Hoodie, and Cap drops. Each drop has its own pricing, sizing, and inventory. The campaign provides the story arc.
            </div>
          </div>
        </div>
      </div>

      <SectionLabel>Campaign Details</SectionLabel>
      <Field label="Campaign Name" value={data.name} onChange={set('name')}
        placeholder="e.g. FW24 Season, Summer 2025 Collection, India Tour 2025" required />
      <TextArea label="Campaign Narrative" value={data.narrative} onChange={set('narrative')} rows={5} maxLen={600}
        placeholder="What is this campaign about? What story connects the drops? Why now?"
        hint="This is the overarching story that collectors see before browsing individual drops." required />

      <SectionLabel>Campaign Type</SectionLabel>
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { key: 'single', label: 'SINGLE DROP', desc: 'One product, one moment.' },
          { key: 'multi', label: 'MULTI-DROP SERIES', desc: 'Multiple products, one narrative.' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => set('type')(opt.key)}
            style={{
              flex: 1, background: data.type === opt.key ? T.borderVis : T.card,
              border: `1px solid ${data.type === opt.key ? T.gray : T.border}`,
              padding: '20px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, color: data.type === opt.key ? T.white : T.gray, letterSpacing: '0.2em', marginBottom: 6 }}>{opt.label}</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <SectionLabel>Campaign Visual & Timing</SectionLabel>
      <Field label="Campaign Banner Image URL" value={data.bannerUrl || ''} onChange={set('bannerUrl')}
        placeholder="https://..." hint="Landscape image. Minimum 1600×600px. Used as the hero banner on the campaign page." />
      <Grid cols={2}>
        <Field label="Campaign Start Date" value={data.startDate} onChange={set('startDate')} type="date" required />
        <Field label="Campaign End Date" value={data.endDate} onChange={set('endDate')} type="date" required />
      </Grid>
    </div>
  )
}

function DropBuilderStep({ drops, setDrops, dropIdx, setDropIdx, campaignType }) {
  const drop = drops[dropIdx]
  const set = (k) => (v) => setDrops(prev => prev.map((d, i) => i === dropIdx ? { ...d, [k]: v } : d))

  const sizeOptions = {
    'UK Sizes': UK_SIZES, 'US Sizes': US_SIZES, 'EU Sizes': EU_SIZES,
    'S / M / L / XL': APPAREL_SIZES, 'One Size': [], 'No Sizing': [], 'Custom': [],
  }
  const availableSizes = sizeOptions[drop.sizeType] || []

  function toggleSize(sz) {
    const curr = drop.sizes || []
    const next = curr.includes(sz) ? curr.filter(s => s !== sz) : [...curr, sz]
    set('sizes')(next)
  }

  function addDrop() {
    setDrops(prev => [...prev, emptyDrop(prev.length)])
    setDropIdx(drops.length)
  }

  function removeDrop(idx) {
    if (drops.length === 1) return
    setDrops(prev => prev.filter((_, i) => i !== idx))
    setDropIdx(Math.max(0, dropIdx - 1))
  }

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: T.gray, letterSpacing: '0.3em', marginBottom: 14 }}>DROPS IN CAMPAIGN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {drops.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: dropIdx === i ? T.borderVis : T.card,
                border: `1px solid ${dropIdx === i ? T.gray : T.border}`,
                padding: '10px 14px', cursor: 'pointer',
              }}
              onClick={() => setDropIdx(i)}
            >
              <div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 2 }}>DROP {i + 1}</div>
                <div style={{ fontFamily: BODY, fontSize: 12, color: dropIdx === i ? T.white : T.gray, lineHeight: 1.3 }}>
                  {d.name || 'Untitled Drop'}
                </div>
              </div>
              {drops.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); removeDrop(i) }}
                  style={{ background: 'none', border: 'none', color: T.grayMid, cursor: 'pointer', fontSize: 14, padding: 0 }}
                >×</button>
              )}
            </div>
          ))}
        </div>
        {campaignType === 'multi' && (
          <button
            onClick={addDrop}
            style={{
              marginTop: 8, width: '100%', background: 'none',
              border: `1px dashed ${T.border}`, color: T.grayMid,
              fontFamily: MONO, fontSize: 9, letterSpacing: '0.15em',
              padding: '10px', cursor: 'pointer', textAlign: 'center',
            }}
          >+ ADD DROP</button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, color: T.white, fontWeight: 700, marginBottom: 6 }}>
            Drop {dropIdx + 1} of {drops.length}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 14, color: T.gray, lineHeight: 1.6 }}>
            Everything collectors see on the product page comes from what you enter here.
          </p>
        </div>

        <SectionLabel>Product Basics</SectionLabel>
        <Field label="Drop Name" value={drop.name} onChange={set('name')}
          placeholder="e.g. Box Logo Crewneck FW24" required />
        <Field label="Edition Description" value={drop.edition} onChange={set('edition')}
          placeholder="e.g. Fall/Winter 2024 — 200 units globally. First India-exclusive colourway."
          hint="Shown under the product name. Contextualises rarity and this specific release." required />
        <Grid cols={2}>
          <Select label="Product Category" value={drop.category} onChange={set('category')} options={CATEGORIES} required />
          <Field label="Total Units Available" value={drop.units} onChange={set('units')} type="number"
            placeholder="e.g. 200" required hint="Total number of units in this drop globally." />
        </Grid>

        <SectionLabel>Dynamic Pricing</SectionLabel>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '16px 20px', marginBottom: -8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.white, letterSpacing: '0.2em', marginBottom: 4 }}>ENABLE DYNAMIC PRICING</div>
              <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid }}>Price rises automatically as units are claimed, bounded by floor and ceiling.</div>
            </div>
            <button
              onClick={() => set('dynamicPricing')(!drop.dynamicPricing)}
              style={{
                width: 48, height: 24, background: drop.dynamicPricing ? T.white : T.border,
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 4, left: drop.dynamicPricing ? 26 : 4,
                width: 16, height: 16, background: drop.dynamicPricing ? '#000' : T.grayMid,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
        <Grid cols={3}>
          <Field label="Floor Price (₹)" value={drop.floor} onChange={set('floor')} type="number"
            placeholder="e.g. 11500" required hint="Minimum price — never goes below this." />
          <Field label="Launch Price (₹)" value={drop.launchPrice} onChange={set('launchPrice')} type="number"
            placeholder="e.g. 13995" required hint="Price at drop time — must be between floor and ceiling." />
          <Field label="Ceiling Price (₹)" value={drop.ceiling} onChange={set('ceiling')} type="number"
            placeholder="e.g. 16500" required hint="Maximum price — demand can drive it up to here." />
        </Grid>

        <SectionLabel>Sizing</SectionLabel>
        <Select label="Size Type" value={drop.sizeType} onChange={(v) => { set('sizeType')(v); set('sizes')([]) }} options={SIZE_TYPES} />
        {availableSizes.length > 0 && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: T.gray, letterSpacing: '0.2em', marginBottom: 10 }}>AVAILABLE SIZES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableSizes.map(sz => {
                const selected = (drop.sizes || []).includes(sz)
                return (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    style={{
                      background: selected ? T.white : T.card,
                      border: `1px solid ${selected ? T.white : T.border}`,
                      color: selected ? '#000' : T.gray,
                      fontFamily: MONO, fontSize: 9, padding: '8px 14px',
                      cursor: 'pointer', letterSpacing: '0.1em',
                    }}
                  >{sz}</button>
                )
              })}
            </div>
          </div>
        )}
        {drop.sizeType === 'Custom' && (
          <Field label="Custom Sizes (comma-separated)" value={drop.customSizes || ''} onChange={set('customSizes')}
            placeholder="e.g. 2XL, 3XL, Toddler 4T, Toddler 5T" />
        )}

        <SectionLabel>Drop Timing</SectionLabel>
        <Grid cols={2}>
          <Field label="Drop Date & Time" value={drop.dropDate} onChange={set('dropDate')} type="datetime-local" required />
          <Field label="Drop Ends" value={drop.endDate} onChange={set('endDate')} type="datetime-local" required />
        </Grid>

        <SectionLabel>Product Visual</SectionLabel>
        <Field label="Product Image URL" value={drop.imageUrl} onChange={set('imageUrl')}
          placeholder="https://..." hint="Square image preferred. Used as product hero on the drop page." />
        <Field label="Brand Accent Color" value={drop.mainColor} onChange={set('mainColor')} type="color"
          hint="Used for subtle gradient backgrounds on the drop page. Default: dark navy." />

        <SectionLabel>Origin Story — The Brand's History</SectionLabel>
        <Field label="Section Headline" value={drop.originHeadline} onChange={set('originHeadline')}
          placeholder="e.g. Born on Canal Street. Redesigned by the internet." required />
        <TextArea label="Origin Story Body" value={drop.originBody} onChange={set('originBody')} rows={8} maxLen={1500}
          placeholder="This is the brand's origin story. Where did it come from? What makes it mean something to collectors? The history, the myth, the moments that defined it. Write as if speaking to a serious collector who has done their research." required
          hint="Collectors read this before buying. Longer, richer stories drive higher vault completion rates." />
        <Field label="Pull Quote" value={drop.pullQuote} onChange={set('pullQuote')}
          placeholder="The single best line from your origin story — one sentence that captures everything."
          hint="Displayed in large type between story sections. Make it memorable." />

        <SectionLabel>This Edition — What Makes This Drop Different</SectionLabel>
        <Field label="Edition Headline" value={drop.editionHeadline} onChange={set('editionHeadline')}
          placeholder="e.g. The first colourway built for the Indian monsoon season." required />
        <TextArea label="Edition Story Body" value={drop.editionBody} onChange={set('editionBody')} rows={6} maxLen={800}
          placeholder="What is unique about THIS drop, THIS colourway, THIS moment? What design decisions were made? What materials, what inspiration, what regional context?" required />

        <SectionLabel>Rebl Vault Element — The Collector's Proof</SectionLabel>
        <TextArea label="What does owning this unlock?" value={drop.reblElement} onChange={set('reblElement')} rows={4} maxLen={400}
          placeholder="e.g. Access to the Owner's Room, where Supreme drops internal footage of the FW24 design process. Early access to the Spring 2025 waitlist. Certificate signed by the design director."
          hint="This is what makes the vault entry valuable beyond the physical item. Be specific — vague entries perform poorly." required />

        <SectionLabel>Discovery Tags</SectionLabel>
        <Field label="Tags (comma-separated)" value={drop.tags} onChange={set('tags')}
          placeholder="e.g. Nike, Jordan, Chicago, 1985, Retro, India exclusive"
          hint="Used for search and filtering on the Rebl drops page." />
      </div>
    </div>
  )
}

function ReviewStep({ brand, campaign, drops }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 28, color: T.white, fontWeight: 700, marginBottom: 8 }}>Review your submission.</h2>
        <p style={{ fontFamily: BODY, fontSize: 15, color: T.gray, lineHeight: 1.7 }}>
          The Rebl team will review your brand within 48 hours. Once approved, your campaign and drops go live on the platform.
        </p>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}` }}>
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: '20px 28px' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 10 }}>BRAND</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 22, color: T.white, marginBottom: 4 }}>{brand.name || '—'}</div>
          <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid }}>{brand.category} · {brand.email}</div>
          {brand.tagline && <div style={{ fontFamily: BODY, fontSize: 13, color: T.gray, marginTop: 8, fontStyle: 'italic' }}>"{brand.tagline}"</div>}
        </div>

        <div style={{ borderBottom: `1px solid ${T.border}`, padding: '20px 28px' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 10 }}>CAMPAIGN</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 18, color: T.white, marginBottom: 4 }}>{campaign.name || '—'}</div>
          <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid }}>
            {campaign.type === 'multi' ? 'Multi-Drop Series' : 'Single Drop'} ·{' '}
            {campaign.startDate} → {campaign.endDate}
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 14 }}>
            DROPS ({drops.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {drops.map((d, i) => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, padding: '16px', background: T.surface, border: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 4 }}>DROP {i + 1}</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 14, color: T.white, lineHeight: 1.3 }}>{d.name || '—'}</div>
                  <div style={{ fontFamily: BODY, fontSize: 11, color: T.grayMid, marginTop: 2 }}>{d.category}</div>
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 4 }}>UNITS</div>
                  <div style={{ fontFamily: MONO, fontSize: 18, color: T.white }}>{d.units || '—'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 4 }}>PRICING</div>
                  {d.floor && d.ceiling ? (
                    <div style={{ fontFamily: MONO, fontSize: 12, color: T.white }}>
                      ₹{Number(d.floor).toLocaleString('en-IN')} — ₹{Number(d.ceiling).toLocaleString('en-IN')}
                    </div>
                  ) : <div style={{ fontFamily: MONO, fontSize: 12, color: T.grayMid }}>—</div>}
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, marginTop: 2 }}>
                    {d.dynamicPricing ? 'DYNAMIC' : 'FIXED'}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 4 }}>STORY</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: d.originBody ? '#4CAF50' : '#CC3333' }}>
                    {d.originBody ? 'WRITTEN ✓' : 'MISSING ✗'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.borderVis}`, padding: '24px 28px' }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', marginBottom: 12 }}>WHAT HAPPENS NEXT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '01', label: 'Rebl reviews your submission', time: 'Within 48 hours' },
            { step: '02', label: 'We verify your brand identity and drop details', time: '24–48 hours after approval' },
            { step: '03', label: 'Your brand page goes live', time: 'yourbrand.rebl.in' },
            { step: '04', label: 'Drops activate on your scheduled dates', time: 'Automatic' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, width: 20, flexShrink: 0 }}>{s.step}</span>
              <div style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: T.gray }}>{s.label}</div>
              <span style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, textAlign: 'right' }}>{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BrandCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [brand, setBrand] = useState({ name: '', category: 'Sneakers', tagline: '', description: '', email: '', website: '', instagram: '', twitter: '' })
  const [campaign, setCampaign] = useState({ name: '', narrative: '', type: 'single', bannerUrl: '', startDate: '', endDate: '' })
  const [drops, setDrops] = useState([emptyDrop(0)])
  const [dropIdx, setDropIdx] = useState(0)

  function next() { if (step < 4) setStep(s => s + 1); else { setSubmitted(true) } }
  function back() { if (step > 1) setStep(s => s - 1) }

  if (submitted) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 48, color: T.borderVis, marginBottom: 24 }}>✦</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 36, color: T.white, fontWeight: 700, marginBottom: 16 }}>Submission received.</h1>
          <p style={{ fontFamily: BODY, fontSize: 16, color: T.gray, lineHeight: 1.8, marginBottom: 40 }}>
            The Rebl team will review <strong style={{ color: T.white }}>{brand.name || 'your brand'}</strong> within 48 hours. We'll reach out to <strong style={{ color: T.white }}>{brand.email || 'your email'}</strong> with next steps.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/brands" style={{
              fontFamily: MONO, fontSize: 10, color: '#000', background: T.white,
              textDecoration: 'none', padding: '14px 32px', letterSpacing: '0.2em',
            }}>BACK TO BRANDS</Link>
            <Link to="/drops" style={{
              fontFamily: MONO, fontSize: 10, color: T.gray,
              border: `1px solid ${T.border}`, textDecoration: 'none', padding: '14px 32px', letterSpacing: '0.2em',
            }}>VIEW DROPS</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
            </Link>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid }}>/</span>
            <Link to="/brands" style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.12em' }}>BRANDS</Link>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid }}>/</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.gray, letterSpacing: '0.12em' }}>CREATE</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.2em' }}>
            STEP {step} OF 4
          </div>
        </div>
      </nav>

      <div style={{ borderBottom: `1px solid ${T.border}`, padding: '0 40px', background: T.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
          {STEPS.map((s, i) => {
            const active = step === s.n
            const done = step > s.n
            return (
              <div
                key={s.n}
                style={{
                  flex: 1, padding: '16px 0', borderBottom: `2px solid ${active ? T.white : done ? T.borderVis : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: done ? 'pointer' : 'default',
                }}
                onClick={() => done && setStep(s.n)}
              >
                <div style={{
                  width: 20, height: 20, border: `1px solid ${active || done ? T.white : T.borderVis}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 8, color: active || done ? T.white : T.grayMid,
                  background: done ? T.white : 'transparent',
                }}>
                  <span style={{ color: done ? '#000' : 'inherit' }}>{done ? '✓' : s.n}</span>
                </div>
                <span style={{
                  fontFamily: MONO, fontSize: 9, color: active ? T.white : done ? T.gray : T.grayMid,
                  letterSpacing: '0.2em',
                }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px 120px' }}>
        {step === 1 && <BrandInfoStep data={brand} setData={setBrand} />}
        {step === 2 && <CampaignStep data={campaign} setData={setCampaign} />}
        {step === 3 && (
          <DropBuilderStep
            drops={drops} setDrops={setDrops}
            dropIdx={dropIdx} setDropIdx={setDropIdx}
            campaignType={campaign.type}
          />
        )}
        {step === 4 && <ReviewStep brand={brand} campaign={campaign} drops={drops} />}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: T.surface, borderTop: `1px solid ${T.border}`,
        padding: '20px 40px', zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={back}
            disabled={step === 1}
            style={{
              background: 'none', border: `1px solid ${step === 1 ? T.border : T.borderVis}`,
              color: step === 1 ? T.grayMid : T.gray,
              fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em',
              padding: '12px 28px', cursor: step === 1 ? 'not-allowed' : 'pointer',
            }}
          >← BACK</button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {STEPS.map(s => (
              <div key={s.n} style={{
                width: step === s.n ? 20 : 6, height: 6,
                background: step > s.n ? T.gray : step === s.n ? T.white : T.border,
                transition: 'all 0.2s',
              }} />
            ))}
          </div>

          <button
            onClick={next}
            style={{
              background: T.white, border: 'none', color: '#000',
              fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em',
              padding: '12px 28px', cursor: 'pointer',
            }}
          >{step === 4 ? 'SUBMIT FOR REVIEW →' : 'CONTINUE →'}</button>
        </div>
      </div>
    </div>
  )
}
