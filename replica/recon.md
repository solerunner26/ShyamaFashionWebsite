# Replica Recon Map — Target D2C Storefront Pattern -> Shyama Fashion (Women's Wear Only)

## Scope
1. **Platform:** Responsive Web App + Mobile-Native PWA feel (Desktop, iOS Safari, Android Chrome).
2. **Core Loop:** Visual discovery of women's bottomwear & Indo-fusion topwear -> 5-angle model inspection -> interactive size/fit confidence (`In`/`Cm` + Fit Finder) -> 1-tap Quick-Add with Best-Price Prepaid/Coupon unlock -> Bag & Checkout -> Full Customer Behavior Telemetry.
3. **Audience:** Gen-Z & modern Indian women shopping **Shyama Fashion** primarily for **Palazzos, Pajamas, Women's Pants, Leggings, and Trousers**, plus curated **Kurtis and Dresses**.

## Screen Inventory
| ID | Screen / Surface | Route / Trigger | Purpose | Key Components | States |
| --- | --- | --- | --- | --- | --- |
| S01 | Home / Editorial Storefront | `/` | Stickiness, vibe & rapid discovery | Animated 2-tone neon mesh hero, Offer Marquee, Visual Story Category Strip, "Own The Silhouette" Shop-The-Look, Trending Grid, Vibe Switcher | Default, Filtered, Reduced-Motion, Mobile |
| S02 | Collection / Smart Filter Explorer | `/#catalog` + Category Pills | Deep browse across 24+ products | Sticky glass filter bar, Category/Fit/Fabric/Price/Size filters, Sort, 5-angle scrubbable product cards | Filled, Empty-filter reset, Mobile 2-col grid |
| S03 | 5-Angle Product Detail Experience (PDP) | Product click / `?product=id` | High-conviction inspection & conversion | 5-angle model gallery, Drape Compare Slider, Zoom Lightbox, In/Cm Size Chart + Fit Finder, Best Price Coupon Copy, Pincode ETA, Key Highlights & Wash Care, Pair-It-With | Default, Size-missing prompt, Zoomed, Copied toast |
| S04 | Quick-View & Quick-Add Sheet | `QUICK VIEW` / `+` card button | Zero-friction bag addition without losing scroll | 5-angle mini carousel, instant size pills, Best-price callout, Add to Bag | Open, Adding, Added |
| S05 | Slide-Over Bag & Offers Drawer | Bag icon / post-add | AOV boost & checkout | Free-shipping + B2G15 tier bar, Coupon applier, Prepaid 5% toggle, "Complete Your Look" Kurti/Bottom cross-sell, WhatsApp/Express Checkout | Empty bag, 1+ items, Coupon applied, Order confirmed |
| S06 | Wishlist & Recently Viewed Vault | Heart icon + sticky rail | Re-engagement & stickiness | Saved styles grid, 1-tap Move to Bag, Recently Viewed horizontal rail | Empty, Populated |
| S07 | Instant Search & Vibe Finder (`⌘K`) | Search button / `⌘K` | Sub-50ms search by style, fabric, color, vibe | Live query filter, Trending tags, Visual results | Idle suggestions, Results, No-match suggestions |
| S08 | Customer Activity & Problem Diagnostics Hub | Analytics icon / `?panel=analytics` | Track every customer action & diagnose friction | Live event stream, Conversion funnel, Size-hesitation & rage-click detector, Dead-filter & drop-off alerts, Product engagement heatmap, JSON/CSV export | Live session, Seeded baseline + real events, Cleared |
| S09 | Studio Brand, Catalog & AI Photo Manager | Studio icon / `?panel=studio` | Scope to change Brand Name, Logo, Address, Theme, Products & 5-Angle Images | Brand Identity editor (Name, Logo text/URL/upload, Address, Phone, WhatsApp, GST), 2-Tone Neon Theme Picker, Product & 5-Image URL/Upload Editor, Bulk JSON Import/Export | Default, Custom-edited, Reset to defaults |

## User Flows
- **F01 Visual Stickiness Loop:** Land on S01 -> Scrub 5 angles directly on product card -> Tap `WEAR THE VIBE` hotspot -> Open S04 Quick View -> Keep scrolling endless curated rails.
- **F02 Confident Bottomwear Fit Purchase:** Open S03 PDP -> Inspect all 5 angles (Front, Side Profile, Back Fit, Waistband Detail, Street Styled) -> Toggle `In`/`Cm` size chart or run Smart Fit Finder -> Check Pincode ETA -> Copy coupon -> Add to Bag -> Complete Express/WhatsApp Checkout in S05.
- **F03 Complete-The-Look Cross-Sell:** Add Palazzo/Trouser -> See matched Kurti pairing in S03/S05 -> Unlock Buy-2-Get-15% tier automatically.
- **F04 Owner Telemetry Diagnosis:** Customer hesitates on size or clears filters -> Event Engine records `size_chart_open`, `add_to_bag_without_size`, `filter_zero_results`, `rage_click`, `scroll_depth`, `angle_view` -> Owner opens S08 Diagnostics Hub and sees actionable friction cards & exact event timeline.
- **F05 Owner Rebrand & Catalog Update:** Owner opens S09 Studio Manager -> Updates Studio Name/Logo/Address or swaps any product's 5 model images via URL/file upload or JSON link -> Storefront updates live immediately.
