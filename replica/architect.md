# Shyama Fashion — System Architecture (`replica/architect.md`)

## Stack & Runtime
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons
- **Design & Motion System**:
  - **Apple Liquid Glass Chrome** (`dickwu/apple-design-skill`): Reserved strictly for functional chrome (`Navbar`, slide-over `BagDrawer`, `WishlistDrawer`, floating bottom mobile tab bar, modal headers/toast). Product photography cards sit on opaque dark obsidian surfaces (`--surface`) for uninterrupted garment clarity.
  - **Fluid Micro-Interactions** (`emilkowalski/skills` — `emil-design-eng`, `emil-apple-design`, `mobile-native`): Custom `cubic-bezier(0.23, 1, 0.32, 1)` snap curves under `250ms`, `:active scale(0.97)` press response, `@media (hover: hover) and (pointer: fine)` capability gating, `16px` mobile inputs to prevent iOS auto-zoom, `100svh`/`100dvh` viewport sizing, and `prefers-reduced-motion` / `prefers-reduced-transparency` overrides.
  - **Two-Tone Neon Animated Aurora Mesh**: 4 instant palettes (`Cyber Rose × Cyan`, `Acid Lime × Violet`, `Sunset Laser × Amber`, `Daylight Pearl × Iris`, plus Custom Hex Two-Tone) powered by GPU-composited `transform` orbs.
- **Integrated API Persistence (`vite.config.ts` -> `shyamaStudioBackend`)**:
  - `GET /api/health` — Live server health check
  - `GET / POST / DELETE /api/telemetry` — Persists customer activity events to `data/runtime-telemetry.json`
  - `GET / POST /api/studio-config` — Persists brand/logo/address/catalog overrides to `data/runtime-studio-config.json`
  - `GET / POST /api/orders` — Logs Express & WhatsApp studio orders to `data/runtime-orders.json`
