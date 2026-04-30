-- Supabase Schema Configuration for SSB Bantang Junior

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: players
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  overall NUMERIC,
  category TEXT,
  position TEXT,
  photo TEXT,
  photourl TEXT,
  dribbling NUMERIC,
  passing NUMERIC,
  shooting NUMERIC,
  pace NUMERIC,
  strength NUMERIC,
  tactical NUMERIC,
  vision NUMERIC,
  teamwork NUMERIC,
  goals NUMERIC,
  assists NUMERIC,
  appearances NUMERIC,
  attendance NUMERIC,
  dob TEXT,
  age NUMERIC,
  stamina NUMERIC,
  jersey NUMERIC,
  status TEXT DEFAULT 'Aktif',
  height NUMERIC,
  weight NUMERIC,
  dominantfoot TEXT,
  parent_id TEXT,
  skillset JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: coaches
CREATE TABLE IF NOT EXISTS public.coaches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  experience TEXT,
  license TEXT,
  photo TEXT,
  photourl TEXT,
  specialty TEXT,
  rating NUMERIC,
  activeteams JSONB,
  phone TEXT,
  email TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'photo',
  url TEXT NOT NULL,
  title TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dashboard_sliders
CREATE TABLE IF NOT EXISTS public.dashboard_sliders (
  id TEXT PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  score TEXT,
  attendance TEXT,
  trend TEXT,
  trendup BOOLEAN,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: upcoming_matches
CREATE TABLE IF NOT EXISTS public.upcoming_matches (
  id TEXT PRIMARY KEY,
  date TEXT,
  time TEXT,
  location TEXT,
  rival TEXT,
  rivallogo TEXT,
  category TEXT,
  type TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: match_results
CREATE TABLE IF NOT EXISTS public.match_results (
  id TEXT PRIMARY KEY,
  date TEXT,
  rival TEXT,
  rivallogo TEXT,
  category TEXT,
  type TEXT,
  score TEXT,
  result TEXT,
  scorers TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  title TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  category TEXT,
  coach TEXT,
  capacity TEXT,
  registered TEXT,
  type TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: financials
CREATE TABLE IF NOT EXISTS public.financials (
  id TEXT PRIMARY KEY,
  title TEXT,
  amount TEXT,
  type TEXT,
  category TEXT,
  date TEXT,
  status TEXT,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: settings
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  app_name TEXT,
  logo_url TEXT,
  hero_bg_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Run the following in the Supabase SQL Editor to initialize storage
/*
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('players', 'players', true),
  ('settings', 'settings', true),
  ('gallery', 'gallery', true),
  ('coaches', 'coaches', true),
  ('dashboard', 'dashboard', true),
  ('matches', 'matches', true),
  ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Grant access policies to storage for public buckets
-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permissive Upload" ON storage.objects;

-- Create a single permissive policy for the MVP
-- This allows public/anon access to all buckets listed above
CREATE POLICY "Allow All Storage" ON storage.objects 
FOR ALL TO anon, authenticated, public 
USING (bucket_id IN ('players', 'settings', 'gallery', 'coaches', 'dashboard', 'matches', 'materials')) 
WITH CHECK (bucket_id IN ('players', 'settings', 'gallery', 'coaches', 'dashboard', 'matches', 'materials'));
*/

-- Set up Row Level Security (RLS)
-- Allow public access for now since this is an MVP without complex auth yet
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.players FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.coaches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.coaches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.coaches FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.gallery FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.gallery FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.dashboard_sliders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.dashboard_sliders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.dashboard_sliders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.dashboard_sliders FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.leaderboard FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.leaderboard FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.upcoming_matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.upcoming_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.upcoming_matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.upcoming_matches FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.match_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.match_results FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.match_results FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.schedules FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.financials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.financials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.financials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.financials FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.settings FOR DELETE USING (true);

-- Table: attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: training_materials
CREATE TABLE IF NOT EXISTS public.training_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  duration TEXT,
  age_group TEXT,
  level TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for new tables
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.attendance FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.training_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.training_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.training_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.training_materials FOR DELETE USING (true);

-- Table: tactics
CREATE TABLE IF NOT EXISTS public.tactics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mode TEXT DEFAULT '11v11',
  formation_id TEXT,
  strategy TEXT,
  positions JSONB,
  paths JSONB,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tactics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tactics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tactics FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.tactics FOR DELETE USING (true);

-- Table: match_stats
CREATE TABLE IF NOT EXISTS public.match_stats (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  possession NUMERIC,
  shots NUMERIC,
  shots_on_target NUMERIC,
  pass_accuracy NUMERIC,
  score TEXT,
  gk_saves NUMERIC,
  gk_conceded NUMERIC,
  gk_clean_sheet BOOLEAN,
  gk_save_pct NUMERIC,
  gk_high_claim NUMERIC,
  gk_punches NUMERIC,
  gk_sweeper NUMERIC,
  gk_errors NUMERIC,
  gk_dist_pct NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: player_match_stats
CREATE TABLE IF NOT EXISTS public.player_match_stats (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rating NUMERIC,
  goals NUMERIC,
  passing NUMERIC,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: coach_notes
CREATE TABLE IF NOT EXISTS public.coach_notes (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: match_highlights
CREATE TABLE IF NOT EXISTS public.match_highlights (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  title TEXT,
  url TEXT,
  category TEXT,
  minute TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-videos', 'match-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access on match-videos" ON storage.objects FOR SELECT USING (bucket_id = 'match-videos');
CREATE POLICY "Allow public insert access on match-videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'match-videos');
CREATE POLICY "Allow public update access on match-videos" ON storage.objects FOR UPDATE USING (bucket_id = 'match-videos');
CREATE POLICY "Allow public delete access on match-videos" ON storage.objects FOR DELETE USING (bucket_id = 'match-videos');

ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.match_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.match_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.match_stats FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.match_stats FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.player_match_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.player_match_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.player_match_stats FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.player_match_stats FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.coach_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.coach_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.coach_notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.coach_notes FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.match_highlights FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.match_highlights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.match_highlights FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.match_highlights FOR DELETE USING (true);

-- Table: goalkeeper_stats
CREATE TABLE IF NOT EXISTS public.goalkeeper_stats (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  reflex NUMERIC,
  diving NUMERIC,
  handling NUMERIC,
  positioning NUMERIC,
  instinct NUMERIC,
  distribution NUMERIC,
  kicking NUMERIC,
  throwing NUMERIC,
  reaction_speed NUMERIC,
  agility NUMERIC,
  shot_stopping NUMERIC,
  one_on_one NUMERIC,
  decision_making NUMERIC,
  composure NUMERIC,
  concentration NUMERIC,
  anticipation NUMERIC,
  passing_accuracy NUMERIC,
  jumping_reach NUMERIC,
  strength NUMERIC,
  balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goalkeeper_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.goalkeeper_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.goalkeeper_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.goalkeeper_stats FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.goalkeeper_stats FOR DELETE USING (true);
