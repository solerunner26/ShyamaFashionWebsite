# Installed AI Skills — Shyama Fashion Workspace

All requested skill packs are pre-installed locally in **`.claude/skills/`** (and symlinked in **`.agents/skills/`**, plus globally in **`~/.claude/skills/`** and **`~/.agents/skills/`**) so any AI coding agent (Claude Code, Arena, Cursor, Codex, Windsurf, Antigravity) can invoke them at any time.

## 1. Replica Skill Pack (`Jakeschincariol/replica-skill`)
Clean-room app/website reverse-engineering, architecture, token design, parity scoring, and brand sweeping:
- `/replica-recon` — `.claude/skills/replica-recon/SKILL.md`
- `/replica-architect` — `.claude/skills/replica-architect/SKILL.md`
- `/replica-design` — `.claude/skills/replica-design/SKILL.md` (`contrast.py`)
- `/replica-build` — `.claude/skills/replica-build/SKILL.md`
- `/replica-backend` — `.claude/skills/replica-backend/SKILL.md`
- `/replica-test` — `.claude/skills/replica-test/SKILL.md`
- `/replica-diff` — `.claude/skills/replica-diff/SKILL.md` (`parity.py`, `imgdiff.py`)
- `/replica-entrepreneur` — `.claude/skills/replica-entrepreneur/SKILL.md` (`reviews.py`)
- `/replica-brand` — `.claude/skills/replica-brand/SKILL.md` (`sweep.py`)
- `/replica-launch` — `.claude/skills/replica-launch/SKILL.md` (`listing.py`)
- `/replica-deploy` — `.claude/skills/replica-deploy/SKILL.md`

## 2. Emil Kowalski Design Engineering Skills (`emilkowalski/skills`)
Fluid UI craft, custom easings, spring physics, performance, and native-feeling mobile web:
- `/emil-design-eng` — `.claude/skills/emil-design-eng/SKILL.md`
- `/emil-apple-design` — `.claude/skills/emil-apple-design/SKILL.md` (WWDC Fluid Interfaces translated for Web)
- `/animate` — `.claude/skills/animate/SKILL.md`
- `/animate-expo` — `.claude/skills/animate-expo/SKILL.md`
- `/animation-performance` — `.claude/skills/animation-performance/SKILL.md`
- `/animation-vocabulary` — `.claude/skills/animation-vocabulary/SKILL.md`
- `/choreograph` — `.claude/skills/choreograph/SKILL.md`
- `/find-animation-opportunities` — `.claude/skills/find-animation-opportunities/SKILL.md`
- `/improve-animations` — `.claude/skills/improve-animations/SKILL.md`
- `/remove-animations` — `.claude/skills/remove-animations/SKILL.md`
- `/review-animations` — `.claude/skills/review-animations/SKILL.md`
- `/mobile-native` — `.claude/skills/mobile-native/SKILL.md`
- `/pick-ui-library` — `.claude/skills/pick-ui-library/SKILL.md`
- `/prototype` — `.claude/skills/prototype/SKILL.md`
- `/break-ui` — `.claude/skills/break-ui/SKILL.md`
- `/ask-sonner` — `.claude/skills/ask-sonner/SKILL.md`
- `/write-swift` — `.claude/skills/write-swift/SKILL.md`

## 3. Apple HIG + Liquid Glass Reviewer (`dickwu/apple-design-skill`)
123 Apple Human Interface Guidelines reference pages + curated Liquid Glass guide:
- `/apple-design` — `.claude/skills/apple-design/SKILL.md`
- Liquid Glass Web Translation — `.claude/skills/apple-design/references/hig/liquid-glass.md`
- HIG Lookup Index — `.claude/skills/apple-design/references/hig-lookup.md`

## Design & Review Rules Active for This Repo
1. Follow `.claude/skills/apple-design/SKILL.md` and `.claude/skills/apple-design/references/hig/liquid-glass.md`: apply Liquid Glass (`backdrop-filter: blur(24px) saturate(1.4)`) strictly to floating functional chrome (nav, drawers, sheets, floating pills), never stacked glass-on-glass in content cards.
2. Follow `.claude/skills/emil-design-eng/SKILL.md` and `.claude/skills/mobile-native/SKILL.md`: tactile `:active` `scale(0.97)` feedback on pointer-down, custom `cubic-bezier(0.23, 1, 0.32, 1)` ease-out under 260ms, hover gated behind `@media (hover: hover) and (pointer: fine)`, 16px inputs on mobile, `100svh`/`100dvh`, and `prefers-reduced-motion` support.
3. Follow `.claude/skills/replica-brand/SKILL.md`: keep codebase 100% clean of target store names/assets via `python3 .claude/skills/replica-brand/sweep.py . --config replica/brand.json`.
