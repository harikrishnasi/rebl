import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const C = {
  primary: '#0F0F1A', accent: '#E63946', cream: '#F1FAEE',
  muted: '#8D99AE', gold: '#FFB703', card: '#16162A',
  border: 'rgba(255,255,255,0.08)', sidebar: '#12121F',
}

const CATEGORY_LANGUAGE = {
  sneakers:           { drop: 'Drop',    product: 'Pair',      community: 'Sneakerheads' },
  streetwear:         { drop: 'Release', product: 'Piece',     community: 'Crew'         },
  luxury_fashion:     { drop: 'Edition', product: 'Piece',     community: 'Collectors'   },
  watches:            { drop: 'Release', product: 'Timepiece', community: 'Enthusiasts'  },
  art:                { drop: 'Launch',  product: 'Work',      community: 'Collectors'   },
  electronics:        { drop: 'Drop',    product: 'Unit',      community: 'Community'    },
  concert_tickets:    { drop: 'Show',    product: 'Ticket',    community: 'Fans'         },
  sports_memorabilia: { drop: 'Drop',    product: 'Item',      community: 'Fans'         },
  trading_cards:      { drop: 'Set',     product: 'Card',      community: 'Players'      },
  vinyl_music:        { drop: 'Press',   product: 'Record',    community: 'Listeners'    },
  books_rare:         { drop: 'Edition', product: 'Volume',    community: 'Readers'      },
  other:              { drop: 'Drop',    product: 'Item',      community: 'Community'    },
}

