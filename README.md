# Health Log

A health and wellness tracking application built with Next.js 16, React 19, and Tailwind CSS with user authentication.

## Features

- 🔐 **User Authentication** - Secure email/password authentication with NextAuth v4 and Supabase Auth
- 👤 **User Profile** - Collect demographic data (gender, date of birth, height) for accurate health calculations
- 📊 **Weight Tracking** - Track body fat percentage, muscle mass, visceral fat, BMR, and BMI
- ✏️ **Record Management** - Add, edit, and delete health records with real-time UI updates
- 📝 **Historical Records** - Paginated view of all past health metrics with chronological ordering
- 🔒 **Data Privacy** - Row-Level Security (RLS) ensures users only access their own data
- 🧮 **Health Calculations** - BMI, BMR (Mifflin-St Jeor), TDEE, and ideal weight calculations
- 🎨 **Modern UI** - Clean, responsive interface with Tailwind CSS v4
- ⚡ **Fast Performance** - Server-side rendering with Next.js 16 App Router
- 📱 **Mobile-Friendly** - Touch-friendly interface with minimum 44px touch targets
- 🔔 **Toast Notifications** - User feedback for all actions

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

Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

For database setup, see [supabase-schema.sql](./supabase-schema.sql).

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
│   │   ├── auth/
│   │   │   ├── [...nextauth]/     # NextAuth API routes
│   │   │   └── signup/            # User registration
│   │   ├── user/
│   │   │   └── profile/           # User profile CRUD API
│   │   └── weight/                # Weight metrics CRUD API
│   ├── auth/
│   │   ├── signin/                # Sign in page
│   │   └── signup/                # Sign up page
│   ├── profile/                   # User profile page
│   ├── records/                   # Historical records page
│   ├── weight/                    # Weight tracking form
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles & Tailwind
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── button.tsx
│   │   ├── confirm-dialog.tsx
│   │   └── input.tsx
│   ├── providers/                 # Context providers
│   ├── edit-record-modal.tsx
│   ├── profile-check.tsx          # Profile completion guard
│   ├── profile-form.tsx           # User profile form
│   ├── toast.tsx
│   └── user-menu.tsx
├── lib/
│   ├── auth/                      # NextAuth configuration
│   └── supabase/                  # Supabase clients
├── types/                         # TypeScript type definitions
└── utils/
    ├── date.ts                    # Date formatting utilities
    └── health-calculations.ts     # BMI, BMR, TDEE calculations
```

## Authentication Flow

1. User signs up with email/password at `/auth/signup`
2. Credentials stored securely in Supabase Auth
3. User signs in at `/auth/signin`
4. JWT session created with NextAuth
5. **New users are redirected to `/profile` to complete demographic information**
6. User enters gender, date of birth, and height
7. After profile completion, user can access `/weight` and `/records`
8. User data isolated by Row-Level Security

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### User Profile
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile (gender, dateOfBirth, height, name)

### Weight Metrics
- `GET /api/weight` - List user's weight records (paginated)
- `POST /api/weight` - Create new weight record
- `PUT /api/weight` - Update existing record
- `DELETE /api/weight?id={id}` - Delete record

## Health Calculations

The app uses demographic data (gender, age, height) for accurate health calculations:

### BMI (Body Mass Index)
- **Formula**: weight (kg) / (height (m))²
- **Categories**: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (≥30)

### BMR (Basal Metabolic Rate)
- **Method**: Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
- **Formula**: 
  - Male: 10 × weight + 6.25 × height - 5 × age + 5
  - Female: 10 × weight + 6.25 × height - 5 × age - 161

### TDEE (Total Daily Energy Expenditure)
- BMR × Activity Multiplier
- Activity levels: Sedentary (1.2), Light (1.375), Moderate (1.55), Active (1.725), Very Active (1.9)

### Ideal Weight Range
- Calculates healthy weight range based on BMI 18.5-24.9

## Security

- ✅ Passwords hashed with bcryptjs
- ✅ JWT sessions (stateless authentication)
- ✅ Row-Level Security (RLS) on all database tables
- ✅ Service role key only used server-side (never exposed to client)
- ✅ Protected routes with NextAuth middleware
- ✅ User data strictly isolated by user_id
- ✅ Input validation on all API endpoints
- ✅ Ownership verification before updates/deletions

## Database Setup

### New Projects
Run the complete schema in Supabase SQL Editor:
```sql
\i supabase-schema.sql
```

### Existing Projects
Apply the migration for existing databases:
```sql
\i migrations/001_add_user_demographics.sql
```

### User Table Schema
```sql
users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  height NUMERIC(5,2), -- in centimeters
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## Documentation

- [AGENTS.md](./AGENTS.md) - Development guidelines and code conventions for AI assistants
- [supabase-schema.sql](./supabase-schema.sql) - Database schema and setup
- [migrations/001_add_user_demographics.sql](./migrations/001_add_user_demographics.sql) - Database migration script
