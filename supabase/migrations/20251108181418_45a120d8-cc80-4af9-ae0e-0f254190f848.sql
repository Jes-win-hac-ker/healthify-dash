-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vaccinations"
  ON public.vaccinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vaccinations"
  ON public.vaccinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vaccinations"
  ON public.vaccinations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create health_events table for yoga, blood donation, etc.
CREATE TABLE public.health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'yoga', 'donation', 'medical_camp'
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  trainer_name TEXT,
  color_theme TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_events ENABLE ROW LEVEL SECURITY;

-- Health events are public for all authenticated users
CREATE POLICY "Authenticated users can view health events"
  ON public.health_events FOR SELECT
  TO authenticated
  USING (true);

-- Create user_health_events junction table
CREATE TABLE public.user_health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.health_events(id) ON DELETE CASCADE,
  enrolled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.user_health_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event enrollments"
  ON public.user_health_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own event enrollments"
  ON public.user_health_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event enrollments"
  ON public.user_health_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for profile auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, age)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample health events
INSERT INTO public.health_events (title, description, event_type, event_date, location, trainer_name, color_theme)
VALUES 
  ('Yoga Group', 'Morning yoga session with expert trainer', 'yoga', NOW() + INTERVAL '2 days', 'Wellness Center', 'Sarah Johnson', 'yellow'),
  ('Blood Donation Campaign', 'Help save lives by donating blood', 'donation', NOW() + INTERVAL '5 days', 'Community Hospital', NULL, 'blue'),
  ('Medical Camp Detail', 'Free health checkup and consultation', 'medical_camp', NOW() + INTERVAL '7 days', 'City Square', 'Dr. Michael Chen', 'green');