# Quickstart: Set up Supabase Auth for Homework App (Beginner-friendly)

This guide walks a beginner through configuring Supabase Auth and enabling Google/Apple providers. Keep a browser open and follow each step.

0) Install dependencies
   - Run `npm install` to ensure all packages including `@supabase/supabase-js` are installed
   - The project already includes Supabase in package.json

1) Create a Supabase project
   - Go to https://app.supabase.com and sign up.
   - Create a new project. Note the `PROJECT_URL` and `anon/public` keys from the project settings.

2) Enable Auth providers
   - In the Supabase dashboard, open Auth → Settings → External OAuth Providers.
   - For Google: follow link to create OAuth credentials in Google Cloud Console, add redirect URL `https://<your-project>.supabase.co/auth/v1/callback` and copy client ID/secret into Supabase.
   - For Apple: follow Apple's Developer docs to configure Sign in with Apple; paste credentials into Supabase.

3) Configure Email Magic Link
   - In Supabase Auth settings, enable "Email Magic Link" (passwordless) as an option.

4) Add a `users` table and columns to map subscriptions
   - Use SQL editor in Supabase and run SQL from `data-model.md`.

5) Set VAPID keys in Supabase (for web push)
   - Generate VAPID keys (e.g., using `npx web-push generate-vapid-keys`) and paste `VAPID_PUBLIC` and `VAPID_PRIVATE` into Supabase Function env vars where deliverer runs.

6) Update frontend config
   - Copy `.env.example` to `.env` in the project root
   - Add your Supabase project details to `.env`:
     ```bash
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
     ```
   - Get these values from your Supabase dashboard → Settings → API
   - For production/GitHub Pages, set these in GitHub repository secrets or use the `public/config.json` approach

7) Test locally
   - Run the frontend, sign in via magic link or Google, and verify the authenticated session appears in Settings.

8) Next steps
   - Run `/tasks` to generate implementation tasks and follow TDD flow to implement and test each piece.
