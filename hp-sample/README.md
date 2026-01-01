# Next.js Corporate Website Template

A generic, bilingual (JA/EN) corporate website template built with Next.js (App Router) and Tailwind CSS.

## Documentation

- Human README: `README.md`
- Agent instructions: `AGENTS.md`
- Canonical definitions (Project SSOT): `SSOT.md`

## Features

- Static export (`output: "export"`) for simple hosting
- Bilingual routing (`/ja`, `/en`) with language switcher + locale redirects
- Pages: Home, About, Contact, Terms, Privacy, Legal
- Responsive layout with theme toggle

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

- `NEXT_PUBLIC_SITE_URL` (required): Canonical site URL used for metadata, sitemap, and structured data.
- `NEXT_PUBLIC_CONTACT_ENDPOINT` (optional): If set, the contact form will `POST` JSON to this endpoint.

`NEXT_PUBLIC_SITE_URL` should be your production origin (e.g. `https://your-domain.com`). The default in `.env.example` is `http://localhost:3000` for local development.

Contact form payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "Message body",
  "website": ""
}
```

## Scripts

- `npm run dev`: Start dev server
- `npm run build`: Build and export static site to `out/`
- `npm run lint`: Lint
- `npm run typecheck`: TypeScript typecheck
- `npm run format`: Format
- `npm run verify`: Lint + typecheck + format check + build

## Customization

- Copy: `src/lib/translations/`
- Navigation: `src/lib/config/navigation.ts`
- Structured data: `src/lib/config/site.ts`

## Branding (Text Logo)

This template uses a text logo (no image assets) to keep setup simple and consistent.

- Site name + short mark: `src/lib/config/branding.ts`
- Logo sizing tokens (single source of truth): `src/app/globals.css` (`--brand-logo-*`)

Defaults:

- Full logo: `--brand-logo-height` (36px) and `--brand-logo-full-max-width` (180px)
- Compact logo: `--brand-logo-square-size` (36px)
- Typography: `--brand-logo-font-size` (1.125rem)
- Mobile safety: `--brand-logo-viewport-safe-offset` (120px)
