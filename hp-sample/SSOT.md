---
title: HP Sample SSOT
slug: hp-sample-ssot
summary: "Canonical sources and development rules"
type: spec
tags: [ssot, nextjs, typescript, tooling]
last_updated: 2026-01-01
---

# HP Sample SSOT

## Project SSOT (MUST)

This file is the single Project SSOT for `hp-sample/`.

If something is defined in more than one place, this file decides which one is canonical.

## Canonical sources

### Branding

- Brand name and logo text: `src/lib/config/branding.ts`
- Navigation labels and routes: `src/lib/config/navigation.ts`
- Design tokens (including logo sizing tokens): `src/app/globals.css`

### Environment variables

- Public env schema + validation: `src/lib/env/public.ts`
- Public env usage:
  - Canonical site URL: `src/lib/site.ts`
  - Contact endpoint: `src/components/ContactSection.tsx`

### SEO / metadata

- Localized metadata builder: `src/lib/metadata.ts`
- Per-page titles/descriptions: `src/lib/seo.ts`
- Robots + sitemap: `src/app/robots.ts`, `src/app/sitemap.ts`

### UI shell

- App shell (layout + navigation): `src/components/AppShell.tsx`
- Scroll/interaction logic (AppShell submodules): `src/components/app-shell/*`

## Tooling and commands

### Verification gate (MUST)

- `npm run verify`

### Formatting (SHOULD)

- Format: `npm run format`
- Check: `npm run format:check`

### Linting (SHOULD)

- `npm run lint`

### Type checking (SHOULD)

- `npm run typecheck`

## Package manager deviation (MUST)

This project uses `npm` for all commands (deviation from the `dev-ssot` TypeScript Standard Set).

### Translation table (pnpm → npm)

| SSOT command shape  | This project       |
| ------------------- | ------------------ |
| `pnpm install`      | `npm install`      |
| `pnpm run <script>` | `npm run <script>` |

```yaml
deviation:
  topic: typescript-standard
  what: "Use npm instead of pnpm"
  why: "This template is currently npm-first and includes package-lock.json"
  scope: "hp-sample/**"
  timebox: "2026-03-31"
  alternatives_considered:
    - "Migrate to pnpm (Corepack) and replace package-lock.json"
  approver: "N/A (template baseline)"
  decided_at: "2026-01-01T00:00:00Z"
```
