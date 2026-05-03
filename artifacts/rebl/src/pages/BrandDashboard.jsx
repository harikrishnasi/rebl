import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { callGeminiAPI } from '@/lib/gemini'

const C = {
  primary: '#0A0A12', accent: '#A8B2C4', cream: '#F0F4FF',
  muted: '#5A6380', gold: '#FFB703', card: '#12121E',
  border: '#2A2A3E', sidebar: '#050508',
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

      {/* ── Floating Contact Buyers button ── */}
      <button
        onClick={() => { setActiveTab('customers') }}
        style={{ position: 'fixed', bottom: 80, right: 24, zIndex: 200, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 28, padding: '12px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 24px rgba(230,57,70,0.45)', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ✉ Contact Buyers
      </button>

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
function TabCustomers({ brand, lang, tiers: initTiers, customers }) {
  const [tiers, setTiers] = useState(initTiers)
  const [editingTier, setEditingTier] = useState(null)
  const [filterTier, setFilterTier] = useState('all')
  const [sort, setSort] = useState({ key: 'total_spent', dir: -1 })
  const [profilePanel, setProfilePanel] = useState(null)
  const [msgTarget, setMsgTarget] = useState(null)

  /* ── sorted + filtered customers ── */
  const displayed = useMemo(() => {
    let list = filterTier === 'all' ? customers : customers.filter(c => String(c.tier_level) === filterTier)
    return [...list].sort((a, b) => {
      const av = a[sort.key] ?? -1, bv = b[sort.key] ?? -1
      return sort.dir * (av < bv ? -1 : av > bv ? 1 : 0)
    })
  }, [customers, filterTier, sort])

  /* ── tier analytics ── */
  const tierCounts = useMemo(() =>
    tiers.map(t => ({
      name: t.name,
      value: customers.filter(c => c.tier_level === t.level).length,
      color: `#${t.color}`,
    })), [tiers, customers])

  const tierAvgSpend = useMemo(() =>
    tiers.map(t => ({
      name: t.name,
      avg: (() => {
        const group = customers.filter(c => c.tier_level === t.level && c.total_spent)
        return group.length ? Math.round(group.reduce((s, c) => s + (c.total_spent || 0), 0) / group.length) : 0
      })(),
      color: `#${t.color}`,
    })), [tiers, customers])

  function toggleSort(key) {
    setSort(prev => prev.key === key ? { key, dir: -prev.dir } : { key, dir: -1 })
  }

  function SortIcon({ col }) {
    if (sort.key !== col) return <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 4 }}>⇅</span>
    return <span style={{ color: C.accent, marginLeft: 4 }}>{sort.dir === -1 ? '↓' : '↑'}</span>
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Customers</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
        {customers.length} {lang.community.toLowerCase()} across {tiers.length} tiers
      </p>

      {/* ── SECTION A: TIER CARDS ── */}
      <SectionHead label="A" title="Tier Configuration" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 40 }}>
        {tiers.map(tier => {
          const count = customers.filter(c => c.tier_level === tier.level).length
          const perks = Array.isArray(tier.perks) ? tier.perks : (tier.perks || '').split('\n').filter(Boolean)
          return (
            <div key={tier.id} style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 18px', position: 'relative' }}>
              {/* Color band */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: '16px 16px 0 0', backgroundColor: `#${tier.color}` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: `#${tier.color}`, flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 16 }}>{tier.name}</span>
                {tier.has_backstage_access && <span style={{ fontSize: 10, backgroundColor: 'rgba(255,183,3,0.15)', color: C.gold, border: `1px solid rgba(255,183,3,0.3)`, borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>🎭 BACKSTAGE</span>}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: `#${tier.color}`, marginBottom: 4 }}>{count}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{lang.community.toLowerCase()}</div>

              {/* Thresholds */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {tier.min_spend      > 0 && <ThresholdRow label="Min spend"     val={`₹${tier.min_spend.toLocaleString('en-IN')}`} />}
                {tier.min_purchases  > 0 && <ThresholdRow label="Min purchases" val={tier.min_purchases} />}
                {tier.min_score      > 0 && <ThresholdRow label="Min score"     val={tier.min_score} />}
                {tier.min_stories    > 0 && <ThresholdRow label="Min stories"   val={tier.min_stories} />}
                {tier.min_actions    > 0 && <ThresholdRow label="Min actions"   val={tier.min_actions} />}
                {[tier.min_spend, tier.min_purchases, tier.min_score, tier.min_stories, tier.min_actions].every(v => !v) &&
                  <span style={{ fontSize: 12, color: C.muted }}>No thresholds — open to all</span>}
              </div>

              {perks.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {perks.slice(0, 3).map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.muted, display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ color: `#${tier.color}`, flexShrink: 0 }}>✓</span>{p}
                    </div>
                  ))}
                  {perks.length > 3 && <div style={{ fontSize: 11, color: C.muted }}>+{perks.length - 3} more</div>}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: C.muted, marginBottom: 14 }}>
                <span style={{ fontWeight: 700, color: C.cream }}>{tier.qualify_logic === 'all' ? 'ALL' : 'ANY'}</span>
                <span>threshold required</span>
              </div>

              <button onClick={() => setEditingTier({ ...tier, perks: perks.join('\n') })}
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, color: C.cream, borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Edit Tier
              </button>
            </div>
          )
        })}
      </div>

      {/* ── SECTION B: COLLECTOR TABLE ── */}
      <SectionHead label="B" title="Collector List" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <FilterPill label="All" active={filterTier === 'all'} onClick={() => setFilterTier('all')} />
        {tiers.map(t => (
          <FilterPill key={t.id} label={t.name} active={filterTier === String(t.level)} onClick={() => setFilterTier(String(t.level))} color={`#${t.color}`} />
        ))}
      </div>

      {displayed.length === 0
        ? <EmptyState icon="👥" title="No customers yet" desc="Your community will appear here once people join" />
        : (
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    { key: 'username',        label: 'Username' },
                    { key: 'tier_level',      label: 'Tier' },
                    { key: 'total_spent',     label: 'Total Spend' },
                    { key: 'total_purchases', label: 'Purchases' },
                    { key: 'collector_score', label: 'Score' },
                    { key: 'stories_written', label: 'Stories' },
                    { key: 'last_active',     label: 'Last Active' },
                    { key: null,              label: 'Actions' },
                  ].map(col => (
                    <th key={col.label}
                      onClick={col.key ? () => toggleSort(col.key) : undefined}
                      style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: col.key ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {col.label}{col.key && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((c, i) => {
                  const prof = c.profiles
                  const tier = tiers.find(t => t.level === c.tier_level)
                  return (
                    <tr key={c.id || i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                            {prof?.avatar_url ? <img src={prof.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (prof?.display_name?.[0] || '?')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: C.cream }}>{prof?.display_name || '—'}</div>
                            {prof?.username && <div style={{ color: C.muted, fontSize: 11 }}>@{prof.username}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        {tier && <TierBadge tier={tier} />}
                      </td>
                      <td style={{ padding: '12px 12px', fontWeight: 600 }}>
                        {c.total_spent != null ? `₹${Number(c.total_spent).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: C.muted }}>{c.total_purchases ?? '—'}</td>
                      <td style={{ padding: '12px 12px', color: C.muted }}>{c.collector_score ?? '—'}</td>
                      <td style={{ padding: '12px 12px', color: C.muted }}>{c.stories_written ?? '—'}</td>
                      <td style={{ padding: '12px 12px', color: C.muted, fontSize: 12 }}>
                        {c.last_active ? new Date(c.last_active).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <ActionBtn onClick={() => setProfilePanel(c)}>View</ActionBtn>
                          <ActionBtn onClick={() => setMsgTarget(c)} accent>Message</ActionBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {/* ── SECTION C: ANALYTICS ── */}
      <SectionHead label="C" title="Tier Analytics" />
      {customers.length === 0
        ? <EmptyState icon="📊" title="No data yet" desc="Analytics will appear once you have customers" />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Donut chart */}
            <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Collectors per Tier</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={tierCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {tierCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
                {tierCounts.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.color }} />
                    <span style={{ color: C.muted }}>{t.name}</span>
                    <span style={{ fontWeight: 700, color: C.cream }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Avg. Spend per Tier (₹)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tierAvgSpend} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip
                    contentStyle={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                    formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Avg spend']}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {tierAvgSpend.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Upgrade metric */}
            <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>This Month</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
                {customers.filter(c => {
                  const ua = c.tier_upgraded_at
                  if (!ua) return false
                  const d = new Date(ua)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </div>
              <div style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>collectors upgraded tier</div>
              <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.cream }}>{customers.length}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>total {lang.community.toLowerCase()}</div>
              </div>
            </div>
          </div>
        )
      }

      {/* ── SECTION D: SMART CONTACT QUEUE ── */}
      <SmartContactQueueSection brand={brand} lang={lang} tiers={tiers} customers={customers} />

      {/* ── SECTION E: CONTACT LOG ── */}
      <ContactLogSection brand={brand} lang={lang} />

      {/* ── EDIT TIER MODAL ── */}
      {editingTier && (
        <TierEditModal
          tier={editingTier}
          onClose={() => setEditingTier(null)}
          onSave={updated => setTiers(prev => prev.map(t => t.id === updated.id ? updated : t))}
        />
      )}

      {/* ── PROFILE SIDE PANEL ── */}
      {profilePanel && (
        <ProfileSidePanel customer={profilePanel} tiers={tiers} lang={lang} onClose={() => setProfilePanel(null)} />
      )}

      {/* ── MESSAGE COMPOSER ── */}
      {msgTarget && (
        <MessageComposer customer={msgTarget} brand={brand} onClose={() => setMsgTarget(null)} />
      )}
    </div>
  )
}

/* ── Tier threshold row ── */
function ThresholdRow({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ fontWeight: 600, color: C.cream }}>{val}</span>
    </div>
  )
}

/* ── Tier badge ── */
function TierBadge({ tier }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: 20, backgroundColor: tierBg(tier.color), border: `1px solid #${tier.color}40`, fontSize: 11, fontWeight: 700, color: `#${tier.color}`, whiteSpace: 'nowrap' }}>
      {tier.name}
    </span>
  )
}

/* ── Small action button ── */
function ActionBtn({ children, onClick, accent }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: accent ? 'none' : `1px solid ${C.border}`, backgroundColor: accent ? C.accent : 'transparent', color: accent ? C.cream : C.muted }}>
      {children}
    </button>
  )
}

/* ── Section heading A/B/C ── */
function SectionHead({ label, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: C.cream, flexShrink: 0 }}>{label}</div>
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </div>
  )
}

/* ── TIER EDIT MODAL ── */
function TierEditModal({ tier, onClose, onSave }) {
  const [form, setForm] = useState({
    name:             tier.name || '',
    color:            `#${tier.color || '888888'}`,
    perks:            Array.isArray(tier.perks) ? tier.perks.join('\n') : (tier.perks || ''),
    min_spend:        tier.min_spend || '',
    min_purchases:    tier.min_purchases || '',
    min_score:        tier.min_score || '',
    min_stories:      tier.min_stories || '',
    min_actions:      tier.min_actions || '',
    qualify_logic:    tier.qualify_logic || 'any',
    has_backstage:    tier.has_backstage_access || false,
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    const hex = form.color.replace('#', '')
    const payload = {
      name: form.name,
      color: hex,
      perks: form.perks.split('\n').map(s => s.trim()).filter(Boolean),
      min_spend:     form.min_spend     ? Number(form.min_spend)     : null,
      min_purchases: form.min_purchases ? Number(form.min_purchases) : null,
      min_score:     form.min_score     ? Number(form.min_score)     : null,
      min_stories:   form.min_stories   ? Number(form.min_stories)   : null,
      min_actions:   form.min_actions   ? Number(form.min_actions)   : null,
      qualify_logic: form.qualify_logic,
      has_backstage_access: form.has_backstage,
    }
    const { error } = await supabase.from('customer_tiers').update(payload).eq('id', tier.id)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Tier updated!')
    onSave({ ...tier, ...payload })
    onClose()
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Edit Tier — {tier.name}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name + Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'end' }}>
            <div>
              <MLabel>Tier Name</MLabel>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={IS} />
            </div>
            <div>
              <MLabel>Badge Color</MLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                  style={{ width: 48, height: 40, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }} />
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: form.color, border: `1px solid ${C.border}` }} />
              </div>
            </div>
          </div>

          {/* Perks */}
          <div>
            <MLabel>Perks (one per line)</MLabel>
            <textarea value={form.perks} onChange={e => set('perks', e.target.value)}
              rows={4} placeholder={"Early access to drops\nExclusive Discord role\nFree shipping"}
              style={{ ...IS, resize: 'vertical', lineHeight: 1.6, fontSize: 13 }} />
          </div>

          {/* Thresholds grid */}
          <div>
            <MLabel>Qualification Thresholds</MLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'min_spend',     label: 'Min total spend (₹)' },
                { key: 'min_purchases', label: 'Min purchases' },
                { key: 'min_score',     label: 'Min Rebl Collector Score' },
                { key: 'min_stories',   label: 'Min stories written' },
                { key: 'min_actions',   label: 'Min community actions' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5 }}>{f.label}</div>
                  <input type="number" min={0} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder="0" style={{ ...IS, fontSize: 13 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Logic toggle */}
          <div>
            <MLabel>Qualification Logic</MLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {['any', 'all'].map(v => (
                <button key={v} onClick={() => set('qualify_logic', v)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, border: `1px solid ${form.qualify_logic === v ? C.accent : C.border}`, backgroundColor: form.qualify_logic === v ? 'rgba(230,57,70,0.12)' : 'transparent', color: form.qualify_logic === v ? C.accent : C.muted, transition: 'all 0.15s' }}>
                  {v === 'any' ? 'ANY one threshold' : 'ALL thresholds'}
                </button>
              ))}
            </div>
          </div>

          {/* Backstage toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'rgba(255,183,3,0.06)', borderRadius: 10, border: `1px solid rgba(255,183,3,0.15)` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>🎭 Backstage Access</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Can view exclusive brand posts</div>
            </div>
            <Toggle on={form.has_backstage} onChange={v => set('has_backstage', v)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Tier'}
            </button>
            <button onClick={onClose}
              style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PROFILE SIDE PANEL ── */
function ProfileSidePanel({ customer, tiers, lang, onClose }) {
  const prof = customer.profiles
  const tier = tiers.find(t => t.level === customer.tier_level)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 360, backgroundColor: C.card, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, animation: 'slideIn 0.25s ease' }}>
        <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Collector Profile</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
            {prof?.avatar_url ? <img src={prof.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (prof?.display_name?.[0] || '?')}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{prof?.display_name || 'Anonymous'}</div>
            {prof?.username && <div style={{ color: C.muted, fontSize: 13 }}>@{prof.username}</div>}
          </div>
        </div>

        {tier && <TierBadge tier={tier} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Total Spend',  val: customer.total_spent != null ? `₹${Number(customer.total_spent).toLocaleString('en-IN')}` : '—' },
            { label: 'Purchases',    val: customer.total_purchases ?? '—' },
            { label: 'Score',        val: customer.collector_score ?? '—' },
            { label: 'Stories',      val: customer.stories_written ?? '—' },
          ].map((m, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{m.val}</div>
            </div>
          ))}
        </div>

        {prof?.username && (
          <a href={`/profile/${prof.username}`} target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, color: C.cream, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}` }}>
            View Public Profile ↗
          </a>
        )}
      </div>
    </div>
  )
}

/* ── MESSAGE COMPOSER ── */
function MessageComposer({ customer, brand, onClose }) {
  const prof = customer.profiles
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!msg.trim()) return
    setSending(true)
    try {
      const { error } = await supabase.from('brand_messages').insert({
        brand_id: brand.id,
        recipient_id: customer.profile_id || customer.id,
        message: msg.trim(),
      })
      if (error) throw error
      toast.success('Message sent!')
      onClose()
    } catch (err) { toast.error(err.message) }
    finally { setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 460, width: '100%', padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Message {prof?.display_name || 'Collector'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.muted }}>
          From: <span style={{ color: C.cream, fontWeight: 600 }}>{brand.name}</span>
          {prof?.username && <> → <span style={{ color: C.cream }}>@{prof.username}</span></>}
        </div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5}
          placeholder="Write your message to this collector…"
          style={{ ...IS, resize: 'none', lineHeight: 1.65, marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSend} disabled={sending || !msg.trim()}
            style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: (sending || !msg.trim()) ? 0.6 : 1 }}>
            {sending ? 'Sending…' : 'Send Message'}
          </button>
          <button onClick={onClose} style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SMART CONTACT QUEUE — Section D
══════════════════════════════════════════ */
const TRIGGER_META = {
  story_not_written:    { dot: '🟡', color: '#FFB703', bg: 'rgba(255,183,3,0.12)',   label: 'Story Not Written',    subject: 'Your piece deserves a story.' },
  community_not_joined: { dot: '🔴', color: C.accent,  bg: 'rgba(230,57,70,0.12)',   label: 'Community Not Joined', subject: 'Your community is waiting for you.' },
  drop_anniversary:     { dot: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Drop Anniversary',     subject: 'One year ago today.' },
  tier_upgrade:         { dot: '🔵', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  label: 'Tier Upgraded',        subject: "You've moved up." },
  manual:               { dot: '⚪', color: C.muted,   bg: 'rgba(255,255,255,0.07)', label: 'Manual',               subject: '' },
}

function computeTriggers(customers) {
  const now = new Date()
  const results = []
  for (const c of customers) {
    const purchaseDate = c.first_purchase_at ? new Date(c.first_purchase_at) : null
    const daysSince = purchaseDate ? Math.floor((now - purchaseDate) / 86400000) : null
    if (c.story_completed === false && daysSince !== null && daysSince >= 7)
      results.push({ customer: c, type: 'story_not_written', daysSince })
    if (c.community_joined === false && daysSince !== null && daysSince >= 14)
      results.push({ customer: c, type: 'community_not_joined', daysSince })
    if (purchaseDate) {
      const anniv = new Date(purchaseDate); anniv.setFullYear(now.getFullYear())
      if (Math.abs(Math.floor((now - anniv) / 86400000)) <= 2)
        results.push({ customer: c, type: 'drop_anniversary', purchaseDate })
    }
    if (c.tier_upgraded_at) {
      const d = Math.floor((now - new Date(c.tier_upgraded_at)) / 86400000)
      if (d >= 0 && d <= 7) results.push({ customer: c, type: 'tier_upgrade' })
    }
  }
  return results
}

async function generateContactMsg(triggerType, customer, brand, tiers) {
  const prof = customer.profiles
  const tier = tiers.find(t => t.level === customer.tier_level)
  const ctx = {
    story_not_written:    "The collector bought 7+ days ago but hasn't written their provenance story yet",
    community_not_joined: "The collector bought but hasn't joined the brand community",
    drop_anniversary:     "It's exactly 1 year since the collector's first purchase from this brand",
    tier_upgrade:         "The collector just moved up to a new membership tier",
  }
  const prompt = `Write a 2-3 sentence personal message from brand "${brand.name}" (${brand.description || ''}) to a collector.
Trigger: ${ctx[triggerType] || 'General outreach'}
Collector: ${prof?.display_name || 'Collector'}${tier ? `, ${tier.name} member` : ''}
Voice: Direct, warm, editorial. No emojis. No generic greetings. Start mid-thought.
Return ONLY the message body.`
  return await callGeminiAPI(prompt, 'You write personal, editorial messages from collector brands to their customers.')
}

function SmartContactQueueSection({ brand, lang, tiers, customers }) {
  const triggers = useMemo(() => computeTriggers(customers), [customers])
  const [contactedThisMonth, setContactedThisMonth] = useState(new Set())
  const [composerRow, setComposerRow] = useState(null) // { trigger, prefillMsg, subject }
  const [bulkConfirm, setBulkConfirm] = useState(null) // { type, rows }
  const [bulkSending, setBulkSending] = useState(false)

  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    supabase.from('brand_messages')
      .select('recipient_id, created_at')
      .eq('brand_id', brand.id)
      .gte('created_at', monthStart)
      .then(({ data }) => {
        if (!data) return
        const counts = {}
        data.forEach(m => { counts[m.recipient_id] = (counts[m.recipient_id] || 0) + 1 })
        const blocked = new Set(Object.entries(counts).filter(([, n]) => n >= 2).map(([id]) => id))
        setContactedThisMonth(blocked)
      })
  }, [brand.id])

  const eligible = triggers.filter(tr => {
    const rid = tr.customer.profile_id || tr.customer.id
    return !contactedThisMonth.has(rid)
  })

  const storyRows  = eligible.filter(t => t.type === 'story_not_written')
  const anniversaryRows = eligible.filter(t => t.type === 'drop_anniversary')

  async function handleBulkSend(rows) {
    setBulkSending(true)
    const meta = TRIGGER_META[rows[0]?.type] || TRIGGER_META.manual
    let sent = 0
    for (const tr of rows) {
      const prof = tr.customer.profiles
      const recipientId = tr.customer.profile_id || tr.customer.id
      try {
        await supabase.from('brand_messages').insert({
          brand_id: brand.id,
          recipient_id: recipientId,
          subject: meta.subject,
          message: `Hi ${prof?.display_name || 'Collector'}, ${meta.subject}`,
          trigger_type: tr.type,
        })
        sent++
      } catch {}
    }
    setBulkSending(false)
    setBulkConfirm(null)
    toast.success(`Sent ${sent} message${sent !== 1 ? 's' : ''}`)
  }

  async function openComposer(trigger) {
    const subject = TRIGGER_META[trigger.type]?.subject || ''
    setComposerRow({ trigger, subject, prefillMsg: '', generating: true })
    try {
      const msg = await generateContactMsg(trigger.type, trigger.customer, brand, tiers)
      setComposerRow(prev => prev ? { ...prev, prefillMsg: msg, generating: false } : null)
    } catch {
      setComposerRow(prev => prev ? { ...prev, generating: false } : null)
    }
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: C.cream, flexShrink: 0 }}>D</div>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Smart Contact Queue</h2>
          {eligible.length > 0 && (
            <span style={{ backgroundColor: C.accent, color: C.cream, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 800 }}>{eligible.length}</span>
          )}
          <div style={{ flex: 1, height: 1, backgroundColor: C.border, minWidth: 20 }} />
        </div>

        {/* Bulk action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {storyRows.length > 0 && (
            <button onClick={() => setBulkConfirm({ type: 'story_not_written', rows: storyRows })}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid rgba(255,183,3,0.35)`, backgroundColor: 'rgba(255,183,3,0.08)', color: '#FFB703' }}>
              🟡 Send All Story Nudges ({storyRows.length})
            </button>
          )}
          {anniversaryRows.length > 0 && (
            <button onClick={() => setBulkConfirm({ type: 'drop_anniversary', rows: anniversaryRows })}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid rgba(34,197,94,0.35)`, backgroundColor: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
              🟢 Send All Anniversaries ({anniversaryRows.length})
            </button>
          )}
        </div>
      </div>

      {eligible.length === 0
        ? (
          <div style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Queue is clear</div>
              <div style={{ color: C.muted, fontSize: 13 }}>No contact opportunities right now — Rebl will surface them automatically</div>
            </div>
          </div>
        )
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr', gap: '0 12px', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              <span>Collector</span><span>Item / Trigger</span><span>Suggested Message</span><span></span>
            </div>
            {eligible.map((tr, i) => (
              <SmartContactRow
                key={`${tr.customer.id}-${tr.type}-${i}`}
                trigger={tr} brand={brand} tiers={tiers}
                onSend={() => openComposer(tr)}
              />
            ))}
          </div>
        )
      }

      {/* Rate-limit note */}
      <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
        ⚑ Max 2 messages per collector per month — {contactedThisMonth.size} collectors capped this month
      </div>

      {/* ── BULK CONFIRM ── */}
      {bulkConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setBulkConfirm(null)}>
          <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 440, width: '100%', padding: '28px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
              {TRIGGER_META[bulkConfirm.type]?.dot} Send to {bulkConfirm.rows.length} collectors?
            </div>
            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              A pre-filled message will be sent to all {bulkConfirm.rows.length} collectors matching this trigger.
              Subject: <em style={{ color: C.cream }}>{TRIGGER_META[bulkConfirm.type]?.subject}</em>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, maxHeight: 160, overflowY: 'auto' }}>
              {bulkConfirm.rows.map((tr, i) => {
                const prof = tr.customer.profiles
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {prof?.display_name?.[0] || '?'}
                    </div>
                    <span>{prof?.display_name || 'Anonymous'}</span>
                    {prof?.username && <span style={{ color: C.muted }}>@{prof.username}</span>}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleBulkSend(bulkConfirm.rows)} disabled={bulkSending}
                style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', opacity: bulkSending ? 0.7 : 1 }}>
                {bulkSending ? `Sending…` : `Send ${bulkConfirm.rows.length} Messages`}
              </button>
              <button onClick={() => setBulkConfirm(null)}
                style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL AI COMPOSER ── */}
      {composerRow && (
        <SmartComposerModal
          trigger={composerRow.trigger}
          prefillMsg={composerRow.prefillMsg}
          subject={composerRow.subject}
          generating={composerRow.generating}
          brand={brand}
          onClose={() => setComposerRow(null)}
          onSent={() => {
            setComposerRow(null)
            setContactedThisMonth(prev => {
              const next = new Set(prev)
              next.add(composerRow.trigger.customer.profile_id || composerRow.trigger.customer.id)
              return next
            })
          }}
        />
      )}
    </div>
  )
}

/* ── Smart Contact Row ── */
function SmartContactRow({ trigger, tiers, onSend }) {
  const { customer, type } = trigger
  const prof = customer.profiles
  const tier = tiers.find(t => t.level === customer.tier_level)
  const meta = TRIGGER_META[type] || TRIGGER_META.manual

  const snippets = {
    story_not_written:    `Bought ${trigger.daysSince}d ago — story not written`,
    community_not_joined: `Joined ${trigger.daysSince}d ago — never entered community`,
    drop_anniversary:     `1 year since first purchase 🎉`,
    tier_upgrade:         `Moved to ${tier?.name || 'new tier'} recently`,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr', gap: '0 12px', alignItems: 'center', padding: '12px 16px', backgroundColor: C.card, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 4, transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
          {prof?.avatar_url ? <img src={prof.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (prof?.display_name?.[0] || '?')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof?.display_name || 'Anonymous'}</div>
          {tier && <div style={{ fontSize: 11, color: `#${tier.color}`, fontWeight: 600 }}>{tier.name}</div>}
        </div>
      </div>

      {/* Trigger chip */}
      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, backgroundColor: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {meta.dot} {meta.label}
        </span>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.3 }}>{snippets[type] || ''}</div>
      </div>

      {/* Suggested message preview */}
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        "{TRIGGER_META[type]?.subject}"
      </div>

      {/* Send button */}
      <div>
        <button onClick={onSend}
          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: C.accent, color: C.cream, width: '100%', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Send ✉
        </button>
      </div>
    </div>
  )
}

