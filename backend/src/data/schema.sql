-- ==============================================================================
-- Presidency University CampusBuddy AI — PostgreSQL & Supabase Database Schema
-- ==============================================================================

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  usn TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Students can only view and update their own profile
CREATE POLICY "Students can view their own profile"
  ON public.student_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. Chat Sessions Table (Optional persistent sessions)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Helpdesk Conversation',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own chat sessions"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own chat sessions"
  ON public.chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);


-- 3. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view messages from their own sessions"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert messages to their own sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
