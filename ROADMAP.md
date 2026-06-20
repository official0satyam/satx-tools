# SatX Tools Roadmap

This roadmap documents the execution phases, traffic milestones, and scope guidelines for **SatX Tools** ("Smart Tools For Everyday Problems").

---

## 🚀 Growth & Scale Phases

### Phase 1: Rapid Launch (Current)
- **Goal**: Launch 5 core tools with programmatic SEO and blog support. Get indexed by Google.
- **Traffic Target**: Launch baseline.
- **Tools Included**:
  1. Percentage Calculator (with Increase and Decrease pSEO pages)
  2. Age Calculator (with Birthday and How Old Am I pSEO pages)
  3. GST Calculator (with GST Percentage and Reverse GST pSEO pages)
  4. Discount Calculator (with Sale Price and Percent Off pSEO pages)
  5. Password Generator (with Secure Password and Random String pSEO pages)
- **Support Features**: Blog section (5 articles), automatic sitemap, robots.txt, and client-side tool search.

### Phase 2: Category Expansion
- **Goal**: Expand to 20 tools. Add secondary features.
- **Traffic Target**: 100+ organic visitors per day.
- **Planned Additions**:
  - Currency Converter, BMI Calculator, Loan Calculator, SIP Calculator, Date Calculator, Text Tools, JSON Formatter, Color Picker.

### Phase 3: Traffic Scale
- **Goal**: Expand to 50 tools. Expand blog content.
- **Traffic Target**: 1,000+ organic visitors per day.
- **Monetization Check**: Apply for Google AdSense after reaching consistent traffic.

### Phase 4: Rich Features
- **Goal**: Expand to 100 tools.
- **Traffic Target**: 10,000+ organic visitors per day.
- **Planned Additions**:
  - User favorites storage (client-side `localStorage`), custom tool collections, dark/light theme toggle, PWA (Progressive Web App) support for offline usage.

### Phase 5: Authority Tools Portal
- **Goal**: Expand to 300+ tools.
- **Traffic Target**: 50,000+ organic visitors per day.

---

## 🛠️ Project Scope & Non-Negotiables
To keep hosting costs at zero and maintain maximum speed and portability:
- **No Database**: All application state must remain client-side (no database connection).
- **No Accounts/Login**: Users access all tools immediately. No profiles or dashboards.
- **No Backend**: Deployment must remain pure static hosting (Cloudflare Pages).
- **Owner Friendly**: Maintain simple code, clear variables, and centralized settings in `registry.json` and `build.js` so a beginner can edit them.
