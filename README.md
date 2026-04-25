# HackOasis

AI-powered hackathon management and talent hub for the UAE/MENA region.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v3
- Supabase (Auth, PostgreSQL, Storage, Realtime)
- Prisma ORM
- Zustand + TanStack Query
- react-hook-form + zod

## Design System (Neo-Brutalism)

- Colors: `#0A0A0A`, `#F5F0E8`, `#E8FF00`, `#FF4D00`, `#C8C4BC`
- Fonts: **DM Mono** for headings, **Instrument Sans** for body text
- 2–3px black borders, hard black shadow offsets, no blur gradients/glass

## Development

```bash
npm install
npm run dev
```

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

## Validation

```bash
npm run lint
npm run build
```

`npm run build` runs `prisma generate` first to avoid stale Prisma client issues on Vercel.

## Mock Data Demo Flow

- If database/auth envs are unavailable, events pages automatically fall back to rich mock data for demoing the product flow.
- Mock data is wired for:
  - Events listing (`/events`)
  - Event detail (`/events/[slug]`)
  - Organiser events dashboard (`/organise/events`)

## Database

- Prisma schema: `prisma/schema.prisma`
- Supabase SQL + RLS policies: `supabase/migrations/0001_init.sql`