/* ── Smart Composer Modal (AI pre-filled) ── */
function SmartComposerModal({ trigger, prefillMsg, subject: initSubject, generating, brand, onClose, onSent }) {
  const prof = trigger.customer.profiles
  const [subject, setSubject] = useState(initSubject)
  const [msg, setMsg] = useState(prefillMsg)
  const [sending, setSending] = useState(false)

  // Update msg when AI finishes generating
  useEffect(() => { if (!generating) setMsg(prefillMsg) }, [generating, prefillMsg])

  const meta = TRIGGER_META[trigger.type] || TRIGGER_META.manual

  async function handleSend() {
    if (!msg.trim()) return
    setSending(true)
    try {
      const { error } = await supabase.from('brand_messages').insert({
        brand_id: brand.id,
        recipient_id: trigger.customer.profile_id || trigger.customer.id,
        subject: subject,
        message: msg.trim(),
        trigger_type: trigger.type,
      })
      if (error) throw error
      toast.success('Message sent!')
      onSent()
    } catch (err) { toast.error(err.message) }
    finally { setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 500, width: '100%', padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ padding: '3px 9px', borderRadius: 20, backgroundColor: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                {meta.dot} {meta.label}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              Message {prof?.display_name || 'Collector'}
            </div>
            {prof?.username && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>@{prof.username}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Subject</div>
          <input value={subject} onChange={e => setSubject(e.target.value)} style={IS} />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Message</div>
            {generating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.accent }}>
                <Spinner size={12} /> Generating with AI…
              </div>
            )}
          </div>
          <textarea
            value={generating ? '' : msg}
            onChange={e => setMsg(e.target.value)}
            rows={5}
            placeholder={generating ? 'Rebl AI is writing this for you…' : 'Message body'}
            disabled={generating}
            style={{ ...IS, resize: 'none', lineHeight: 1.65, opacity: generating ? 0.5 : 1 }}
          />
          {generating && (
            <div style={{ position: 'absolute', inset: '28px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>Writing in your brand's voice…</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSend} disabled={sending || generating || !msg.trim()}
            style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: (sending || generating || !msg.trim()) ? 0.6 : 1 }}>
            {sending ? 'Sending…' : '✉ Send Message'}
          </button>
          <button onClick={onClose}
            style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   CONTACT LOG — Section E
══════════════════════════════════════════ */
function ContactLogSection({ brand }) {
  const [log, setLog] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('brand_messages')
      .select('*, profiles!recipient_id(display_name, username, avatar_url)')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { setLog(data || []); setLoaded(true) })
  }, [brand.id])

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionHead label="E" title="Contact Log" />
      {!loaded
        ? <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
        : log.length === 0
          ? <EmptyState icon="📋" title="No messages sent yet" desc="Contact history will appear here" />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Collector', 'Trigger', 'Message', 'Opened', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.map((m, i) => {
                    const prof = m.profiles
                    const trigMeta = TRIGGER_META[m.trigger_type] || TRIGGER_META.manual
                    return (
                      <tr key={m.id || i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '11px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, overflow: 'hidden' }}>
                              {prof?.avatar_url ? <img src={prof.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (prof?.display_name?.[0] || '?')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{prof?.display_name || '—'}</div>
                              {prof?.username && <div style={{ fontSize: 11, color: C.muted }}>@{prof.username}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 20, backgroundColor: trigMeta.bg, color: trigMeta.color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {trigMeta.dot} {trigMeta.label}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', color: C.muted, fontSize: 12, maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.subject && <span style={{ color: C.cream, fontWeight: 600 }}>{m.subject} — </span>}
                            {m.message}
                          </div>
                        </td>
                        <td style={{ padding: '11px 12px' }}>
                          {m.opened_at
                            ? <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>✓ Opened</span>
                            : <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '11px 12px', color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  )
}

/* ── Toggle switch ── */
function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: on ? C.accent : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: C.cream, transition: 'left 0.2s' }} />
    </div>
  )
}

/* ── Modal label ── */
function MLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>{children}</div>
}

