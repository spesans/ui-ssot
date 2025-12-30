---
title: HP Sample Agent Instructions
slug: hp-sample-agents
summary: "Operational commands and scope rules"
type: guide
tags: [agents, nextjs, tooling]
last_updated: 2025-12-30
---

# AGENTS.md

## Project overview

`hp-sample/` is a bilingual (JA/EN) corporate website template built with Next.js (App Router) and Tailwind CSS.

## Setup commands

- Install dependencies: `npm install`
- Local env: `cp .env.example .env.local`
- Start dev server: `npm run dev`

## Build & verification

- Verification gate: `npm run verify`

## Code style

- Lint config: `eslint.config.mjs` (ESLint v9 flat config + typed linting)
- Format config: `prettier.config.cjs`

## Canonical definitions (SSOT)

- Project SSOT: `./SSOT.md`
- Human README: `./README.md`
