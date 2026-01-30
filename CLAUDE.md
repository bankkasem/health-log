# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4. The project uses Biome for linting and formatting instead of ESLint/Prettier.

## Development Commands

**Development server:**
```bash
bun dev
# or npm run dev / yarn dev / pnpm dev
```
Server runs at http://localhost:3000

**Build:**
```bash
bun run build
```

**Production server:**
```bash
bun start
```

**Linting:**
```bash
bun run lint
```

**Formatting:**
```bash
bun run format
```

## Architecture

### Next.js App Router Structure

This project uses the Next.js App Router (not Pages Router). All routes are defined in the `src/app/` directory:

- `src/app/layout.tsx` - Root layout with font configuration (Geist Sans and Geist Mono)
- `src/app/page.tsx` - Home page with links to weight and records pages
- `src/app/weight/page.tsx` - Health metrics form page
- `src/app/records/page.tsx` - View all saved health records
- `src/app/globals.css` - Global styles with Tailwind directives

**Shared Code:**
- `src/types/weight.ts` - TypeScript interfaces for weight metrics
- `src/app/api/weight/route.ts` - API route for weight data operations

### Features

**Weight Tracking:**
- Form to collect weight metrics: body fat percentage, muscle mass, visceral fat, BMR, and BMI
- Data saved to `data/weight-log.xlsx` in the workspace
- Uses Next.js API route (`/api/weight`) for server-side file operations
- Excel file has Thai column headers with automatic timestamp
- Works in all browsers (server-side file operations)

**Code Conventions:**
- Use English for all variable/function names
- Use Thai only for user-facing labels and messages
- Extract types to `src/types/` directory
- Extract utilities to `src/utils/` directory

### Key Configuration

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in tsconfig.json)

**Biome Configuration:**
- Uses 2-space indentation
- Auto-organizes imports on save
- Next.js and React recommended rules enabled
- Ignores: node_modules, .next, dist, build

**TypeScript:**
- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (new JSX transform)

**Styling:**
- Tailwind CSS v4 with PostCSS
- Configured in `postcss.config.mjs`
- Global styles in `src/app/globals.css`

## Important Notes

- This project uses **Biome** for linting/formatting, not ESLint or Prettier
- Uses the **App Router**, not the Pages Router - all routing is file-based in `src/app/`
- Bun is the preferred package manager (see bun.lock and ignoreScripts config)
