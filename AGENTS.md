---
title: ui-ssot Agent Instructions
slug: ui-ssot-agents
summary: "How to work in this repo"
type: guide
tags: [agents, repository]
last_updated: 2026-01-01
---

# AGENTS.md

## Primary directives

- Communicate with the user in **Japanese** unless explicitly requested otherwise.
- Write **all code and documentation in English**.
- Any Git/GitHub-facing text (branches, commits, PRs, issues, comments, docs) must be **English**.

## Repo overview

This repository contains multiple UI sample projects. Each sample directory is a worldview boundary and must remain self-contained.

## Working rules

- Follow the nearest `AGENTS.md` and `SSOT.md` inside the sample you edit.
- Keep changes small and focused.
- Do not add cross-sample imports, links, or shared dependencies unless explicitly requested.

## Common commands

- `hp-sample/` verification gate: `cd hp-sample && npm run verify`
- `hp-sample/` dev server: `cd hp-sample && npm run dev`