export default function BrandDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [brand, setBrand] = useState(null)
  const [lang, setLang] = useState(CATEGORY_LANGUAGE.other)
  const [tiers, setTiers] = useState([])
  const [drops, setDrops] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      const { data: b } = await supabase
        .from('brands').select('*, brand_categories(*)').eq('owner_id', session.user.id).single()
      if (!b) { navigate('/brand/signup'); return }

      setBrand(b)

      const primaryCat = b.brand_categories?.find(c => c.is_primary)?.category
        || b.brand_categories?.[0]?.category || 'other'
      setLang(CATEGORY_LANGUAGE[primaryCat] || CATEGORY_LANGUAGE.other)

      const [tiersRes, dropsRes, customersRes] = await Promise.all([
        supabase.from('customer_tiers').select('*').eq('brand_id', b.id).order('level'),
        supabase.from('drops').select('*').eq('brand_id', b.id).order('created_at', { ascending: false }),
        supabase.from('brand_customers').select('*, profiles(display_name, avatar_url, username)').eq('brand_id', b.id),
      ])
      setTiers(tiersRes.data || [])
      setDrops(dropsRes.data || [])
      setCustomers(customersRes.data || [])
      setLoading(false)

      if (searchParams.get('welcome') === '1') setShowWelcome(true)
    }
    load()
  }, [])

  const TABS = [
    { id: 'overview',  icon: '◈', label: 'Overview' },
    { id: 'drops',     icon: '⚡', label: `${lang.drop}s` },
    { id: 'story',     icon: '✦', label: 'Story Builder' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'campaigns', icon: '📣', label: 'Campaigns' },
    { id: 'backstage', icon: '🎭', label: 'Backstage' },
    { id: 'settings',  icon: '⚙', label: 'Settings' },
  ]

  if (loading) return <FullLoader />

  const tabProps = { brand, lang, tiers, drops, setDrops, customers }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.primary, color: C.cream, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {showWelcome && <WelcomeModal brand={brand} lang={lang} onClose={() => setShowWelcome(false)} />}

      {/* Top bar */}
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.sidebar, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {brand.logo_url
            ? <img src={brand.logo_url} alt={brand.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>{brand.name[0]}</div>
          }
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{brand.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{brand.slug}.rebl.in</div>
          </div>
        </div>
        <button onClick={() => navigate(`/brand/${brand.slug}`)}
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, color: C.cream, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          View Page ↗
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar — desktop only */}
        <aside style={{
          width: 200, flexShrink: 0, backgroundColor: C.sidebar,
          borderRight: `1px solid ${C.border}`, padding: '20px 0',
          display: 'flex', flexDirection: 'column', gap: 2,
        }} className="brand-sidebar">
          {TABS.map(tab => (
            <SidebarTab key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 100px' }}>
          {activeTab === 'overview'  && <TabOverview  {...tabProps} />}
          {activeTab === 'drops'     && <TabDrops     {...tabProps} />}
          {activeTab === 'story'     && <TabStory     {...tabProps} />}
          {activeTab === 'customers' && <TabCustomers {...tabProps} />}
          {activeTab === 'campaigns' && <TabCampaigns {...tabProps} />}
          {activeTab === 'backstage' && <TabBackstage {...tabProps} />}
          {activeTab === 'settings'  && <TabSettings  {...tabProps} setBrand={setBrand} />}
        </main>
      </div>

      {/* Bottom tabs — mobile only */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: C.sidebar, borderTop: `1px solid ${C.border}`,
        display: 'none', zIndex: 50,
      }} className="brand-bottom-nav">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '10px 4px', border: 'none', background: 'none',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: activeTab === tab.id ? 700 : 400, color: activeTab === tab.id ? C.accent : C.muted, marginTop: 2 }}>
              {tab.label.slice(0, 7)}
            </span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (max-width: 680px) {
          .brand-sidebar { display: none !important; }
          .brand-bottom-nav { display: flex !important; }
          main { padding: 20px 16px 90px !important; }
        }
      `}</style>
    </div>
  )
}

/* ─── SIDEBAR TAB ─── */
function SidebarTab({ tab, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
      border: 'none', background: active ? 'rgba(230,57,70,0.12)' : 'none',
      borderLeft: `3px solid ${active ? C.accent : 'transparent'}`,
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%',
    }}>
      <span style={{ fontSize: 16, opacity: active ? 1 : 0.7 }}>{tab.icon}</span>
      <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: active ? C.cream : C.muted }}>
        {tab.label}
      </span>
    </button>
  )
}

/* ══════════════════════════════════════════
   TAB: OVERVIEW
══════════════════════════════════════════ */
function TabOverview({ brand, lang, tiers, drops, customers }) {
  const liveDrops = drops.filter(d => d.status === 'live')
  const totalRevenue = drops.reduce((s, d) => s + (d.revenue || 0), 0)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Overview</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Your brand performance at a glance</p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: `Total ${lang.drop}s`, value: drops.length, icon: '⚡', color: C.accent },
          { label: 'Live Now', value: liveDrops.length, icon: '🔴', color: '#22c55e' },
          { label: `${lang.community}`, value: customers.length, icon: '👥', color: C.gold },
          { label: 'Revenue (₹)', value: totalRevenue > 0 ? `${(totalRevenue/1000).toFixed(1)}k` : '—', icon: '💰', color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} style={{
            backgroundColor: C.card, borderRadius: 14, padding: '18px 18px 14px',
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tier summary */}
      {tiers.length > 0 && (
        <Section title="Customer Tiers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tiers.map(tier => {
              const count = customers.filter(c => c.tier_level === tier.level).length
              const pct = customers.length ? Math.round(count / customers.length * 100) : 0
              return (
                <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', backgroundColor: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: `#${tier.color}`, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{tier.name}</span>
                  <span style={{ color: C.muted, fontSize: 13 }}>{count} {lang.community.toLowerCase()}</span>
                  <div style={{ width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: `#${tier.color}`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Recent drops */}
      {drops.length > 0 ? (
        <Section title={`Recent ${lang.drop}s`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drops.slice(0, 5).map(drop => (
              <DropRow key={drop.id} drop={drop} lang={lang} />
            ))}
          </div>
        </Section>
      ) : (
        <EmptyState icon="⚡" title={`No ${lang.drop}s yet`} desc={`Create your first ${lang.drop.toLowerCase()} to get started`} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: DROPS
══════════════════════════════════════════ */
function TabDrops({ brand, lang, drops, setDrops }) {
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', edition: '', quantity: '', price: '', drop_date: '', status: 'upcoming' })
  const [saving, setSaving] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const { data, error } = await supabase.from('drops').insert({
        brand_id: brand.id,
        name: form.name, edition: form.edition || null,
        quantity: form.quantity ? Number(form.quantity) : null,
        price: form.price ? Number(form.price) : null,
        drop_date: form.drop_date || null,
        status: form.status,
      }).select().single()
      if (error) throw error
      setDrops(prev => [data, ...prev])
      setShowCreate(false)
      setForm({ name: '', edition: '', quantity: '', price: '', drop_date: '', status: 'upcoming' })
      toast.success(`${lang.drop} created!`)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function updateStatus(id, status) {
    await supabase.from('drops').update({ status }).eq('id', id)
    setDrops(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{lang.drop}s</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>{drops.length} total · {drops.filter(d => d.status === 'live').length} live</p>
        </div>
        <RedBtn onClick={() => setShowCreate(true)}>+ New {lang.drop}</RedBtn>
      </div>

      {showCreate && (
        <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Create {lang.drop}</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              {[
                { key: 'name', label: `${lang.drop} Name *`, placeholder: `e.g. Summer ${lang.drop} '25` },
                { key: 'edition', label: 'Edition / Series', placeholder: 'e.g. Vol. 1' },
                { key: 'quantity', label: `${lang.product} Quantity`, placeholder: '100', type: 'number' },
                { key: 'price', label: 'Price (₹)', placeholder: '5000', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} style={IS} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Drop Date</label>
                <input type="datetime-local" value={form.drop_date} onChange={e => setForm(p => ({ ...p, drop_date: e.target.value }))} style={IS} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Creating…' : `Create ${lang.drop}`}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {drops.length === 0
        ? <EmptyState icon="⚡" title={`No ${lang.drop}s yet`} desc={`Create your first ${lang.drop.toLowerCase()} to start selling`} />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drops.map(drop => (
              <div key={drop.id} style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <StatusPill status={drop.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{drop.name}</div>
                  {drop.edition && <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{drop.edition}</div>}
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    {drop.quantity && <span style={{ fontSize: 12, color: C.muted }}>{drop.quantity} {lang.product.toLowerCase()}s</span>}
                    {drop.price && <span style={{ fontSize: 12, color: C.muted }}>₹{drop.price.toLocaleString('en-IN')}</span>}
                    {drop.drop_date && <span style={{ fontSize: 12, color: C.muted }}>{new Date(drop.drop_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </div>
                </div>
                <select value={drop.status} onChange={e => updateStatus(drop.id, e.target.value)}
                  style={{ ...IS, width: 110, fontSize: 12, padding: '7px 10px', appearance: 'none' }}>
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: STORY BUILDER
══════════════════════════════════════════ */
const EMPTY_FIELDS = { headline: '', origin: '', design_intent: '', why_limited: '', behind_scenes: '' }
const LIMITS = { headline: 80, origin: 300, design_intent: 300, why_limited: 200, behind_scenes: 500 }

function TabStory({ brand, lang, drops }) {
  const [selectedDrop, setSelectedDrop] = useState('')
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [generating, setGenerating] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const msgs = ['Studying your brand...', 'Crafting the narrative...', 'Polishing the story...']

  useEffect(() => {
    if (!generating) return
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1800)
    return () => clearInterval(iv)
  }, [generating])

  function setField(k, v) {
    setFields(prev => ({ ...prev, [k]: v.slice(0, LIMITS[k]) }))
    setPublished(false)
  }

  function handleDropChange(id) {
    setSelectedDrop(id)
    setFields(EMPTY_FIELDS)
    setPublished(false)
  }

  async function generate() {
    const drop = drops.find(d => d.id === selectedDrop)
    if (!drop) { toast.error(`Select a ${lang.drop.toLowerCase()} first`); return }
    setGenerating(true)
    setPublished(false)

    const primaryCat = brand.brand_categories?.find(c => c.is_primary)?.category
      || brand.brand_categories?.[0]?.category || 'other'

    const system = `You write authentic, editorial product stories for collector brands. Never corporate. Never marketing speak.`
    const prompt = `Brand: ${brand.name} (${primaryCat})
Drop: ${drop.name}${drop.edition ? ` — ${drop.edition}` : ''}
Description: ${drop.description || drop.name}
Limited edition strategies: ${(brand.limited_edition_strategies || []).join(', ') || 'limited quantity'}

Return ONLY valid JSON (no markdown, no backticks):
{ "headline": "", "origin": "", "design_intent": "", "why_limited": "" }

Each field: 2-3 sentences max. Tone: collector-grade editorial.`

    try {
      const raw = await callGeminiAPI(prompt, system)
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setFields(prev => ({
        ...prev,
        headline:      (parsed.headline     || '').slice(0, LIMITS.headline),
        origin:        (parsed.origin       || '').slice(0, LIMITS.origin),
        design_intent: (parsed.design_intent|| '').slice(0, LIMITS.design_intent),
        why_limited:   (parsed.why_limited  || '').slice(0, LIMITS.why_limited),
      }))
    } catch (err) {
      toast.error('Generation failed — check console')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handlePublish() {
    if (!selectedDrop) return
    if (!fields.headline || !fields.origin) { toast.error('Headline and Origin Story are required'); return }
    setPublishing(true)
    try {
      const { error } = await supabase.from('product_stories').upsert({
        drop_id: selectedDrop,
        brand_id: brand.id,
        headline: fields.headline,
        origin: fields.origin,
        design_intent: fields.design_intent,
        why_limited: fields.why_limited,
        behind_scenes: fields.behind_scenes || null,
        published: true,
      }, { onConflict: 'drop_id' })
      if (error) throw error
      toast.success('Story published!')
      setPublished(true)
    } catch (err) { toast.error(err.message) }
    finally { setPublishing(false) }
  }

  const drop = drops.find(d => d.id === selectedDrop)
  const hasContent = fields.headline || fields.origin

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Story Builder</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>
        Craft the product story that lives on every collector's item card.
      </p>

      {/* Drop selector */}
      <div style={{ marginBottom: 28 }}>
        <SBLabel>Choose a {lang.drop}</SBLabel>
        {drops.length === 0
          ? <p style={{ color: C.muted, fontSize: 14 }}>No {lang.drop.toLowerCase()}s yet — create one in the {lang.drop}s tab first.</p>
          : <select value={selectedDrop} onChange={e => handleDropChange(e.target.value)} style={{ ...IS, maxWidth: 400 }}>
              <option value="">Select a {lang.drop.toLowerCase()}…</option>
              {drops.map(d => <option key={d.id} value={d.id}>{d.name}{d.edition ? ` — ${d.edition}` : ''}</option>)}
            </select>
        }
      </div>

      {selectedDrop && (
        <>
          {/* Generate button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <button
              onClick={generate}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                backgroundColor: generating ? 'rgba(230,57,70,0.25)' : 'rgba(230,57,70,0.15)',
                color: C.accent, border: `1px solid rgba(230,57,70,0.35)`,
                borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14,
                cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {generating
                ? <><Spinner size={16} />{msgs[msgIdx]}</>
                : <>✦ Generate with AI</>
              }
            </button>
            <span style={{ color: C.muted, fontSize: 13 }}>or fill in the fields manually below</span>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
            <SBField
              label="Headline"
              hint="The story hook — one sharp line"
              value={fields.headline} limit={LIMITS.headline}
              onChange={v => setField('headline', v)}
              placeholder="e.g. Some things are made to last. This is one of them."
            />
            <SBField
              label="Origin Story"
              hint="Where did this come from?"
              value={fields.origin} limit={LIMITS.origin}
              onChange={v => setField('origin', v)}
              multiline
              placeholder="The idea, the place, the moment that started it all…"
            />
            <SBField
              label="Design Intent"
              hint="What were you expressing?"
              value={fields.design_intent} limit={LIMITS.design_intent}
              onChange={v => setField('design_intent', v)}
              multiline
              placeholder="The aesthetic decisions, the references, the obsession behind the form…"
            />
            <SBField
              label="Why Limited?"
              hint="The honest scarcity rationale"
              value={fields.why_limited} limit={LIMITS.why_limited}
              onChange={v => setField('why_limited', v)}
              multiline
              placeholder="Not because it's marketing — because of this specific reason…"
            />
            <SBField
              label="Behind the Scenes"
              hint="Text or media URL — optional"
              value={fields.behind_scenes} limit={LIMITS.behind_scenes}
              onChange={v => setField('behind_scenes', v)}
              placeholder="https://… or a short note about the making process"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => hasContent && setShowPreview(true)}
              disabled={!hasContent}
              style={{
                backgroundColor: 'transparent', color: hasContent ? C.cream : C.muted,
                border: `1px solid ${hasContent ? 'rgba(255,255,255,0.2)' : C.border}`,
                borderRadius: 10, padding: '12px 22px', fontWeight: 600, fontSize: 14,
                cursor: hasContent ? 'pointer' : 'not-allowed',
              }}
            >
              👁 Preview as Collector
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              style={{
                backgroundColor: published ? '#22c55e' : C.accent,
                color: C.cream, border: 'none',
                borderRadius: 10, padding: '12px 26px', fontWeight: 700, fontSize: 14,
                cursor: publishing || published ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s', opacity: publishing ? 0.75 : 1,
              }}
            >
              {publishing ? 'Publishing…' : published ? '✓ Published' : 'Save & Publish'}
            </button>
          </div>
        </>
      )}

      {/* Preview modal */}
      {showPreview && drop && (
        <StoryPreviewModal
          fields={fields}
          drop={drop}
          brand={brand}
          lang={lang}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

/* ── Story field component ── */
function SBLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 }}>{children}</div>
}

function SBField({ label, hint, value, limit, onChange, multiline, placeholder }) {
  const pct = Math.round((value.length / limit) * 100)
  const nearLimit = pct >= 85

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.cream }}>{label}</span>
          {hint && <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>— {hint}</span>}
        </div>
        <span style={{ fontSize: 11, color: nearLimit ? C.gold : C.muted, fontWeight: nearLimit ? 700 : 400, transition: 'color 0.2s' }}>
          {value.length}/{limit}
        </span>
      </div>
      {multiline
        ? <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{
              ...IS, width: '100%', resize: 'vertical', lineHeight: 1.65, fontSize: 14, boxSizing: 'border-box',
              borderColor: nearLimit ? 'rgba(255,183,3,0.4)' : 'rgba(255,255,255,0.09)',
            }}
          />
        : <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              ...IS,
              borderColor: nearLimit ? 'rgba(255,183,3,0.4)' : 'rgba(255,255,255,0.09)',
            }}
          />
      }
    </div>
  )
}

/* ── Collector preview modal ── */
function StoryPreviewModal({ fields, drop, brand, lang, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>👁 Collector View</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Item card preview */}
        <div style={{ padding: '24px 24px 32px' }}>
          {/* Brand bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            {brand.logo_url
              ? <img src={brand.logo_url} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{brand.name[0]}</div>
            }
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{brand.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{drop.name}{drop.edition ? ` · ${drop.edition}` : ''}</div>
            </div>
            <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(230,57,70,0.12)', border: `1px solid rgba(230,57,70,0.3)`, fontSize: 11, fontWeight: 700, color: C.accent }}>
              ✦ Verified {lang.drop}
            </div>
          </div>

          {/* Headline */}
          {fields.headline && (
            <h2 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.25, marginBottom: 20, letterSpacing: '-0.3px' }}>
              {fields.headline}
            </h2>
          )}

          {/* Story sections */}
          {[
            { label: 'The Origin', value: fields.origin },
            { label: 'Design Intent', value: fields.design_intent },
            { label: 'Why Limited?', value: fields.why_limited },
          ].filter(s => s.value).map((section, i) => (
            <div key={i} style={{ marginBottom: 18, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? C.accent : i === 1 ? C.gold : 'rgba(255,255,255,0.15)'}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{section.label}</div>
              <p style={{ fontSize: 14, lineHeight: 1.72, color: C.cream, margin: 0 }}>{section.value}</p>
            </div>
          ))}

          {/* Behind the scenes */}
          {fields.behind_scenes && (
            <div style={{ marginTop: 20, padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🎭 Behind the Scenes</div>
              {fields.behind_scenes.startsWith('http')
                ? <a href={fields.behind_scenes} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 13, wordBreak: 'break-all' }}>{fields.behind_scenes}</a>
                : <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, margin: 0 }}>{fields.behind_scenes}</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Spinner ── */
function Spinner({ size = 20 }) {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: size, height: size, border: `2px solid rgba(230,57,70,0.25)`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
    </>
  )
}

/* ══════════════════════════════════════════
   TAB: CUSTOMERS
══════════════════════════════════════════ */
function TabCustomers({ brand, lang, tiers, customers }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? customers : customers.filter(c => c.tier_level === Number(filter))

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Customers</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>{customers.length} {lang.community.toLowerCase()} in your community</p>

      {/* Tier filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        {tiers.map(t => (
          <FilterPill key={t.id} label={t.name} active={filter === String(t.level)} onClick={() => setFilter(String(t.level))} color={`#${t.color}`} />
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="👥" title="No customers yet" desc="Your community will appear here once people join" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((c, i) => {
              const prof = c.profiles
              const tier = tiers.find(t => t.level === c.tier_level)
              return (
                <div key={c.id || i} style={{ backgroundColor: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                    {prof?.avatar_url ? <img src={prof.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (prof?.display_name?.[0] || '?')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{prof?.display_name || 'Anonymous'}</div>
                    {prof?.username && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>@{prof.username}</div>}
                  </div>
                  {tier && (
                    <div style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: `${tierBg(tier.color)}`, border: `1px solid #${tier.color}40`, fontSize: 12, fontWeight: 700, color: `#${tier.color}`, flexShrink: 0 }}>
                      {tier.name}
                    </div>
                  )}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {c.total_purchases != null && <div style={{ fontSize: 13, fontWeight: 600 }}>{c.total_purchases} {c.total_purchases === 1 ? lang.product.toLowerCase() : `${lang.product.toLowerCase()}s`}</div>}
                    {c.total_spent != null && <div style={{ fontSize: 12, color: C.muted }}>₹{c.total_spent?.toLocaleString('en-IN')}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: CAMPAIGNS
══════════════════════════════════════════ */
function TabCampaigns({ brand, lang }) {
  const [campaigns, setCampaigns] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', tier_target: 'all' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('campaigns').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data || []); setLoaded(true) })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title || !form.message) { toast.error('Title and message required'); return }
    setSaving(true)
    try {
      const { data, error } = await supabase.from('campaigns').insert({ brand_id: brand.id, ...form }).select().single()
      if (error) throw error
      setCampaigns(prev => [data, ...prev])
      setShowCreate(false)
      setForm({ title: '', message: '', type: 'announcement', tier_target: 'all' })
      toast.success('Campaign created!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (!loaded) return <FullLoader small />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Campaigns</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>Communicate with your {lang.community.toLowerCase()}</p>
        </div>
        <RedBtn onClick={() => setShowCreate(true)}>+ New Campaign</RedBtn>
      </div>

      {showCreate && (
        <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>New Campaign</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Exclusive early access for Legends" style={IS} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
                    <option value="announcement">Announcement</option>
                    <option value="drop_alert">Drop Alert</option>
                    <option value="early_access">Early Access</option>
                    <option value="reward">Reward</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Target Tier</label>
                  <select value={form.tier_target} onChange={e => setForm(p => ({ ...p, tier_target: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
                    <option value="all">All {lang.community}</option>
                    <option value="insider">Insider +</option>
                    <option value="legend">Legend Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Your message to the community…" rows={4}
                  style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Create Campaign'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {campaigns.length === 0
        ? <EmptyState icon="📣" title="No campaigns yet" desc={`Send announcements, drop alerts, and rewards to your ${lang.community.toLowerCase()}`} />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campaigns.map(camp => (
              <div key={camp.id} style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{camp.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <TypePill type={camp.type} />
                    {camp.tier_target !== 'all' && (
                      <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,183,3,0.12)', color: C.gold, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                        {camp.tier_target}
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{camp.message}</p>
                <div style={{ fontSize: 12, color: 'rgba(141,153,174,0.5)', marginTop: 10 }}>
                  {new Date(camp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: BACKSTAGE
══════════════════════════════════════════ */
function TabBackstage({ brand, lang }) {
  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tier_required: 'insider', post_type: 'update' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('backstage_posts').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoaded(true) })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Title and content required'); return }
    setSaving(true)
    try {
      const { data, error } = await supabase.from('backstage_posts').insert({ brand_id: brand.id, ...form }).select().single()
      if (error) throw error
      setPosts(prev => [data, ...prev])
      setShowCreate(false)
      setForm({ title: '', content: '', tier_required: 'insider', post_type: 'update' })
      toast.success('Backstage post published!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (!loaded) return <FullLoader small />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Backstage</h1>
        <RedBtn onClick={() => setShowCreate(true)}>+ New Post</RedBtn>
      </div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
        Exclusive content for your top {lang.community.toLowerCase()}. Only visible to qualifying tiers.
      </p>

      {showCreate && (
        <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20 }}>New Backstage Post</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Behind the scenes — Summer Drop" style={IS} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Post Type</label>
                  <select value={form.post_type} onChange={e => setForm(p => ({ ...p, post_type: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
                    <option value="update">Behind the Scenes</option>
                    <option value="early_access">Early Access</option>
                    <option value="making_of">Making Of</option>
                    <option value="exclusive">Exclusive Offer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Min Tier Required</label>
                  <select value={form.tier_required} onChange={e => setForm(p => ({ ...p, tier_required: e.target.value }))} style={{ ...IS, appearance: 'none' }}>
                    <option value="follower">Follower (All)</option>
                    <option value="insider">Insider +</option>
                    <option value="legend">Legend Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Content *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Share something exclusive with your community…" rows={5}
                  style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{ backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Publishing…' : 'Publish'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {posts.length === 0
        ? <EmptyState icon="🎭" title="No backstage posts yet" desc={`Share exclusive behind-the-scenes content with your top ${lang.community.toLowerCase()}`} />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {posts.map(post => (
              <div key={post.id} style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{post.title}</div>
                  <div style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,183,3,0.12)', color: C.gold, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                    🔒 {post.tier_required}+
                  </div>
                </div>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{post.content}</p>
                <div style={{ fontSize: 12, color: 'rgba(141,153,174,0.5)', marginTop: 10 }}>
                  {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: SETTINGS
══════════════════════════════════════════ */
function TabSettings({ brand, lang, setBrand }) {
  const [form, setForm] = useState({ name: brand.name || '', description: brand.description || '', website: brand.website || '' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(brand.logo_url || null)
  const [saving, setSaving] = useState(false)
  const logoRef = useRef(null)

  function handleLogoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    setSaving(true)
    try {
      let logoUrl = brand.logo_url
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `brand-logos/${brand.owner_id}.${ext}`
        await supabase.storage.from('item-images').upload(path, logoFile, { upsert: true })
        const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
        logoUrl = urlData.publicUrl
      }
      const { data, error } = await supabase.from('brands').update({ ...form, logo_url: logoUrl }).eq('id', brand.id).select().single()
      if (error) throw error
      setBrand(prev => ({ ...prev, ...data }))
      toast.success('Settings saved!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Settings</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Manage your brand profile</p>

      <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div onClick={() => logoRef.current?.click()} style={{ width: 88, height: 88, borderRadius: '50%', backgroundColor: C.card, border: `2px dashed ${logoPreview ? C.accent : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {logoPreview ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🏷</span>}
          </div>
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Brand Logo</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Tap to change</div>
          </div>
        </div>

        {[
          { key: 'name', label: 'Brand Name' },
          { key: 'website', label: 'Website URL', placeholder: 'https://yourbrand.com' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: 'block', fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 7 }}>{f.label}</label>
            <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} style={IS} />
          </div>
        ))}

        <div>
          <label style={{ display: 'block', fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 7 }}>Description ({form.description.length}/140)</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value.slice(0, 140) }))} rows={3} style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
        </div>

        <div style={{ backgroundColor: C.card, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 4 }}>Brand Slug (read-only)</div>
          <div style={{ fontWeight: 700 }}>{brand.slug}.rebl.in</div>
        </div>

        <RedBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</RedBtn>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   WELCOME MODAL
══════════════════════════════════════════ */
function WelcomeModal({ brand, lang, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, padding: '40px 36px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Welcome to Rebl, {brand.name}!</h2>
        <p style={{ color: C.muted, lineHeight: 1.65, marginBottom: 28 }}>
          Your brand page is live at <span style={{ color: C.cream, fontWeight: 700 }}>{brand.slug}.rebl.in</span>.
          Start by creating your first {lang.drop.toLowerCase()} and building your {lang.community.toLowerCase()} community.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { emoji: '⚡', text: `Create your first ${lang.drop}`, sub: `${lang.drop}s tab` },
            { emoji: '✦', text: 'Generate a launch story', sub: 'Story Builder tab' },
            { emoji: '📣', text: 'Set up a campaign', sub: 'Campaigns tab' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.text}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 28, width: '100%', backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Let's Go →
        </button>
      </div>
    </div>
  )
}

/* ─── SHARED COMPONENTS ─── */
function DropRow({ drop, lang }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${C.border}` }}>
      <StatusPill status={drop.status} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{drop.name}</div>
        {drop.edition && <div style={{ color: C.muted, fontSize: 12 }}>{drop.edition}</div>}
      </div>
      {drop.quantity && <span style={{ fontSize: 13, color: C.muted }}>{drop.quantity} {lang.product.toLowerCase()}s</span>}
    </div>
  )
}

function StatusPill({ status }) {
  const map = { live: ['#22c55e', 'rgba(34,197,94,0.12)', '● Live'], upcoming: [C.gold, 'rgba(255,183,3,0.12)', '⏳ Soon'], draft: [C.muted, 'rgba(141,153,174,0.1)', 'Draft'], ended: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.06)', 'Ended'] }
  const [color, bg, label] = map[status] || map.draft
  return <span style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: bg, color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
}

function FilterPill({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? (color || C.accent) : 'rgba(255,255,255,0.12)'}`, backgroundColor: active ? (color ? `${color}20` : 'rgba(230,57,70,0.12)') : 'transparent', color: active ? (color || C.accent) : C.muted, fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer' }}>
      {label}
    </button>
  )
}

function TypePill({ type }) {
  const map = { announcement: [C.muted, 'rgba(141,153,174,0.1)', 'Announcement'], drop_alert: [C.accent, 'rgba(230,57,70,0.12)', '⚡ Drop Alert'], early_access: [C.gold, 'rgba(255,183,3,0.12)', '★ Early Access'], reward: ['#22c55e', 'rgba(34,197,94,0.12)', '🎁 Reward'] }
  const [color, bg, label] = map[type] || map.announcement
  return <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: bg, color, fontSize: 11, fontWeight: 700 }}>{label}</span>
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: C.cream }}>{title}</h3>
      {children}
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 14 }}>{desc}</div>
    </div>
  )
}

function RedBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ backgroundColor: disabled ? 'rgba(230,57,70,0.4)' : C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

function FullLoader({ small }) {
  return (
    <div style={{ minHeight: small ? 200 : '100vh', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(230,57,70,0.2)', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

function tierBg(hex) {
  return `#${hex}18`
}

const IS = {
  width: '100%', backgroundColor: C.card, color: C.cream,
  border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 10,
  padding: '11px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
}