/* ══════════════════════════════════════════
   TAB: CAMPAIGNS
══════════════════════════════════════════ */
const CAMP_TEMPLATES = [
  { id: 'drop_announcement', icon: '⚡', label: 'Drop Announcement',  desc: 'Announce your next drop to all collectors',     type: 'drop_alert',    defaultTiers: ['all'],              subject: 'Something big is dropping. This is your heads up.',    body: 'We\'ve been working on something you won\'t want to miss. Our next drop is almost here — and it\'s exactly what you\'ve been waiting for.\n\nStay close. Details dropping soon.' },
  { id: 'early_access',      icon: '🔑', label: 'Early Access Invite', desc: 'Exclusive first look for top-tier collectors',   type: 'early_access',  defaultTiers: ['insider','legend'], subject: 'You\'re getting in first.',                              body: 'Because you\'ve been here from the start — you get access before anyone else.\n\nThis is your 24-hour early window. Don\'t miss it.' },
  { id: 'backstage_invite',  icon: '🎭', label: 'Backstage Invite',    desc: 'Private access for your Legend tier',            type: 'announcement',  defaultTiers: ['legend'],           subject: 'Backstage is open. Just for you.',                      body: 'Legends only. You\'ve earned your place here.\n\nHead to the Backstage section to see what we\'ve been building behind the scenes.' },
  { id: 'story_nudge',       icon: '✍️', label: 'Story Nudge',         desc: 'Buyers who haven\'t written their story yet',    type: 'announcement',  defaultTiers: ['all'],              subject: 'Your piece deserves a story.',                          body: 'You own one of ours. But your story with it hasn\'t been written yet.\n\nHead to your collection and tell us what it means to you. It takes 2 minutes — and it lives on your profile forever.' },
  { id: 'loyalty_reward',    icon: '🎁', label: 'Loyalty Reward',      desc: 'Reward a specific tier',                         type: 'reward',        defaultTiers: ['all'],              subject: 'A gift from us, for being you.',                        body: 'We don\'t take loyalty for granted.\n\nAs a thank you for being part of this community, we\'ve got something for you. Check your Rebl account for your reward.' },
  { id: 're_engagement',     icon: '🔄', label: 'Re-engagement',       desc: 'Collectors inactive 60+ days',                  type: 'announcement',  defaultTiers: ['all'],              subject: 'It\'s been a while. We\'ve been busy.',                 body: 'We noticed you\'ve been away. A lot has happened here.\n\nCome back and see what\'s new. There\'s a drop coming up you might actually care about.' },
  { id: 'custom',            icon: '✏️', label: 'Custom Message',       desc: 'Blank canvas — write your own',                 type: 'announcement',  defaultTiers: ['all'],              subject: '',                                                      body: '' },
]

