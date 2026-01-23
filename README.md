# Karmora App

The Karmora SaaS dashboard - AI-powered Reddit lead discovery and reply generation.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix)
- **Auth + DB:** Supabase (Auth + Postgres + Row Level Security)
- **Hosting:** Vercel
- **LLM:** Provider-agnostic wrapper (OpenAI/Anthropic)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd karmora-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `OPENAI_API_KEY` - Your OpenAI API key (for reply generation)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
karmora-app/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── leads/        # Leads dashboard
│   │   ├── settings/     # Settings page
│   │   └── templates/    # Reply templates
│   ├── api/              # API routes
│   │   ├── leads/        # Lead CRUD + refresh
│   │   └── onboarding/   # Save onboarding data
│   ├── onboarding/       # Onboarding flow
│   └── layout.tsx        # Root layout
├── components/
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── llm/              # LLM provider wrapper
│   └── supabase/         # Supabase clients
├── types/                # TypeScript types
└── supabase/
    └── schema.sql        # Database schema
```

## Features

- **Authentication** - Email/password auth with Supabase
- **Onboarding** - 6-step wizard for product profile and subreddit selection
- **Leads Dashboard** - View, filter, and manage Reddit leads
- **Reply Generation** - AI-powered reply drafting with one click
- **Templates** - Pre-built reply templates for common scenarios
- **Settings** - Manage product profile and subreddit targets

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Set these in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your app domain)
- `NEXT_PUBLIC_LANDING_URL` (your landing page domain)

## Related Repos

- **karmora-landing** - Marketing landing page (Vite + React)
