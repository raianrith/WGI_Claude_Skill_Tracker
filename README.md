# Skill Tracker

Fun, slightly competitive dashboard for Weidert Group's **everyone builds 3 Claude Skills by October** rock.

People sign in with Google, ship skills, tag collaborators, upvote the library, and watch the agency progress bar fill up.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Auth, Postgres, Realtime)
- canvas-confetti
- Vercel (deploy target)

## Local setup

1. Copy env and fill values (already wired for the linked Supabase project in `.env.local` locally):

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_WORKSPACE_DOMAIN` | Google Workspace domain (default `weidert.com`) |

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

3. Supabase Auth
   - Enable Google provider
   - Redirect URLs: `http://localhost:3000/auth/callback` and your Vercel URL `/auth/callback`
   - Add the same domains to the Google OAuth client

4. Seed the `people` table yourself (no public signup). On first login we match `people.email` (case-insensitive) and set `auth_user_id`.

## Pages

| Route | What it does |
|---|---|
| `/login` | Google OAuth, workspace-domain check |
| `/` | Agency progress, milestones, roster pips, live ticker |
| `/library` | Search/filter/upvote + Surprise me |
| `/submit` | Ship a skill (confetti on success) |
| `/leaderboard` | Crowd favorites + category mix |
| `/not-on-roster` | Friendly bounce if email isn't seeded |

## Brand

Uses WGI tokens: suede `#112721`, antique `#A86A40`, orange `#FF6700`, League Gothic + Instrument Sans.
