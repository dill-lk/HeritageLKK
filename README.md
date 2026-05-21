<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HeritageLK

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/efe95422-916a-4f3c-9137-34d15a0827cb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   (This project uses pnpm via Corepack.)
   `corepack enable`
   `corepack pnpm install`
2. Configure Supabase env values in `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_BASE_URL` (optional, set this to your hosted API origin for packaged Tauri builds)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client/Tauri)
   - `NVIDIA_API_KEY` (optional server-side fallback for Shingo/Archive generation)
3. Apply SQL in `supabase/sql/provider_api_keys.sql` to create the private key store table.
4. Insert provider keys (e.g. `gemini`, `nvidia`) into `private.api_keys` (see commented SQL insert examples in `supabase/sql/provider_api_keys.sql`).
5. Run the app:
   `corepack pnpm dev`

## Desktop Build

This app now uses Next.js for the web UI and Tauri for desktop packaging.

- `corepack pnpm dev` starts Next.js on port 3000 with local API routes.
- `corepack pnpm build` creates a static Next export in `out/`.
- `corepack pnpm tauri:dev` starts the Tauri shell against the Next dev server.
- `corepack pnpm tauri:build` packages the static `out/` bundle.

Static Tauri builds cannot run Next API routes inside the bundle. Keep private-key AI endpoints on a hosted API such as the existing Netlify function redirects, or move those operations into Tauri commands before relying on them offline.
