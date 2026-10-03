-- ==============================================================================
-- SCHEMA SUPABASE : Application Compagnon JPO IPSA Lyon (Parcoursup)
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase (SQL Editor)
-- ==============================================================================

-- 1. Table des Événements de l'Agenda (Trajets, Conférences, Visites, Ateliers)
CREATE TABLE IF NOT EXISTS public.jpo_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'upcoming',
  notes TEXT DEFAULT '',
  highlight BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Table des Questions Clés & Checklist (Dossier, Prépa, Ingénieur, Logement)
CREATE TABLE IF NOT EXISTS public.jpo_tasks (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Table des Fiches de Notes / Stands (Simulateurs, Labos, Assos, Profs)
CREATE TABLE IF NOT EXISTS public.jpo_notes (
  id TEXT PRIMARY KEY,
  stand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_name TEXT DEFAULT '',
  contact_role TEXT DEFAULT '',
  contact_info TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  verdict TEXT DEFAULT 'tres_positif',
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  content TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Table du Compte Rendu & Synthèse (Parcoursup & Famille)
CREATE TABLE IF NOT EXISTS public.jpo_summary (
  id TEXT PRIMARY KEY DEFAULT 'main_summary',
  candidate_name TEXT DEFAULT '',
  jpo_date TEXT DEFAULT '',
  campus TEXT DEFAULT 'IPSA Lyon',
  overall_rating INTEGER DEFAULT 5,
  verdict TEXT DEFAULT 'grand_oui',
  top_reasons JSONB DEFAULT '[]'::jsonb,
  doubts_or_questions JSONB DEFAULT '[]'::jsonb,
  parcoursup_draft TEXT DEFAULT '',
  family_debrief_draft TEXT DEFAULT '',
  last_generated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_jpo_events_time ON public.jpo_events (start_time);
CREATE INDEX IF NOT EXISTS idx_jpo_tasks_completed ON public.jpo_tasks (completed);
CREATE INDEX IF NOT EXISTS idx_jpo_notes_rating ON public.jpo_notes (rating);

-- ==============================================================================
-- Sécurité & Politiques RLS (Row Level Security)
-- Permet l'accès complet avec la clé publique (anon) pour une utilisation simple
-- ==============================================================================
ALTER TABLE public.jpo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jpo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jpo_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jpo_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on jpo_events" ON public.jpo_events
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on jpo_tasks" ON public.jpo_tasks
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on jpo_notes" ON public.jpo_notes
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on jpo_summary" ON public.jpo_summary
  FOR ALL TO anon USING (true) WITH CHECK (true);
