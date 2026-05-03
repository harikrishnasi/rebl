# Rebl — India's Collector OS

## Overview
React + Vite web app for serious collectors in India. Full Greek mythology × outer space × modern invention brand identity.

**Tagline:** MYTH. MACHINE. MOVEMENT.

---

## Brand System

### Colors
- Void Black `#000000` — 80% (primary bg)
- Pure White `#FFFFFF` — 15% (text, CTAs)
- Steel Gray `#A6A6A6` — 5% (accents, borders, muted text)
- `#0A0A0A` — surface
- `#0D0D0D` — card bg
- `#1A1A1A` — subtle border
- `#2D2D2D` — visible border
- `#555555` — muted/dim text

### Typography
- **Display:** Cinzel (Google Fonts) — ALL CAPS, every section header, page title
- **Body:** Satoshi (Fontshare CDN) — all body text, UI labels
- **Mono:** Space Mono — metadata, labels, code
- **Logo only:** Poppins 800 — "Rēbl" with macron ē

### Logo
```jsx
<span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: '#FFFFFF', letterSpacing: '-0.5px' }}>Rēbl</span>
```

### Design Rules
- NO emojis — use ◈ ⊕ ◎ ✦ ⊞ ◇ △ ○ ◎
- NO rounded corners — borderRadius: 0 or omit everywhere
- NO colored accents — white/gray only throughout
- NO colored tier badges — just text with border dot
- ALL section headers → Cinzel font
- Placeholder items for empty states (greyed-out 3 cards + on-brand CTA)

### Design Tokens (T object)
```js
const T = {
  bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'
```

---

## File Structure

```
artifacts/rebl/src/
├── components/
│   ├── InnerNav.jsx          ← Shared nav for all inner/auth pages (Rēbl logo, profile avatar)
│   ├── GreekBorder.jsx       ← SVG meander pattern (use at section breaks)
│   ├── CrossHair.jsx         ← Crosshair icon component
│   └── StarField.jsx         ← Animated starfield background
├── pages/
│   ├── LandingPage.jsx       ← ✅ Full brand reference — use as design standard
│   ├── AuthPage.jsx          ← ✅ Login/signup with brand theme
│   ├── Dashboard.tsx         ← ✅ InnerNav, Cinzel headers, placeholder empty state
│   ├── Vault.tsx             ← ✅ Collector vault, underline tabs, Cinzel header
│   ├── TribePage.tsx         ← ✅ Community discovery, geometric archetype icons
│   ├── CollectorProfile.jsx  ← ✅ Public profile page
│   ├── AddItem.jsx           ← ✅ Item add flow, Rēbl loading wordmark
│   ├── BrandSignup.jsx       ← ✅ Brand registration wizard
│   ├── BrandDashboard.jsx    ← Brand analytics dashboard (2931 lines, targeted edits only)
│   ├── BrandPage.tsx         ← Public brand page
│   ├── BrandSubdomainPage.tsx← Brand subdomain experience
│   ├── PostPurchase.jsx      ← Post-purchase flow (black/white theme)
│   ├── Demo.jsx              ← Interactive product demo
│   ├── Blog.jsx              ← ✅ Editorial journal, Cinzel headers
│   ├── BlogPost.jsx          ← ✅ Individual essay page
│   ├── About.jsx             ← ✅ About page with values + Greek meander
│   ├── Privacy.jsx           ← ✅ Privacy policy
│   ├── Terms.jsx             ← ✅ Terms of service
│   └── not-found.tsx         ← ✅ 404 "LOST IN THE VOID." with Icarus mythology copy
├── lib/
│   ├── supabase.ts           ← Supabase client
│   └── gemini.ts             ← Gemini AI API helper
└── App.tsx                   ← Router (includes NotFound catch-all route)
```

---

## Backend (Supabase)

### Key Tables
- `profiles` — collector profiles (display_name, username, avatar_url, archetype, city, signature_phrase)
- `items` — vault items (owner_id, name, brand TEXT, category, image_url, verified, price_paid, rarity)
- `brands` — brand accounts (name, slug, owner_id, logo_url, description, primary_category)
- `brand_customers` — brand memberships (profile_id, brand_id, customer_tier_id)
- `customer_tiers` — brand tiers (name, level, has_backstage_access)
- `backstage_events` — exclusive events
- `backstage_posts` — brand posts to tier members
- `product_stories` — AI-generated provenance stories per item
- `purchases` — purchase records (profile_id, item_id)

### Important
- `items.brand` is TEXT — do NOT join on brands table
- Row Level Security enabled throughout
- Images in Supabase Storage bucket `item-images`

---

## Environment Secrets
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

---

## Fonts (index.html)
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Poppins:wght@800&display=swap" rel="stylesheet">
<!-- Fontshare -->
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">
```
