# AKN Gig Companion (React + Vite)

Scan QR → landing page → browse/search/filter songs → GCash tip QR.
React 18 · Vite · TypeScript · Supabase · plain CSS · Vercel.

## Structure
```
src/
  components/  Hero · Setlist · SongFilter · SongCard · Tips · Footer (+ .css each)
  models/      song.model.ts
  services/    songService.ts   <- ONLY place that talks to Supabase
  data/        songs.ts         <- sample setlist (fallback)
  index.css                     <- theme tokens (colors, fonts)
supabase/schema.sql
```

## Development
```bash
npm install
cp .env.example .env     # optional: leave it out to use the sample songs
npm run dev              # http://localhost:5173
```

## Supabase
1. Create a project at supabase.com.
2. SQL Editor -> paste `supabase/schema.sql` -> Run.
3. Project Settings -> API: copy the Project URL and anon public key into `.env`
   as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Add/edit songs in Table Editor. Untick `is_active` to hide a song.

The anon key is meant to be public; Row Level Security only lets it read active songs.
Never use the service_role key here. Restart `npm run dev` after editing `.env`.

## Build
```bash
npm run build            # output: dist/
npm run preview          # test the production build locally
```

## Deploy to Vercel
1. Push to GitHub, then Vercel -> Add New Project -> import the repo (Vite is auto-detected).
2. Settings -> Environment Variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. Env vars are baked in at build time, so redeploy after changing them.
4. Generate your QR code from the final Vercel URL.

`vercel.json` rewrites all paths to `index.html` so routing works if you add pages later.

## Your GCash QR
Put the image in `public/` and set `GCASH_QR_SRC` in `src/components/Tips.tsx`.

## Enabling song requests later
`SongCard` already accepts `requestable` and `onRequest`. Set `requestsEnabled = true`
in `Setlist.tsx` and pass an `onRequest` handler.
