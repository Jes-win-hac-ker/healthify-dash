-- Add registration_type and registration_status to user_health_events table
ALTER TABLE public.user_health_events
ADD COLUMN registration_type TEXT CHECK (registration_type IN ('participant', 'volunteer')),
ADD COLUMN registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'cancelled', 'attended'));

-- Update existing records to have default values
UPDATE public.user_health_events
SET registration_type = 'participant'
WHERE registration_type IS NULL;

-- Make registration_type NOT NULL after setting defaults
ALTER TABLE public.user_health_events
ALTER COLUMN registration_type SET NOT NULL;
