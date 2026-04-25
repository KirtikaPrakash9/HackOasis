# HackOasis

AI-powered hackathon management and talent hub for the UAE/MENA region.

## Stack

- Next.js 14 (App Router) + TypeScript
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

## Validation

```bash
npm run lint
npm run build
```

## Database

- Prisma schema: `prisma/schema.prisma`
- Supabase SQL + RLS policies: `supabase/migrations/0001_init.sql`
