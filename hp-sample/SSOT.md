---
title: HP Sample SSOT
slug: hp-sample-ssot
summary: "Canonical sources and development rules"
type: spec
tags: [ssot, nextjs, typescript, tooling]
last_updated: 2025-12-30
---

# HP Sample SSOT

## Project SSOT (MUST)

This file is the **single Project SSOT** for `hp-sample/`.

If something is defined in more than one place, this file decides which one is canonical.

## Canonical sources

### Branding

- Brand name and logo text: `lib/config/branding.ts`
- Navigation labels and routes: `lib/config/navigation.ts`
- Design tokens (including logo sizing tokens): `app/globals.css`

### Environment variables

- Public env schema + validation: `lib/env/public.ts`
- Public env usage:
  - Canonical site URL: `lib/site.ts`
  - Contact endpoint: `components/ContactSection.tsx`

### SEO / metadata

- Localized metadata builder: `lib/metadata.ts`
- Per-page titles/descriptions: `lib/seo.ts`
- Robots + sitemap: `app/robots.ts`, `app/sitemap.ts`

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

This project uses `npm` for all commands.

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
  decided_at: "2025-12-30T00:00:00Z"
```
