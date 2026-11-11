# NovelPlatform

A production-ready AI-powered Novel Reading Platform.

## Architecture

- **Mobile Reader App**: Flutter (Android) - Clean Architecture with offline caching & AdMob integration
- **Admin Dashboard**: Next.js (App Router, Tailwind CSS, Supabase SSR)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Edge Functions, Storage)
- **AI Engine**: Google Gemini API via secure Supabase Edge Functions (Story Bible + Rolling Context Memory)
- **Monetization**: Google AdMob (Rewarded Video Ads for Coins, Native/Banner Ads)
  - 1 Ad Watched = 10 Coins
  - 1 Premium Chapter Unlock = 20 Coins (2 Ads = 1 Chapter Unlocked)

## Project Structure

```text
NovelPlatform/
├── apps/
│   ├── mobile/         # Flutter Android App
│   └── admin/          # Next.js Web Admin Dashboard
├── supabase/
│   ├── functions/      # Supabase Edge Functions (Deno / TypeScript)
│   ├── migrations/     # PostgreSQL Schemas, RLS Policies & Stored Procedures
│   └── seed.sql        # Initial Genres and Sample Novels
└── docs/               # System documentation, database schema & guides
```
