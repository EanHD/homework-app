# Quickstart: Set up Supabase Auth for Homework App (Beginner-friendly)

This guide walks a beginner through configuring Supabase Auth and enabling Google/Apple providers. Keep a browser open and follow each step.

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
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your dev `.env` or `localStorage` overrides for testing.

7) Test locally
   - Run the frontend, sign in via magic link or Google, and verify the authenticated session appears in Settings.

8) Next steps
   - Run `/tasks` to generate implementation tasks and follow TDD flow to implement and test each piece.
