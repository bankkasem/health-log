# AGENTS.md

This file provides guidance for agentic coding assistants working in this repository.

## Project Overview

Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4 with Supabase backend and NextAuth v4 authentication.

## Development Commands

```bash
# Development server (runs at http://localhost:3000)
bun dev

# Production build (runs prebuild automatically)
bun run build

# Pre-build (format + lint)
bun run prebuild

# Production server
bun start

# Linting with Biome
bun run lint

# Formatting with Biome
bun run format
```

**Note**: No test framework is currently configured. To add tests, set up Vitest, Jest, or Playwright.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **React**: Version 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome (NOT ESLint/Prettier)
- **Database**: Supabase PostgreSQL
- **Auth**: NextAuth v4 with credentials provider
- **Package Manager**: Bun (preferred)

## Code Style Guidelines

### General Conventions

- **Language**: Use English for all code (variables, functions, comments)
- **User-facing text**: Use Thai for UI labels, messages, and errors
- **Indentation**: 2 spaces (enforced by Biome)
- **Line endings**: LF

### Naming Conventions

- **Variables/functions**: camelCase (`getUserData`, `isLoading`)
- **Components**: PascalCase (`Button`, `UserProfile`)
- **Interfaces/Types**: PascalCase (`WeightMetrics`, `UserSession`)
- **Database fields**: snake_case (`body_fat_percentage`, `user_id`)
- **API routes**: lowercase with hyphens (`/api/weight-metrics`)
- **Files**: camelCase for utilities, PascalCase for components

### Imports

- Use path alias `@/*` for all internal imports
- Group imports: React/Next first, then external libs, then internal
- Use `type` keyword for type-only imports: `import type { Foo } from "..."`
- Biome organizes imports automatically on save

Example:
```typescript
import type { Metadata } from "next";
import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { WeightMetrics } from "@/types/weight";
```

### TypeScript

- Enable strict mode compliance
- Define explicit return types for functions
- Use interfaces for object shapes, types for unions/aliases
- Extract shared types to `src/types/` directory
- Use `readonly` for immutable arrays/objects when appropriate

### Error Handling

- Wrap API calls in try/catch blocks
- Return consistent error responses: `{ success: false, message: "..." }`
- Log errors to console with context: `console.error("Action:", error)`
- Use appropriate HTTP status codes (400, 401, 404, 500)
- User-facing error messages in Thai

### Component Patterns

- Use functional components with hooks
- Props interface named `{ComponentName}Props`
- Use `forwardRef` for reusable UI components
- Add `displayName` for forwardRef components
- Destructure props with defaults in parameter

### Styling (Tailwind)

- Use Tailwind utility classes
- Minimum touch target: 44px (`min-h-[44px]`)
- Use CSS variables for fonts from `globals.css`
- Custom animations defined in `globals.css`

## Project Structure

```
src/
  app/                    # Next.js App Router
    api/                  # API routes
    layout.tsx            # Root layout
    page.tsx              # Home page
    globals.css           # Global styles
  components/             # React components
    ui/                   # Reusable UI components
    providers/            # Context providers
  lib/                    # Utilities and configs
    auth/                 # NextAuth configuration
    supabase/             # Supabase clients
  types/                  # TypeScript interfaces
  utils/                  # Helper functions
```

## Database Conventions

- Use Supabase with Row Level Security (RLS)
- Map camelCase (TypeScript) to snake_case (PostgreSQL)
- Store timestamps in ISO format
- Always filter by `user_id` for user data

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Important Notes

- This project uses **Biome**, not ESLint or Prettier
- Uses **App Router** (file-based routing in `src/app/`), not Pages Router
- Always run `bun run lint` before committing
- RLS policies ensure users only access their own data
