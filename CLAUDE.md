# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page commercial proposal ("Propuesta Kargo-Log") for the client Sergio Cachay / Kargo-Log, built as a static Astro site styled like an executive dashboard. It is deployed to GitHub Pages at the custom domain **quinquen.matiaslaporta.com**. SEO is intentionally omitted — this is a private proposal, not an indexed site.

## Commands

```bash
npm run dev        # dev server (auto-picks next free port: 4321, 4322, ...)
npm run build      # static build to dist/
npm run preview    # serve the built dist/
```

There are no tests, linters, or a test runner configured. Validation = `npm run build` passing.

## Stack

- **Astro 5** + **Tailwind CSS v4** via the official `@tailwindcss/vite` plugin (configured in `astro.config.mjs`). There is **no `tailwind.config.js`** — Tailwind v4 is config-less here; custom colors use arbitrary values (`bg-[#0A192F]`) and custom animations live in a `<style is:global>` block. Tailwind is imported through `src/styles/global.css` (`@import "tailwindcss";`), which `index.astro` imports.
- Plain vanilla `<script>` for all interactivity. No framework components, no client-side router.

## Architecture

**The entire site is one file: `src/pages/index.astro`** (~1200 lines). It is served at the site root `/` (there is no separate index/redirect page). Structure within the file:

1. **Frontmatter data arrays** (top of file) — `tabs`, `modulos`, `descartadas`, `precios`, `cronograma`, `paleta`. Edit copy/pricing here, not in the markup; the markup `.map()`s over these.
   - **PEN/soles gotcha:** prices are USD-first; the soles amounts are **hardcoded strings, not computed** (`pen: "1.035"` in `precios`, plus standalone `S/ ...` spans in the markup for the TOTAL, the Full Stack package, the two hosting cards, and the conversion note). The convention is **1 USD ≈ S/ 3,45**. If the rate or any USD figure changes, every soles value must be updated by hand — there is no single source of truth.
2. **`<style is:global>`** — tab-active states, `<details>` marker hiding, and the custom keyframe animations: `kl-shimmer` (button reflection), `kl-bar`/`kl-grow` (KPI bars), `kl-blueprint` (engineering grid texture), `kl-path`/`kl-march` (marching-ants supply line).
3. **Sidebar** (`lg:` fixed) and **mobile header** (`lg:hidden`, hamburger menu) — both render the same `tabs` array; their buttons share `data-tab` and the `nav-side`/`nav-top` classes.
4. **Four tab panels** — `<section data-panel="...">`: `diagnostico`, `soluciones`, `showcase`, `inversion`.
5. **Trailing `<script>`** — the tab engine.

### Tab system (vanilla JS)
`activate(id)` is the core function: toggles `.hidden` on every `[data-panel]`, sets `.tab-active` on every matching `[data-tab]` button (sidebar + mobile menu + in-content buttons all use `data-tab`), closes the mobile menu, and scrolls to top. The default tab is `diagnostico`.

### Animated node background (constellation)
A single fixed `#bg-nodes` canvas reproduces the particle network from matiaslaporta.com (color `#00E5FF`). It is shown **only on the tabs in `NODE_TABS`** (`diagnostico` + `inversion`) and its `requestAnimationFrame` is cancelled otherwise. Key constants in the IIFE: `COUNT_DESKTOP = 46`, `COUNT_MOBILE = 20`, `LINK_DIST`, `MOUSE_DIST`.

**Gotcha:** `<canvas>` is a replaced element, so `position:fixed; inset:0` does NOT stretch it — it would size to the intrinsic 300×150. The canvas is therefore sized explicitly in JS (`resize()` sets `style.width/height/left` from `window.innerWidth` minus the 288px sidebar) rather than relying on CSS. Any new canvas must do the same.

## Color system (two distinct palettes)

- **Proposal dashboard (tabs 1, 2, 4):** dark `#0f172a` / `#0b0f19`, accents **cyan** (`cyan-400`/`#22d3ee`) and **yellow** (`yellow-400`). Headings use yellow highlights; CTAs are yellow and link to the client's Google Calendar.
- **Showcase (tab 3) — client palette only:** navy `#0A192F`, industrial orange `#FF5722`, gris humo `#F7F8FA`, blanco hueso `#FDFCF0`, gris carbón `#202225`. This "Lienzo de Luz" deliberately breaks the dark pattern to preview the client's own brand. Keep client colors confined to the showcase.

The tab-3 prototypes (landing mockup + phone "Digital-Card") intentionally use flat divs/spans instead of semantic HTML and lightly imperfect copy — this is a deliberate "before optimization" demo, not a bug. Do not refactor it to be semantic.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` (uses `withastro/action`) builds and publishes to GitHub Pages. `public/CNAME` holds the custom domain and `site` is set in `astro.config.mjs`; both must stay in sync with the domain.

**Asset naming gotcha:** GitHub Pages serves on Linux (case-sensitive). Files in `public/` referenced from markup must use **lowercase, no-spaces** names (e.g. `logo-kargo-log.png`, not `Logo Kargo-Log.png`) or they 404 in production while working locally on Windows.

The repo is `MatiasLaporta/Quinquen`; the git identity for commits is `MatiasLaporta` / `matias@digitals.cl`.

**Windows/PowerShell commit gotcha:** commit messages with accented characters (`ó`, `ñ`, …) passed via a PowerShell here-string get mangled. Write the message to a file and use `git commit -F <file>` instead.