const TYPE_META = {
  drop_alert:   { label: '⚡ Drop Alert',    color: C.accent,  bg: 'rgba(230,57,70,0.12)' },
  early_access: { label: '🔑 Early Access',  color: C.gold,    bg: 'rgba(255,183,3,0.12)' },
  announcement: { label: '📣 Announcement',  color: C.muted,   bg: 'rgba(141,153,174,0.1)' },
  reward:       { label: '🎁 Reward',        color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
}

function TabCampaigns({ brand, lang, tiers, customers }) {
  const [campaigns, setCampaigns] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [composer, setComposer] = useState(null) // null = list view, template obj = composer

  useEffect(() => {
    supabase.from('campaigns').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data || []); setLoaded(true) })
  }, [])

  function openComposer(template) {
    setComposer({
      templateId:    template.id,
      name:          '',
      subject:       template.subject,
      body:          template.body,
      type:          template.type,
      targetTiers:   template.defaultTiers,
      sendInApp:     true,
      sendEmail:     false,
      scheduleMode:  'now',
      scheduleAt:    '',
      preview:       false,
    })
  }

  function onSent(campaign) {
    setCampaigns(prev => [campaign, ...prev])
    setComposer(null)
    toast.success('Campaign sent!')
  }

  if (!loaded) return <FullLoader small />

  if (composer) {
    return (
      <CampaignComposer
        composer={composer} setComposer={setComposer}
        brand={brand} lang={lang} tiers={tiers} customers={customers}
        onBack={() => setComposer(null)} onSent={onSent}
      />
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Campaigns</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
        One-click templates — choose a type and we'll pre-fill the rest
      </p>

      {/* ── Template grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 44 }}>
        {CAMP_TEMPLATES.map(tmpl => (
          <button key={tmpl.id} onClick={() => openComposer(tmpl)}
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 18px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{tmpl.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.cream, marginBottom: 5 }}>{tmpl.label}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{tmpl.desc}</div>
            {tmpl.id !== 'custom' && (
              <div style={{ marginTop: 12, fontSize: 11, color: C.accent, fontWeight: 700 }}>
                {(TYPE_META[tmpl.type] || TYPE_META.announcement).label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── History ── */}
      <SectionHead label="H" title="Campaign History" />
      {campaigns.length === 0
        ? <EmptyState icon="📣" title="No campaigns sent yet" desc="Pick a template above to get started" />
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Name', 'Type', 'Sent To', 'Date', 'Open Rate', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => {
                  const meta = TYPE_META[c.type] || TYPE_META.announcement
                  return (
                    <tr key={c.id || i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 12px', fontWeight: 600, color: C.cream, maxWidth: 180 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || c.name || '—'}</div>
                        {c.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                      </td>
                      <td style={{ padding: '12px 12px', color: C.muted, fontSize: 12 }}>
                        {Array.isArray(c.tier_target) ? c.tier_target.join(', ') : (c.tier_target || 'All')}
                        {c.recipient_count > 0 && <span style={{ display: 'block', color: C.cream, fontWeight: 600 }}>{c.recipient_count} recipients</span>}
                      </td>
                      <td style={{ padding: '12px 12px', color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>
                        {c.sent_at
                          ? new Date(c.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : c.scheduled_at
                            ? <span style={{ color: C.gold }}>⏳ {new Date(c.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            : new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        {c.open_rate != null
                          ? <span style={{ fontWeight: 700, color: c.open_rate >= 0.3 ? '#22c55e' : C.muted }}>{Math.round(c.open_rate * 100)}%</span>
                          : <span style={{ color: C.muted }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <StatusBadge status={c.status || 'sent'} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}

/* ── CAMPAIGN COMPOSER ── */
function CampaignComposer({ composer, setComposer, brand, lang, tiers, customers, onBack, onSent }) {
  const [c, setC] = useState(composer)
  const [improving, setImproving] = useState(false)
  const [sending, setSending] = useState(false)
  const set = (k, v) => setC(prev => ({ ...prev, [k]: v }))

  const ALL_TIER_OPTIONS = [
    { value: 'all', label: `All ${lang.community}`, color: C.muted },
    ...tiers.map(t => ({ value: t.name.toLowerCase(), label: t.name, color: `#${t.color}` })),
  ]

  const recipientCount = useMemo(() => {
    if (c.targetTiers.includes('all')) return customers.length
    return customers.filter(cu => {
      const tierName = tiers.find(t => t.level === cu.tier_level)?.name?.toLowerCase()
      return c.targetTiers.includes(tierName)
    }).length
  }, [c.targetTiers, customers, tiers])

  function toggleTier(val) {
    if (val === 'all') { set('targetTiers', ['all']); return }
    const next = c.targetTiers.filter(t => t !== 'all')
    set('targetTiers', next.includes(val) ? next.filter(t => t !== val) : [...next, val])
  }

  async function improveWithAI() {
    if (!c.body.trim()) { toast.error('Write a message first'); return }
    setImproving(true)
    const primaryCat = brand.brand_categories?.find(x => x.is_primary)?.category || 'other'
    const targetLabel = c.targetTiers.includes('all') ? `all ${lang.community.toLowerCase()}` : c.targetTiers.join(' & ')
    const sys = `You write authentic campaign messages for collector brands. Never corporate. Never generic. Match the brand's editorial voice exactly.`
    const prompt = `Rewrite this campaign message for:
Brand: ${brand.name} (${primaryCat})
Brand description: ${brand.description || ''}
Target audience: ${targetLabel}
Campaign type: ${c.type}

Original message:
"${c.body}"

Rewrite it: same intent, same length, but in a sharper, more collector-grade editorial voice. No emojis. No bullet points. Just 2-3 tight paragraphs. Return ONLY the rewritten message, nothing else.`
    try {
      const improved = await callGeminiAPI(prompt, sys)
      set('body', improved.trim())
      toast.success('Message improved!')
    } catch { toast.error('AI improvement failed') }
    finally { setImproving(false) }
  }

  async function handleSend() {
    if (!c.name.trim()) { toast.error('Campaign name required'); return }
    if (!c.body.trim()) { toast.error('Message body required'); return }
    setSending(true)
    try {
      const payload = {
        brand_id: brand.id,
        name: c.name,
        title: c.name,
        subject: c.subject,
        message: c.body,
        type: c.type,
        tier_target: c.targetTiers,
        recipient_count: recipientCount,
        send_in_app: c.sendInApp,
        send_email: c.sendEmail,
        status: c.scheduleMode === 'now' ? 'sent' : 'scheduled',
        sent_at:      c.scheduleMode === 'now' ? new Date().toISOString() : null,
        scheduled_at: c.scheduleMode === 'schedule' ? c.scheduleAt : null,
      }
      const { data, error } = await supabase.from('campaigns').insert(payload).select().single()
      if (error) throw error
      onSent(data)
    } catch (err) { toast.error(err.message) }
    finally { setSending(false) }
  }

  if (c.preview) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => set('preview', false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>← Back to editor</button>
          <span style={{ color: C.muted }}>·</span>
          <span style={{ fontSize: 14, color: C.muted }}>Collector Preview</span>
        </div>
        <div style={{ maxWidth: 480 }}>
          <div style={{ backgroundColor: C.card, borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Email-style header */}
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              {brand.logo_url
                ? <img src={brand.logo_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>{brand.name[0]}</div>
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{brand.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>via Rebl</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <TypePill type={c.type} />
              </div>
            </div>
            <div style={{ padding: '24px 24px 28px' }}>
              {c.subject && <h2 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.25, marginBottom: 18 }}>{c.subject}</h2>}
              <div style={{ fontSize: 15, lineHeight: 1.8, color: C.cream, whiteSpace: 'pre-wrap' }}>{c.body || <span style={{ color: C.muted, fontStyle: 'italic' }}>No message written yet</span>}</div>
              <div style={{ marginTop: 24, padding: '14px 18px', backgroundColor: 'rgba(230,57,70,0.08)', border: `1px solid rgba(230,57,70,0.2)`, borderRadius: 10, fontSize: 13, color: C.muted }}>
                This message will be sent to <span style={{ color: C.cream, fontWeight: 700 }}>{recipientCount} {lang.community.toLowerCase()}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => set('preview', false)} style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Edit
            </button>
            <button onClick={handleSend} disabled={sending} style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending…' : c.scheduleMode === 'now' ? 'Send Now' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>← Templates</button>
        <span style={{ color: C.muted }}>·</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.cream }}>
          {CAMP_TEMPLATES.find(t => t.id === c.templateId)?.label || 'Campaign Composer'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Name */}
        <div>
          <CLabel>Campaign Name (internal)</CLabel>
          <input value={c.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Summer Drop — Early Access Wave 1" style={IS} />
        </div>

        {/* Target tiers */}
        <div>
          <CLabel>Target Audience</CLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {ALL_TIER_OPTIONS.map(opt => {
              const active = c.targetTiers.includes(opt.value)
              return (
                <button key={opt.value} onClick={() => toggleTier(opt.value)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? opt.color : 'rgba(255,255,255,0.12)'}`, backgroundColor: active ? `${opt.color}20` : 'transparent', color: active ? opt.color : C.muted, fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {opt.label}
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            → <span style={{ color: C.cream, fontWeight: 700 }}>{recipientCount} {lang.community.toLowerCase()}</span> will receive this
          </div>
        </div>

        {/* Subject */}
        <div>
          <CLabel>Subject Line</CLabel>
          <input value={c.subject} onChange={e => set('subject', e.target.value)} placeholder="The hook that makes them open it" style={IS} />
        </div>

        {/* Body + AI */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <CLabel style={{ marginBottom: 0 }}>Message Body</CLabel>
            <button onClick={improveWithAI} disabled={improving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'transparent', color: improving ? C.muted : C.accent, border: `1px solid ${improving ? C.border : 'rgba(230,57,70,0.35)'}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: improving ? 'not-allowed' : 'pointer' }}>
              {improving ? <><Spinner size={12} /> Improving…</> : <>✦ Improve with AI</>}
            </button>
          </div>
          <textarea value={c.body} onChange={e => set('body', e.target.value)}
            rows={7} placeholder="Write your message to the community…"
            style={{ ...IS, resize: 'vertical', lineHeight: 1.7, fontSize: 14 }} />
        </div>

        {/* Send via */}
        <div>
          <CLabel>Send Via</CLabel>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { key: 'sendInApp', label: '📱 In-App' },
              { key: 'sendEmail', label: '✉️ Email' },
            ].map(ch => (
              <button key={ch.key} onClick={() => set(ch.key, !c[ch.key])}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${c[ch.key] ? C.accent : C.border}`, backgroundColor: c[ch.key] ? 'rgba(230,57,70,0.1)' : 'transparent', transition: 'all 0.15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: c[ch.key] ? C.accent : 'transparent', border: `2px solid ${c[ch.key] ? C.accent : 'rgba(255,255,255,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.cream, flexShrink: 0 }}>
                  {c[ch.key] && '✓'}
                </div>
                <span style={{ fontSize: 14, fontWeight: c[ch.key] ? 700 : 400, color: c[ch.key] ? C.cream : C.muted }}>{ch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <CLabel>Schedule</CLabel>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[['now', 'Send Now'], ['schedule', 'Schedule for later']].map(([val, label]) => (
              <button key={val} onClick={() => set('scheduleMode', val)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, border: `1px solid ${c.scheduleMode === val ? C.accent : C.border}`, backgroundColor: c.scheduleMode === val ? 'rgba(230,57,70,0.12)' : 'transparent', color: c.scheduleMode === val ? C.accent : C.muted, transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
          {c.scheduleMode === 'schedule' && (
            <input type="datetime-local" value={c.scheduleAt} onChange={e => set('scheduleAt', e.target.value)} style={IS} />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button onClick={() => set('preview', true)}
            style={{ flex: 1, backgroundColor: 'transparent', color: C.cream, border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10, padding: '13px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            👁 Preview
          </button>
          <button onClick={handleSend} disabled={sending}
            style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 14, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Sending…' : c.scheduleMode === 'now' ? '⚡ Send Now' : '⏰ Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Campaign label ── */
function CLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>{children}</div>
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = { sent: ['#22c55e', 'rgba(34,197,94,0.12)', 'Sent'], scheduled: [C.gold, 'rgba(255,183,3,0.12)', 'Scheduled'], draft: [C.muted, 'rgba(255,255,255,0.06)', 'Draft'], failed: [C.accent, 'rgba(230,57,70,0.12)', 'Failed'] }
  const [color, bg, label] = map[status] || map.draft
  return <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: bg, color, fontSize: 11, fontWeight: 700 }}>{label}</span>
}

/* ══════════════════════════════════════════
   TAB: BACKSTAGE
══════════════════════════════════════════ */
const BS_EVENT_TYPES = [
  { id: 'design_preview',  icon: '🎨', label: 'Design Preview',  desc: 'Show an unreleased design before the world sees it' },
  { id: 'founder_call',    icon: '📞', label: 'Founder Call',    desc: 'Small-group video call with the founder' },
  { id: 'factory_tour',    icon: '🏭', label: 'Factory Tour',    desc: 'Virtual or physical behind-the-scenes access' },
  { id: 'early_purchase',  icon: '⚡', label: 'Early Purchase',  desc: 'Buy 48 hrs before the public drop goes live' },
  { id: 'virtual_event',   icon: '🎙', label: 'Virtual Event',   desc: 'Live stream, panel, or Q&A session' },
  { id: 'custom',          icon: '✦',  label: 'Custom',          desc: 'Define your own exclusive experience' },
]

function TabBackstage({ brand, lang, tiers, drops }) {
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [createModal, setCreateModal] = useState(null) // null | { type }
  const [postModal, setPostModal] = useState(false)
  const [viewEvent, setViewEvent] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('backstage_events').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false }),
      supabase.from('backstage_posts').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false }),
    ]).then(([evRes, postRes]) => {
      setEvents(evRes.data || [])
      setPosts(postRes.data || [])
      setLoaded(false)
    }).finally(() => setLoaded(true))
  }, [])

  function onEventCreated(ev) {
    setEvents(prev => [ev, ...prev])
    setCreateModal(null)
    toast.success('Experience created!')
  }

  function onPostCreated(p) {
    setPosts(prev => [p, ...prev])
    setPostModal(false)
    toast.success('Post published!')
  }

  function sendInviteForEvent(ev) {
    toast.success('Backstage invite campaign opened in Campaigns tab')
  }

  if (!loaded) return <FullLoader small />

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Backstage</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
        Exclusive Experiences for Your Legends — only visible to collectors with Backstage access
      </p>

      {/* ── SECTION A: Event type cards ── */}
      <SectionHead label="A" title="Create an Experience" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginBottom: 44 }}>
        {BS_EVENT_TYPES.map(t => (
          <button key={t.id} onClick={() => setCreateModal({ typeId: t.id })}
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 18px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.cream, marginBottom: 5 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ── SECTION B: Active events table ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionHead label="B" title="Active Experiences" />
      </div>
      {events.length === 0
        ? <EmptyState icon="✨" title="No experiences yet" desc="Pick a type above to create your first backstage experience" style={{ marginBottom: 40 }} />
        : (
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Name', 'Type', 'Eligible Tiers', 'RSVPs', 'Date', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => {
                  const typeInfo = BS_EVENT_TYPES.find(t => t.id === ev.event_type) || BS_EVENT_TYPES[5]
                  const eligibleTiers = Array.isArray(ev.eligible_tier_ids)
                    ? ev.eligible_tier_ids.map(id => tiers.find(t => t.id === id)?.name).filter(Boolean)
                    : []
                  return (
                    <tr key={ev.id || i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '13px 12px' }}>
                        <div style={{ fontWeight: 600, color: C.cream }}>{ev.name}</div>
                        {ev.description && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</div>}
                      </td>
                      <td style={{ padding: '13px 12px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 6, backgroundColor: 'rgba(255,183,3,0.10)', color: C.gold, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {eligibleTiers.length > 0
                            ? eligibleTiers.map((name, j) => (
                              <span key={j} style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.07)', fontSize: 11, color: C.muted }}>{name}</span>
                            ))
                            : <span style={{ fontSize: 12, color: C.muted }}>All</span>
                          }
                        </div>
                      </td>
                      <td style={{ padding: '13px 12px', color: ev.rsvp_required ? C.cream : C.muted, fontWeight: ev.rsvp_count > 0 ? 700 : 400 }}>
                        {ev.rsvp_required ? (ev.rsvp_count ?? 0) : '—'}
                        {ev.max_attendees > 0 && <span style={{ color: C.muted, fontWeight: 400 }}>/{ev.max_attendees}</span>}
                      </td>
                      <td style={{ padding: '13px 12px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                        {ev.rolling_access
                          ? <span style={{ color: C.gold, fontWeight: 700 }}>∞ Rolling</span>
                          : ev.event_date
                            ? new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'
                        }
                      </td>
                      <td style={{ padding: '13px 12px' }}>
                        <BSEventStatusBadge event={ev} />
                      </td>
                      <td style={{ padding: '13px 12px' }}>
                        <button onClick={() => sendInviteForEvent(ev)}
                          style={{ padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid rgba(255,183,3,0.3)`, backgroundColor: 'rgba(255,183,3,0.08)', color: C.gold, whiteSpace: 'nowrap' }}>
                          🎭 Send Invite
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {/* ── SECTION C: Backstage posts ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionHead label="C" title="Backstage Posts" />
        <button onClick={() => setPostModal(true)}
          style={{ backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
          + New Post
        </button>
      </div>
      {posts.length === 0
        ? <EmptyState icon="📝" title="No posts yet" desc="Share behind-the-scenes updates only your top-tier collectors can see" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {posts.map((post, i) => {
              const tierName = tiers.find(t => t.id === post.eligible_tier_id)?.name
              return (
                <div key={post.id || i} style={{ backgroundColor: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{post.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {tierName && (
                        <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,183,3,0.12)', color: C.gold, fontSize: 11, fontWeight: 700 }}>
                          🔒 {tierName}+
                        </span>
                      )}
                      {!tierName && post.tier_required && (
                        <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,183,3,0.12)', color: C.gold, fontSize: 11, fontWeight: 700 }}>
                          🔒 {post.tier_required}+
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{post.content}</p>
                  <div style={{ fontSize: 12, color: 'rgba(141,153,174,0.4)', marginTop: 10 }}>
                    {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      {/* ── CREATE EVENT MODAL ── */}
      {createModal && (
        <BSCreateEventModal
          brand={brand} tiers={tiers} drops={drops}
          initialTypeId={createModal.typeId}
          onClose={() => setCreateModal(null)}
          onCreate={onEventCreated}
        />
      )}

      {/* ── CREATE POST MODAL ── */}
      {postModal && (
        <BSCreatePostModal
          brand={brand} tiers={tiers}
          onClose={() => setPostModal(false)}
          onCreate={onPostCreated}
        />
      )}
    </div>
  )
}

/* ── Backstage event status badge ── */
function BSEventStatusBadge({ event }) {
  let label = 'Active', color = '#22c55e', bg = 'rgba(34,197,94,0.12)'
  if (event.status === 'draft')    { label = 'Draft';    color = C.muted; bg = 'rgba(255,255,255,0.06)' }
  if (event.status === 'ended')    { label = 'Ended';    color = C.muted; bg = 'rgba(255,255,255,0.06)' }
  if (event.status === 'upcoming') { label = 'Upcoming'; color = C.gold;  bg = 'rgba(255,183,3,0.12)' }
  if (!event.status || event.status === 'active') {
    const now = new Date()
    if (event.event_date && new Date(event.event_date) > now) { label = 'Upcoming'; color = C.gold; bg = 'rgba(255,183,3,0.12)' }
    else if (event.rolling_access) { label = 'Live'; color = '#22c55e'; bg = 'rgba(34,197,94,0.12)' }
  }
  return <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: bg, color, fontSize: 11, fontWeight: 700 }}>{label}</span>
}

/* ── CREATE EVENT MODAL ── */
function BSCreateEventModal({ brand, tiers, drops, initialTypeId, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    event_type: initialTypeId,
    drop_id: '',
    description: '',
    eligible_tier_ids: tiers.filter(t => t.has_backstage_access).map(t => t.id),
    max_attendees: '',
    event_date: '',
    rolling_access: false,
    rsvp_required: false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function toggleTierId(id) {
    const ids = form.eligible_tier_ids
    set('eligible_tier_ids', ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Event name required'); return }
    setSaving(true)
    const payload = {
      brand_id: brand.id,
      name: form.name,
      event_type: form.event_type,
      drop_id: form.drop_id || null,
      description: form.description,
      eligible_tier_ids: form.eligible_tier_ids,
      max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
      event_date: form.rolling_access ? null : (form.event_date || null),
      rolling_access: form.rolling_access,
      rsvp_required: form.rsvp_required,
      status: 'active',
    }
    try {
      const { data, error } = await supabase.from('backstage_events').insert(payload).select().single()
      if (error) throw error
      onCreate(data)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const typeInfo = BS_EVENT_TYPES.find(t => t.id === form.event_type) || BS_EVENT_TYPES[5]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 540, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{typeInfo.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Create {typeInfo.label}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{typeInfo.desc}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div>
            <MLabel>Event Name *</MLabel>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={`e.g. Exclusive ${typeInfo.label} — Summer '25`} style={IS} />
          </div>

          {/* Type selector */}
          <div>
            <MLabel>Event Type</MLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {BS_EVENT_TYPES.map(t => (
                <button key={t.id} onClick={() => set('event_type', t.id)}
                  style={{ padding: '9px 8px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${form.event_type === t.id ? C.gold : C.border}`, backgroundColor: form.event_type === t.id ? 'rgba(255,183,3,0.1)' : 'transparent', fontSize: 12, fontWeight: form.event_type === t.id ? 700 : 400, color: form.event_type === t.id ? C.gold : C.muted, transition: 'all 0.15s' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connected drop */}
          {drops && drops.length > 0 && (
            <div>
              <MLabel>Connected Drop (optional)</MLabel>
              <select value={form.drop_id} onChange={e => set('drop_id', e.target.value)} style={{ ...IS, appearance: 'none' }}>
                <option value="">— None —</option>
                {drops.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <MLabel>Description</MLabel>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="What will they experience? Be specific — this is what excites them."
              style={{ ...IS, resize: 'vertical', lineHeight: 1.65, fontSize: 13 }} />
          </div>

          {/* Eligible tiers */}
          <div>
            <MLabel>Eligible Tiers</MLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tiers.map(t => {
                const active = form.eligible_tier_ids.includes(t.id)
                return (
                  <button key={t.id} onClick={() => toggleTierId(t.id)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? `#${t.color}` : 'rgba(255,255,255,0.12)'}`, backgroundColor: active ? `#${t.color}20` : 'transparent', color: active ? `#${t.color}` : C.muted, fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {t.name}
                    {t.has_backstage_access && ' 🎭'}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 7 }}>🎭 = tier has Backstage Access enabled</div>
          </div>

          {/* Rolling access toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>∞ Rolling Access</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Available on-demand, no fixed date</div>
            </div>
            <Toggle on={form.rolling_access} onChange={v => set('rolling_access', v)} />
          </div>

          {/* Max attendees + Date (shown when not rolling) */}
          {!form.rolling_access && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <MLabel>Max Attendees</MLabel>
                <input type="number" min={1} value={form.max_attendees} onChange={e => set('max_attendees', e.target.value)} placeholder="Unlimited" style={IS} />
              </div>
              <div>
                <MLabel>Event Date & Time</MLabel>
                <input type="datetime-local" value={form.event_date} onChange={e => set('event_date', e.target.value)} style={IS} />
              </div>
            </div>
          )}

          {/* RSVP toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>RSVP Required</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Collectors must confirm attendance</div>
            </div>
            <Toggle on={form.rsvp_required} onChange={v => set('rsvp_required', v)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, backgroundColor: C.gold, color: C.primary, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 800, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : `Create ${typeInfo.label}`}
            </button>
            <button onClick={onClose}
              style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── CREATE POST MODAL ── */
function BSCreatePostModal({ brand, tiers, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', content: '', eligible_tier_id: tiers[0]?.id || '', post_type: 'update' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return }
    setSaving(true)
    try {
      const { data, error } = await supabase.from('backstage_posts').insert({ brand_id: brand.id, ...form }).select().single()
      if (error) throw error
      onCreate(data)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: 500, width: '100%' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>📝 New Backstage Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <MLabel>Title *</MLabel>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Behind the scenes — Summer Drop" style={IS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <MLabel>Post Type</MLabel>
              <select value={form.post_type} onChange={e => set('post_type', e.target.value)} style={{ ...IS, appearance: 'none' }}>
                <option value="update">Behind the Scenes</option>
                <option value="early_access">Early Access</option>
                <option value="making_of">Making Of</option>
                <option value="exclusive">Exclusive Offer</option>
              </select>
            </div>
            <div>
              <MLabel>Visible to Tier</MLabel>
              <select value={form.eligible_tier_id} onChange={e => set('eligible_tier_id', e.target.value)} style={{ ...IS, appearance: 'none' }}>
                {tiers.map(t => <option key={t.id} value={t.id}>{t.name}+</option>)}
              </select>
            </div>
          </div>
          <div>
            <MLabel>Content *</MLabel>
            <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={5}
              placeholder="Share something exclusive…" style={{ ...IS, resize: 'vertical', lineHeight: 1.65 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, backgroundColor: C.accent, color: C.cream, border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Publishing…' : 'Publish Post'}
            </button>
            <button onClick={onClose}
              style={{ flex: 1, backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB: SETTINGS
══════════════════════════════════════════ */
function TabSettings({ brand, lang, setBrand }) {
  const [form, setForm] = useState({
    name:              brand.name              || '',
    description:       brand.description       || '',
    website:           brand.website           || '',
    hero_headline:     brand.hero_headline     || '',
    hero_subheadline:  brand.hero_subheadline  || '',
    custom_domain:     brand.custom_domain     || '',
    theme_primary:     brand.theme_primary     || '#0F0F1A',
    theme_accent:      brand.theme_accent      || '#E63946',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(brand.logo_url || null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const logoRef = useRef(null)
  const subdomainUrl = `${window.location.origin}/s/${brand.slug}`

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function handleLogoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  async function copySubdomain() {
    await navigator.clipboard.writeText(subdomainUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      const payload = { ...form, logo_url: logoUrl }
      const { data, error } = await supabase.from('brands').update(payload).eq('id', brand.id).select().single()
      if (error) throw error
      setBrand(prev => ({ ...prev, ...data }))
      toast.success('Settings saved!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Settings</h1>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Manage your brand profile and public page</p>

      <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── BRAND PROFILE ── */}
        <SettingsBlock title="Brand Profile">
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
            { key: 'name',    label: 'Brand Name' },
            { key: 'website', label: 'Website URL', placeholder: 'https://yourbrand.com' },
          ].map(f => (
            <div key={f.key}>
              <SLabel>{f.label}</SLabel>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || ''} style={IS} />
            </div>
          ))}

          <div>
            <SLabel>Description ({form.description.length}/140)</SLabel>
            <textarea value={form.description} onChange={e => set('description', e.target.value.slice(0, 140))} rows={3} style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
          </div>
        </SettingsBlock>

        {/* ── PUBLIC PAGE ── */}
        <SettingsBlock title="Public Page — {slug}.rebl.in">
          <div>
            <SLabel>Hero Headline</SLabel>
            <input value={form.hero_headline} onChange={e => set('hero_headline', e.target.value)} placeholder={`e.g. Made for the few who know.`} style={IS} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>Large text at the top of your page. Defaults to your brand name.</div>
          </div>
          <div>
            <SLabel>Hero Subheadline</SLabel>
            <input value={form.hero_subheadline} onChange={e => set('hero_subheadline', e.target.value)} placeholder="One sentence that says what you make and who it's for." style={IS} />
          </div>
        </SettingsBlock>

        {/* ── THEME ── */}
        <SettingsBlock title="Page Theme">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'theme_primary', label: 'Background Color' },
              { key: 'theme_accent',  label: 'Accent / CTA Color' },
            ].map(f => (
              <div key={f.key}>
                <SLabel>{f.label}</SLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    style={{ width: 44, height: 40, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }} />
                  <div style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: form[f.key], border: `1px solid ${C.border}` }} />
                  <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} style={{ ...IS, width: 96, fontSize: 12, padding: '8px 10px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Live preview swatch */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ backgroundColor: form.theme_primary, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#F1FAEE', fontWeight: 700, fontSize: 14 }}>Preview</span>
              <button style={{ backgroundColor: form.theme_accent, color: '#F1FAEE', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'default' }}>Claim Yours</button>
            </div>
          </div>
        </SettingsBlock>

        {/* ── SUBDOMAIN ── */}
        <SettingsBlock title="Subdomain">
          <div>
            <SLabel>Your Rebl URL (read-only)</SLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ ...IS, flex: 1, color: C.muted, fontSize: 13, cursor: 'default', userSelect: 'all' }}>
                {brand.slug}.rebl.in
              </div>
              <button onClick={copySubdomain}
                style={{ backgroundColor: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', color: copied ? '#22c55e' : C.cream, border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : C.border}`, borderRadius: 10, padding: '0 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <SLabel>Custom Domain (Phase 2)</SLabel>
            <input value={form.custom_domain} onChange={e => set('custom_domain', e.target.value)}
              placeholder="drops.yourbrand.com" style={{ ...IS, color: C.muted }} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>CNAME setup coming in Phase 2 — save your domain now.</div>
          </div>

          <a href={`/s/${brand.slug}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.cream, borderRadius: 10, padding: '12px', textDecoration: 'none', fontWeight: 700, fontSize: 14, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
            👁 Preview My Page ↗
          </a>
        </SettingsBlock>

        <RedBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save All Changes'}</RedBtn>
      </div>
    </div>
  )
}

function SettingsBlock({ title, children }) {
  return (
    <div style={{ backgroundColor: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.2 }}>{title}</div>
      {children}
    </div>
  )
}

function SLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 7 }}>{children}</div>
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
