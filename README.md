# Health Log

A health and wellness tracking application built with Next.js 16, React 19, and Tailwind CSS with user authentication.

## Features

- 🔐 **User Authentication** - Email/Password authentication with NextAuth v4
- 📊 **Weight Tracking** - Track body fat percentage, muscle mass, visceral fat, BMR, and BMI
- 📝 **Historical Records** - View all your past health metrics
- 🔒 **Data Privacy** - User data is isolated with Row-Level Security (RLS)
- 🎨 **Modern UI** - Clean interface with Tailwind CSS v4
- ⚡ **Fast & Secure** - Built on Next.js 16 with TypeScript

## Getting Started

### Prerequisites

- Bun (or npm/yarn/pnpm)
- A Supabase account (for database and authentication)

### Setup

1. **Install dependencies:**

```bash
bun install
```

2. **Set up Supabase and configure environment variables:**

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

See [QUICK_START.md](./docs/QUICK_START.md) for a quick setup guide, or [SETUP.md](./docs/SETUP.md) for detailed instructions on:
- Creating a Supabase project
- Setting up the database schema
- Configuring environment variables
- Testing the authentication flow

3. **Run the development server:**

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Development

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **NextAuth v4** - Authentication
- **Supabase** - Database & Auth backend
- **Tailwind CSS v4** - Styling
- **Biome** - Linting & formatting

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication API routes
│   │   └── weight/        # Weight metrics API
│   ├── auth/              # Auth pages (sign in/up)
│   ├── records/           # Records viewing page
│   ├── weight/            # Weight tracking page
│   └── layout.tsx         # Root layout with session
├── components/
│   ├── providers/         # Session provider
│   └── user-menu.tsx      # User menu component
├── lib/
│   ├── auth/              # NextAuth configuration
│   └── supabase/          # Supabase clients
└── types/                 # TypeScript type definitions
```

## Authentication Flow

1. User signs up with email/password at `/auth/signup`
2. Credentials stored securely in Supabase Auth
3. User signs in at `/auth/signin`
4. JWT session created with NextAuth
5. Protected routes accessible after authentication
6. User data isolated by Row-Level Security

## Security

- ✅ Passwords hashed with bcryptjs
- ✅ JWT sessions (stateless)
- ✅ Row-Level Security (RLS) on database
- ✅ Service role key only used server-side
- ✅ Protected routes with middleware
- ✅ User data isolated by user_id

## Documentation

- [QUICK_START.md](./docs/QUICK_START.md) - Quick setup guide (start here!)
- [SETUP.md](./docs/SETUP.md) - Detailed setup instructions
- [IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [CLAUDE.md](./CLAUDE.md) - Project conventions for AI assistance
- [supabase-schema.sql](./supabase-schema.sql) - Database schema
