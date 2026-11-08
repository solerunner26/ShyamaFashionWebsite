# Shyama Fashion — Gen-Z Women's Bottomwear & Studio Storefront

A mobile-first, ultra-responsive D2C women's fashion storefront for **Shyama Fashion**, engineered with **Apple Liquid Glass UI**, **Emil Kowalski fluid motion principles**, **Two-Tone Neon Animated Gradient Themes**, **25 Women's Products × 5 Human-Model Angles (125 studio views)**, **Live Brand/Address/Catalog Customization**, and a **Real-Time Customer Activity & Friction Diagnostics Engine**.

## Installed AI Skills (Pre-Installed Globally & Project-Locally)
All 29 skills from the three requested repositories are installed and ready in both `.claude/skills/` and `.agents/skills/` (as well as `~/.claude/skills/` and `~/.agents/skills/`):
1. **`Jakeschincariol/replica-skill`** (`replica`, `replica-recon`, `replica-architect`, `replica-design`, `replica-brand`, `replica-build`, `replica-verify`, `replica-extend`)
2. **`emilkowalski/skills`** (`animations`, `emil-design-eng`, `emil-apple-design`, `mobile-native`, `nextjs-perf`, `security`)
3. **`dickwu/apple-design-skill`** (`apple-design` + 14 platform/HIG skills including Liquid Glass, Typography, Color, Motion, Inputs, Layout)

See [`AGENTS.md`](./AGENTS.md) and [`CLAUDE.md`](./CLAUDE.md) for the complete skill index.

## Highlights
- **100% Women's Wear Catalog (25 Products × 5 Model Angles = 125 Studio Photos)**:
  - **Bottomwear Core**: Palazzos (`5`), Lounge & Satin Pajamas (`5`), Women's Cargo & Tailored Pants (`5`), Sculpt & Kurti Leggings (`3`), Korean-Fit & Straight Trousers (`3`).
  - **Topwear Pairings**: Handcrafted Kurtis (`3`) & Satin Midi Dress (`1`).
  - Every card supports **5-angle pointer hover scrubbing** on desktop and **5-segment story tap bars** on mobile, plus an interactive **2-Angle Drape Compare Slider** inside the Product Detail Modal.
- **Sticky Gen-Z Discovery & Conversion Flows**:
  - Top Promo Marquee (`SHYAMA15` 1-tap copy), Visual Category Story Bubbles, **"Wear The Studio Vibe"** 2-piece shoppable lookbooks (`ADD BOTH — SAVE 15%`), **Vibe Deck** full-bleed swipe mode, **Explorer VIP Unlock** (`SHYAMA20`), Smart **Waist-to-Size Fit Finder** (`In`/`Cm` + `Body`/`Garment` toggle), 6-digit Indian Pincode ETA checker, Slide-Over Bag with Free-Shipping/Bundle progress bar, UPI Extra 5% OFF vs COD, and **1-Tap WhatsApp Direct Studio Order**.
- **Configurable Brand, Logo, Studio Address & Product Links (`Studio` button in header)**:
  - Edit Studio Name, Tagline, Logo Monogram or Custom Logo Image Upload/URL, Studio Address, Phone, WhatsApp number, Email, Instagram, GSTIN, and Two-Tone Neon Palette live.
  - Edit any of the 25 products, add new products, replace any of the 5 model angle photos via URL or file upload, sync the entire catalog from an external JSON feed URL (`/catalog/products.json`), or generate **AI Cloth-to-Model 5-Angle Shoot Prompts**.
- **Customer Activity Tracker & UX Problem Solver (`Insights` button in header)**:
  - Tracks every session, scroll milestone (`25%`–`100%`), category filter, search query, zero-result search, dead filter combo, 5-angle scrub, PDP dwell time, size hesitation, missing-size add attempt, bag removal, rage click, and completed order—automatically surfacing **Identified Customer Friction & Actionable Solutions** with 1-click JSON/CSV export.

## Quick Start
```bash
npm install
npm run dev
```
Production build & verification:
```bash
npm run build
python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json
python3 .claude/skills/replica-verify/parity.py replica/features.csv
python3 .claude/skills/replica-brand/sweep.py src --config replica/brand.json
```
