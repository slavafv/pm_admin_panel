# Softteco · Project Administration (PoC)

Role-based project-management admin panel — a sales demo built around a **non-IT
(construction / infrastructure) project**: the *RAK Wastewater Treatment Plant —
Phase 1* (PPP, AED 387M, 36 months) for **Ras Al Khaimah Municipality**.

The demo shows how the same project surfaces **different dashboards for different
roles** (Director General · Department Head · Project Manager), plus the full
admin flow: create → set up → schedule → manage → report.

## Demo flow (8 screens)

1. **Projects** — portfolio list with status, budget, team. Entry point.
2. **Create project** — modal capturing core parameters (creates a real, openable project).
3. **Setup** — 4 tabs: Team & roles · Stakeholders · Budget & resources · Dependencies & risks.
4. **Schedule** — custom Gantt: phases, milestones (◆), per-person FTE workload, live "mark complete" + critical-path toggle.
5. **Overview** — project summary "cockpit" table (health, phase, budget, next milestone…).
6. **Dashboards** — *the centrepiece*. Switch role (top-right) → the dashboard adapts:
   - **Director General** — RAG health, budget variance, milestones, top risks, RAK Vision 2030 KPIs
   - **Department Head** — phase progress, team workload, open issues, budget burn-rate
   - **Project Manager** — task board, blockers, resource FTE, next-milestone countdown
7. **(Live Gantt)** — schedule edits (mark phase complete) flow straight into the dashboards.
8. **Reports** — one-click branded PDF / CSV(XLS) exports + HTML preview.

> Demo "today" is **20 Feb 2026**, chosen so every headline figure stays consistent
> (design phase ~35% done, AED 4.2M spent of 4.8M planned-to-date, federal approval upcoming).

## Tech

- **Vite + React + TypeScript**, **Tailwind v4** (design tokens from the Itelgie/spec style guide)
- **Zustand** single-source-of-truth store — create a project, switch role, mark a phase
  complete; every screen reads the same model, so numbers never desync
- **Recharts** (donut, burn-rate line), **custom CSS-grid Gantt**
- **react-router** with a configurable `base` so the build runs at a domain root or a Pages sub-path

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 24 tests: logic + every route mounts without crashing
npm run build    # type-check + production build
```

## Deploy

- **GitHub Pages** — pushing to `main` runs `.github/workflows/deploy.yml`.
  One-time: repo **Settings → Pages → Source: GitHub Actions**. Builds with
  `VITE_BASE=/pm_admin_panel/` and adds a SPA `404.html` fallback.
- **Vercel / Netlify** — import the repo; `vercel.json` provides SPA rewrites.
  No `VITE_BASE` needed (serves from root).

## Customising the demo

All demo data lives in [`src/data/projects.ts`](src/data/projects.ts) — swap the hero
project, numbers, team, or add a 4th role in [`src/config/roles.ts`](src/config/roles.ts).
