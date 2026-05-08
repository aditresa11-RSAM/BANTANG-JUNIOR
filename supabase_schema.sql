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
  has_medical_history BOOLEAN DEFAULT false,
  medical_history TEXT,
  allergy_history TEXT,
  injury_history TEXT,
  medication_notes TEXT,
  health_notes TEXT,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'youtube', 'drive')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: training_schedule (Aliased logic for schedules)
CREATE TABLE IF NOT EXISTS public.training_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT,
  coach TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: match_analysis (Master record for analysis)
CREATE TABLE IF NOT EXISTS public.match_analysis (
  id TEXT PRIMARY KEY,
  match_date TEXT,
  rival TEXT,
  score TEXT,
  status TEXT DEFAULT 'Draft',
  highlights_count NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dashboard_sliders
CREATE TABLE IF NOT EXISTS public.dashboard_sliders (
  id TEXT PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  img TEXT,
  media_type TEXT DEFAULT 'image',
  video_url TEXT,
  autoplay BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
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

-- Table: attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: training_materials
CREATE TABLE IF NOT EXISTS public.training_materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  duration TEXT,
  age_group TEXT,
  level TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix missing columns for training_materials
ALTER TABLE IF EXISTS public.training_materials ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Table: tactics
CREATE TABLE IF NOT EXISTS public.tactics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT DEFAULT '11v11',
  formation_id TEXT,
  strategy TEXT,
  positions JSONB,
  paths JSONB,
  is_template BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix missing columns for tactics
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS formation_id TEXT;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS strategy TEXT;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS positions JSONB;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS paths JSONB;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.tactics ADD COLUMN IF NOT EXISTS notes TEXT;

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

-- Table: programs
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  agerange TEXT,
  description TEXT,
  descriptiondetail TEXT,
  targets TEXT,
  sessionsperweek TEXT,
  durationpersession TEXT,
  coach TEXT,
  image TEXT,
  videotext TEXT,
  type TEXT,
  totalplayers TEXT,
  kurikulumtext TEXT,
  materitext TEXT,
  jadwaltext TEXT,
  statistiktext TEXT,
  progresstext TEXT,
  absensitext TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  date TEXT,
  category TEXT,
  important BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- Allow public access for now since this is an MVP without complex auth yet
ALTER TABLE IF EXISTS public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.match_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dashboard_sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.upcoming_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.match_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goalkeeper_stats ENABLE ROW LEVEL SECURITY;

-- Helper to apply permissive policies to a table
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'players', 'coaches', 'gallery', 'training_schedule', 'match_analysis', 
        'dashboard_sliders', 'leaderboard', 'upcoming_matches', 'match_results', 
        'schedules', 'financials', 'settings', 'attendance', 'training_materials', 
        'tactics', 'match_stats', 'player_match_stats', 'coach_notes', 
        'match_highlights', 'programs', 'announcements', 'goalkeeper_stats'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public insert access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public update access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public delete access" ON public.%I', t);
        
        EXECUTE format('CREATE POLICY "Allow public read access" ON public.%I FOR SELECT USING (true)', t);
        EXECUTE format('CREATE POLICY "Allow public insert access" ON public.%I FOR INSERT WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow public update access" ON public.%I FOR UPDATE USING (true)', t);
        EXECUTE format('CREATE POLICY "Allow public delete access" ON public.%I FOR DELETE USING (true)', t);
    END LOOP;
END $$;

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('match-videos', 'match-videos', true),
  ('programs', 'programs', true),
  ('programs-videos', 'programs-videos', true),
  ('players', 'players', true),
  ('settings', 'settings', true),
  ('gallery', 'gallery', true),
  ('coaches', 'coaches', true),
  ('dashboard', 'dashboard', true),
  ('matches', 'matches', true),
  ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read access on match-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access on match-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access on match-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access on match-videos" ON storage.objects;

-- Permissive policy for all buckets
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects 
FOR ALL TO public, anon, authenticated
USING (true)
WITH CHECK (true);


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
