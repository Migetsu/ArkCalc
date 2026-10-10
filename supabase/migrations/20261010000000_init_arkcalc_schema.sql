-- 1. Drop existing triggers, functions, and old tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;

DROP TABLE IF EXISTS public.candidate_history CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.vacancies CASCADE;
DROP TABLE IF EXISTS public.org_unit_managers CASCADE;
DROP TABLE IF EXISTS public.org_units CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TABLE IF EXISTS public.planner_targets CASCADE;
DROP TABLE IF EXISTS public.user_rosters CASCADE;
DROP TABLE IF EXISTS public.user_inventories CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;

-- 2. Helper function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  doctor_id TEXT,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 120),
  server TEXT DEFAULT 'EN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. User Settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  server TEXT NOT NULL DEFAULT 'EN',
  language TEXT NOT NULL DEFAULT 'en',
  show_unreleased BOOLEAN NOT NULL DEFAULT false,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- 5. User Inventories table
CREATE TABLE public.user_inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_inventories_user_item_unique UNIQUE (user_id, item_id)
);

CREATE INDEX idx_user_inventories_user_id ON public.user_inventories(user_id);

ALTER TABLE public.user_inventories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON public.user_inventories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own inventory"
  ON public.user_inventories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON public.user_inventories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own inventory"
  ON public.user_inventories FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_user_inventories_updated_at
  BEFORE UPDATE ON public.user_inventories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. User Rosters table
CREATE TABLE public.user_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator_id TEXT NOT NULL,
  elite INTEGER NOT NULL DEFAULT 0 CHECK (elite >= 0 AND elite <= 2),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 90),
  potential INTEGER NOT NULL DEFAULT 1 CHECK (potential >= 1 AND potential <= 6),
  skill_level INTEGER NOT NULL DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 7),
  masteries JSONB NOT NULL DEFAULT '{}'::jsonb,
  modules JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_rosters_user_operator_unique UNIQUE (user_id, operator_id)
);

CREATE INDEX idx_user_rosters_user_id ON public.user_rosters(user_id);
CREATE INDEX idx_user_rosters_operator_id ON public.user_rosters(operator_id);

ALTER TABLE public.user_rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roster"
  ON public.user_rosters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own roster"
  ON public.user_rosters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roster"
  ON public.user_rosters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own roster"
  ON public.user_rosters FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_user_rosters_updated_at
  BEFORE UPDATE ON public.user_rosters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Planner Targets table
CREATE TABLE public.planner_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator_id TEXT NOT NULL,
  current_elite INTEGER NOT NULL DEFAULT 0 CHECK (current_elite >= 0 AND current_elite <= 2),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 90),
  current_skill_level INTEGER NOT NULL DEFAULT 1 CHECK (current_skill_level >= 1 AND current_skill_level <= 7),
  current_masteries JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_modules JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_elite INTEGER NOT NULL DEFAULT 0 CHECK (target_elite >= 0 AND target_elite <= 2),
  target_level INTEGER NOT NULL DEFAULT 1 CHECK (target_level >= 1 AND target_level <= 90),
  target_skill_level INTEGER NOT NULL DEFAULT 1 CHECK (target_skill_level >= 1 AND target_skill_level <= 7),
  target_masteries JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_modules JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_planner_targets_user_id ON public.planner_targets(user_id);
CREATE INDEX idx_planner_targets_operator_id ON public.planner_targets(operator_id);

ALTER TABLE public.planner_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planner targets"
  ON public.planner_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner targets"
  ON public.planner_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner targets"
  ON public.planner_targets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner targets"
  ON public.planner_targets FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_planner_targets_updated_at
  BEFORE UPDATE ON public.planner_targets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'standard',
  server TEXT NOT NULL DEFAULT 'EN',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  featured_operators JSONB NOT NULL DEFAULT '[]'::jsonb,
  rateup_operators JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_banners_server ON public.banners(server);
CREATE INDEX idx_banners_dates ON public.banners(start_date, end_date);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners are viewable by everyone"
  ON public.banners FOR SELECT
  USING (true);

CREATE POLICY "Admins or service role can insert banners"
  ON public.banners FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins or service role can update banners"
  ON public.banners FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins or service role can delete banners"
  ON public.banners FOR DELETE
  USING (auth.role() = 'service_role');

CREATE TRIGGER set_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
