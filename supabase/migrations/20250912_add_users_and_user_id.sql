-- Migration: 2025-09-12 - add users table and user_id FK columns
-- Purpose: Add a canonical users table and associate existing push_subscriptions and scheduled_notifications with users
-- Rollforward (apply):

BEGIN;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add user_id column to push_subscriptions
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add user_id column to scheduled_notifications
ALTER TABLE public.scheduled_notifications
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add FK constraints (idempotent using IF NOT EXISTS semantics via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_push_subscriptions_user'
  ) THEN
    ALTER TABLE public.push_subscriptions
      ADD CONSTRAINT fk_push_subscriptions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_scheduled_notifications_user'
  ) THEN
    ALTER TABLE public.scheduled_notifications
      ADD CONSTRAINT fk_scheduled_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Create RLS policies for users table
DO $$
BEGIN
  -- Users can read their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can read own data" ON public.users
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Users can update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can update own data" ON public.users
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Users can insert their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own data' AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can insert own data" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON public.push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id 
  ON public.scheduled_notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'handle_users_updated_at'
  ) THEN
    CREATE TRIGGER handle_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- Create function to handle new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, this is fine
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user record on auth.users insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

COMMIT;

-- Rollback notes (manual):
-- To rollback, run the following commands carefully (this will drop the users table and remove user_id columns):
-- 
-- BEGIN;
-- -- Drop triggers first
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
-- 
-- -- Drop functions
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.handle_updated_at();
-- 
-- -- Drop indexes
-- DROP INDEX IF EXISTS idx_scheduled_notifications_user_id;
-- DROP INDEX IF EXISTS idx_push_subscriptions_user_id;
-- 
-- -- Drop FK constraints
-- ALTER TABLE public.scheduled_notifications DROP CONSTRAINT IF EXISTS fk_scheduled_notifications_user;
-- ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS fk_push_subscriptions_user;
-- 
-- -- Drop user_id columns
-- ALTER TABLE public.scheduled_notifications DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.push_subscriptions DROP COLUMN IF EXISTS user_id;
-- 
-- -- Drop users table (this will also drop the RLS policies)
-- DROP TABLE IF EXISTS public.users;
-- COMMIT;
--
-- Note: Be careful with rollback as it will remove user associations from existing data

-- Migration tested locally via Supabase SQL editor. Example apply command:
-- psql "postgresql://<user>:<pass>@<host>:5432/<db>" -f supabase/migrations/20250912_add_users_and_user_id.sql
