# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page commercial proposal ("Propuesta Aldea Quinquén") for AMSAC's off-grid parcel project, built as a static Astro site styled like an executive dashboard. All copy is in Spanish and all prices are in **CLP**. It is deployed to GitHub Pages at **quinquen.matiaslaporta.com**. SEO is intentionally omitted — this is a private proposal, not an indexed site.

The project was forked from an earlier proposal (Kargo-Log); the `package.json` name and a few `public/` assets still carry that name. That is leftover, not a second client.

## Commands

```bash
npm run dev        # dev server (auto-picks next free port: 4321, 4322, ...)
npm run build      # static build to dist/
npm run preview    # serve the built dist/
```

There are no tests, linters, or a test runner. Validation = `npm run build` passing. If the dev server fails with `ERR_MODULE_NOT_FOUND` inside `node_modules`, the install is corrupted: delete `node_modules` and run `npm ci`.

## Stack

- **Astro 5** + **Tailwind CSS v4** via `@tailwindcss/vite` (configured in `astro.config.mjs`). There is **no `tailwind.config.js`**: custom colors use arbitrary values (`bg-[#0b0f19]`), and Tailwind is imported through `src/styles/global.css` (`@import "tailwindcss";`). v4 variants such as `has-checked:` and `data-[...]:` are used and work without config.
- Plain vanilla `<script>` for all interactivity. No framework components, no client-side router.

## Architecture

**The entire site is one file: `src/pages/index.astro`** (~970 lines), served at `/`. Structure within the file:

1. **Frontmatter data arrays** — `tabs`, `modulos` (tab 2), `modulosAds` (tab 3), `precios` (tab 4 calculator), `cronograma`. Edit copy and prices here, not in the markup; the markup `.map()`s over these. Tab 1 copy is the exception: it is written inline in the markup.
2. **`<style is:global>`** — tab-active states for `nav-side`/`nav-top` buttons and `<details>` marker hiding.
3. **Sidebar** (`lg:` fixed, 288px) and **mobile header** (`lg:hidden`, hamburger menu) — both render the same `tabs` array.
4. **Four tab panels** — `<section data-panel="...">`: `diagnostico`, `soluciones`, `ads`, `inversion`. The tab number shown in the UI comes from `tabs[].n`, not from panel order.
5. **Trailing `<script>`** — tab engine, node-background canvas, and the pricing calculator.

### Tab system
`activate(id)` toggles `.hidden` on every `[data-panel]`, sets `.tab-active` on every matching `[data-tab]` button (sidebar, mobile menu and in-content buttons all use `data-tab`), closes the mobile menu, and scrolls to top. Default tab is `diagnostico`. Adding a tab = add an entry to `tabs` + a matching `<section data-panel>`.

### Dropdown panels (tabs 2 and 3)
Both render `<details>` cards. Tab 2 items are `{ n, titulo, puntos[], bonus }` (bonus shown in a yellow "BONUS" pill). Tab 3 items have either `escenarios[]` (`{ titulo, puntos[], nota }`, note shown in a yellow "NOTA" box) or a plain `puntos[]`.

### Pricing calculator (tab 4)
Checkboxes are rendered from `precios`; each `input.calc-opt` carries `data-mod`, `data-clp` and `data-tipo` (`"mensual"` or `"unico"`). The script sums the checked monthly items into the "Mensualidad" total and shows the one-time (`unico`) item separately; there are no discounts. Options sharing a `data-mod` (e.g. the two Redes Sociales tiers) are mutually exclusive in JS. CLP is formatted with `.` thousands separators by the same regex both in frontmatter (`clp()`) and in the script (`fmt()`); keep them in sync.

Below that row, the **"Inversión total"** strip adds a monthly Ads budget: its `.ads-opt` checkboxes mirror the Meta/TikTok `calc-opt`s (synced both ways via `data-mod`), `.nivel-opt` radios carry the budget per level from `nivelesAds` (`data-meta`/`data-tiktok`/`data-ambos`), and the total = Ads budget + mensualidad (one-time item excluded). With both platforms it shows a 2/3 Meta, 1/3 TikTok split.

Layout note: the "Arma tu plan" and "Tu inversión" cards share a `grid grid-cols-1 lg:grid-cols-[3fr_2fr]` row. `grid-cols-1` (i.e. `minmax(0,1fr)`) plus `min-w-0` on the children is what stops the nowrap prices from overflowing on mobile; don't drop them.

### Animated node background
A single fixed `#bg-nodes` canvas (particle network, color `#00E5FF`) is shown **only on tabs in `NODE_TABS`** (`diagnostico`, `inversion`); its `requestAnimationFrame` is cancelled otherwise. Constants: `SIDEBAR_W = 288`, `COUNT_DESKTOP = 46`, `COUNT_MOBILE = 20`, `LINK_DIST`, `MOUSE_DIST`.

**Gotcha:** `<canvas>` is a replaced element, so `position:fixed; inset:0` does NOT stretch it (it stays 300×150). `resize()` sizes it explicitly from `window.innerWidth` minus the sidebar. Any new canvas must do the same.

## Visual conventions

Dark background `#0f172a` / `#0b0f19`; accents **cyan** (`cyan-400`) for eyebrow labels and numbers, **yellow** (`yellow-400`) for highlighted words in headings and for CTAs. In body text, emphasis is `font-semibold text-white` (white) or `font-semibold text-yellow-400` (yellow). CTAs link to the Google Calendar booking URL.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` (`withastro/action`) builds and publishes to GitHub Pages. The repo is `MatiasLaporta/Quinquen` (public). `public/CNAME` and `site` in `astro.config.mjs` must both match the domain. DNS: `CNAME quinquen → matiaslaporta.github.io`.

**Asset naming gotcha:** GitHub Pages is case-sensitive. Files in `public/` must use **lowercase, no-spaces** names or they 404 in production while working locally on Windows.

Git identity: `MatiasLaporta` / `matias@digitals.cl` (use `gh auth switch --user MatiasLaporta` if the CLI is on another account).

**Windows/PowerShell commit gotcha:** accented characters (`ó`, `ñ`, …) in commit messages passed via a PowerShell here-string get mangled. Write the message to a file and use `git commit -F <file>`.
