---
title: ML Sample SSOT
slug: ml-sample-ssot
summary: "Canonical sources and development rules"
type: spec
tags: [ssot, nextjs, typescript, ui-template]
last_updated: 2026-01-01
---

# ML Sample SSOT

## Project SSOT (MUST)

This file is the single Project SSOT for `ml-sample/`.

If something is defined in more than one place, this file decides which one is canonical.

## Canonical sources

### Branding

- Brand text (name, shortName, wordmark, monogram): `src/lib/branding.ts`
- Logo assets: `public/brand/*`
- Design tokens: `src/app/globals.css`

### Catalog data

- Tags + tracks: `src/music/sampleCatalog.ts`

### UI shell

- App shell (layout + navigation): `src/components/AppShell.tsx`
- Theme toggle: `src/components/ThemeToggle.tsx`

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
